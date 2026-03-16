"""Batch risk endpoints - v2 with trend and compare."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


# ============ Models ============

class TrendDataPoint(BaseModel):
    """Data point for trend chart."""
    month: str
    count: int


class BatchTrend(BaseModel):
    """Batch trend analysis response."""
    batch_code: str
    trend_direction: str  # increasing, decreasing, stable
    reports_over_time: List[TrendDataPoint]
    anomaly_detected: bool
    anomaly_details: Optional[str] = None
    confidence_interval: tuple  # (lower, upper)
    percentile: int
    peak_month: str
    current_month: str


class CompareStats(BaseModel):
    """Comparison statistics."""
    your_batch: float
    comparison_avg: float
    global_avg: float


class BatchCompare(BaseModel):
    """Batch comparison response."""
    batch_code: str
    comparison_type: str  # same_manufacturer, same_vaccine_type, global
    statistics: CompareStats
    statistical_significance: str
    recommendation: str
    percent_higher_than_avg: float


class BatchSymptoms(BaseModel):
    """Batch symptoms response."""
    batch_code: str
    total_symptom_reports: int
    symptoms: List[dict]
    symptom_network_url: Optional[str] = None


class BatchConfidence(BaseModel):
    """Batch confidence interval response."""
    batch_code: str
    risk_score: float
    confidence_level: str  # high, medium, low
    confidence_interval: tuple
    sample_size: int
    margin_of_error: float


# ============ Endpoints ============

@router.get("/{batch_code}/trend", response_model=BatchTrend)
async def get_batch_trend(
    batch_code: str,
    period: str = Query("12m", description="Time period: 3m, 6m, 12m, all")
):
    """
    Get trend analysis for a batch.
    Shows reports over time with anomaly detection.
    """
    # TODO: Connect to actual data source
    return BatchTrend(
        batch_code=batch_code,
        trend_direction="decreasing",
        reports_over_time=[
            {"month": "2024-01", "count": 45},
            {"month": "2024-02", "count": 52},
            {"month": "2024-03", "count": 38},
            {"month": "2024-04", "count": 28},
            {"month": "2024-05", "count": 22},
            {"month": "2024-06", "count": 18}
        ],
        anomaly_detected=True,
        anomaly_details="February 2024 shows 52 reports, significantly higher than trend",
        confidence_interval=(6.2, 8.1),
        percentile=72,
        peak_month="2024-02",
        current_month="2024-06"
    )


@router.get("/{batch_code}/compare", response_model=BatchCompare)
async def compare_batch(
    batch_code: str,
    comparison_type: str = Query("same_manufacturer", description="same_manufacturer, same_vaccine_type, global")
):
    """
    Compare batch risk to similar batches.
    """
    # TODO: Connect to actual data source
    return BatchCompare(
        batch_code=batch_code,
        comparison_type=comparison_type,
        statistics=CompareStats(
            your_batch=7.2,
            comparison_avg=5.8,
            global_avg=4.2
        ),
        statistical_significance="p<0.05",
        recommendation="This batch shows higher risk than manufacturer average. Consider consulting healthcare provider.",
        percent_higher_than_avg=23
    )


@router.get("/{batch_code}/confidence", response_model=BatchConfidence)
async def get_batch_confidence(batch_code: str):
    """
    Get confidence interval for batch risk score.
    """
    # TODO: Connect to actual data source
    return BatchConfidence(
        batch_code=batch_code,
        risk_score=7.2,
        confidence_level="high",
        confidence_interval=(6.2, 8.1),
        sample_size=1234,
        margin_of_error=0.95
    )


@router.get("/{batch_code}/symptoms", response_model=BatchSymptoms)
async def get_batch_symptoms(
    batch_code: str,
    limit: int = Query(10, description="Number of top symptoms")
):
    """
    Get top symptoms associated with a batch.
    """
    # TODO: Connect to actual data source
    return BatchSymptoms(
        batch_code=batch_code,
        total_symptom_reports=3500,
        symptoms=[
            {
                "name": "Headache",
                "frequency": 450,
                "percentage": 12.9,
                "severity_level": 2,
                "critical_percentage": 0.8
            },
            {
                "name": "Fatigue",
                "frequency": 380,
                "percentage": 10.9,
                "severity_level": 2,
                "critical_percentage": 0.5
            },
            {
                "name": "Fever",
                "frequency": 320,
                "percentage": 9.1,
                "severity_level": 2,
                "critical_percentage": 0.3
            },
            {
                "name": "Injection site pain",
                "frequency": 280,
                "percentage": 8.0,
                "severity_level": 1,
                "critical_percentage": 0.1
            },
            {
                "name": "Nausea",
                "frequency": 220,
                "percentage": 6.3,
                "severity_level": 2,
                "critical_percentage": 0.4
            }
        ],
        symptom_network_url=f"/api/v2/risk/symptom/network?batch={batch_code}"
    )
