"""Symptom-related schemas for enhanced symptom details."""

from typing import Optional, List
from pydantic import BaseModel, Field


class SymptomDetailSchema(BaseModel):
    """Detailed symptom information."""
    symptom: str
    frequency: int
    percentage: float
    severity: str = Field(default="common", description="severe, common, or mild")
    avg_onset_days: Optional[float] = None
    median_duration_days: Optional[float] = None
    hospitalization_rate: Optional[float] = None
    mortality_rate: Optional[float] = None


class SymptomFilterSchema(BaseModel):
    """Filter for symptom queries."""
    severity: Optional[str] = Field(default="all", description="all, severe, common, or mild")
    dose_number: Optional[int] = Field(default=None, ge=1, le=5)
    date_range: Optional[str] = Field(default="all", description="7d, 30d, 90d, all")


class SymptomsResponseSchema(BaseModel):
    """Response with detailed symptoms."""
    batch_code: str
    total_symptoms: int
    symptoms: List[SymptomDetailSchema]
    date_range: dict


class SymptomTimeDistributionSchema(BaseModel):
    """Time distribution for symptoms."""
    range: str
    common_count: int
    severe_count: int


class RiskExplanationSchema(BaseModel):
    """Plain language risk explanation."""
    batch_code: str
    risk_score: float
    risk_level: str
    summary: str
    interpretation: str
    recommendations: List[str]
    calculation_method: str
    comparison_benchmark: dict
