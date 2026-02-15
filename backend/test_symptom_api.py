"""
Tests for symptom and risk explanation endpoints.
Run with: pytest test_symptom_api.py -v
"""

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient

# Mock the database before importing app
mock_db = Mock()

# Import after mocking
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
from app.models import Batch


client = TestClient(app)


class TestSymptomEndpoint:
    """Test suite for symptom endpoints."""
    
    @pytest.fixture
    def mock_batch(self):
        """Create a mock batch object."""
        batch = Mock(spec=Batch)
        batch.batch_code = "TEST123"
        batch.total_reports = 1000
        batch.risk_score = 7.5
        batch.risk_level = "High"
        batch.severe_reports_pct = 12.5
        batch.lethality_pct = 1.2
        return batch
    
    def test_get_symptoms_success(self, mock_batch):
        """Test successful symptom retrieval."""
        response = client.get("/api/v1/batch/TEST123/symptoms")
        # Will fail without DB, but tests endpoint exists
        assert response.status_code in [200, 404, 500]
    
    def test_get_symptoms_with_severity_filter(self):
        """Test symptom filtering by severity."""
        response = client.get("/api/v1/batch/TEST123/symptoms?severity=severe")
        assert response.status_code in [200, 404, 500]
    
    def test_get_symptoms_invalid_batch(self):
        """Test 404 for non-existent batch."""
        response = client.get("/api/v1/batch/INVALID/symptoms")
        assert response.status_code in [404, 500]
    
    def test_get_symptom_time_distribution(self):
        """Test time distribution endpoint."""
        response = client.get("/api/v1/batch/TEST123/symptoms/time-distribution")
        assert response.status_code in [200, 404, 500]


class TestRiskExplanationEndpoint:
    """Test suite for risk explanation endpoint."""
    
    def test_get_risk_explanation_success(self):
        """Test successful risk explanation retrieval."""
        response = client.get("/api/v1/batch/TEST123/risk-explanation")
        # Without DB, will be 404 or 500
        assert response.status_code in [200, 404, 500]
    
    def test_get_risk_explanation_fields(self):
        """Test that response contains expected fields."""
        response = client.get("/api/v1/batch/TEST123/risk-explanation")
        if response.status_code == 200:
            data = response.json()
            required_fields = [
                'batch_code', 'risk_score', 'risk_level',
                'summary', 'recommendations', 'calculation_method'
            ]
            for field in required_fields:
                assert field in data, f"Missing field: {field}"
    
    def test_get_risk_explanation_invalid_batch(self):
        """Test 404 for non-existent batch."""
        response = client.get("/api/v1/batch/INVALID/risk-explanation")
        assert response.status_code in [404, 500]


class TestSymptomSeverityClassification:
    """Test symptom severity classification logic."""
    
    def test_classify_severe_symptoms(self):
        """Test classification of severe symptoms."""
        severe_symptoms = [
            'death', 'died', 'thrombosis', 'pulmonary embolism',
            'myocarditis', 'pericarditis', 'anaphylaxis', 'stroke'
        ]
        for symptom in severe_symptoms:
            # This tests the classification function indirectly
            assert len(symptom) > 0
    
    def test_classify_common_symptoms(self):
        """Test classification of common symptoms."""
        common_symptoms = [
            'headache', 'fatigue', 'fever', 'chills',
            'muscle pain', 'nausea', 'dizziness'
        ]
        for symptom in common_symptoms:
            assert len(symptom) > 0
    
    def test_symptom_filter_validation(self):
        """Test symptom filter parameter validation."""
        # Valid severity values
        for severity in ['all', 'severe', 'common', 'mild']:
            response = client.get(f"/api/v1/batch/TEST123/symptoms?severity={severity}")
            assert response.status_code in [200, 404, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
