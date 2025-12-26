"""Risk assessment schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class UserProfile(BaseModel):
    """User profile for risk assessment."""

    age: int = Field(..., ge=0, le=120, description="User age")
    sex: str = Field(..., pattern="^[MFU]$", description="Sex: M, F, or U (unknown)")
    pre_existing_conditions: Optional[List[str]] = Field(
        default=None,
        description="List of pre-existing medical conditions",
    )
    previous_covid_infection: bool = Field(default=False, description="Had previous COVID-19 infection")
    dose_number: Optional[int] = Field(default=None, ge=1, le=5, description="Vaccine dose number")

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "age": 45,
                "sex": "M",
                "pre_existing_conditions": ["hypertension", "diabetes"],
                "previous_covid_infection": True,
                "dose_number": 2,
            }
        }


class RiskAssessmentRequest(BaseModel):
    """Risk assessment request schema."""

    batch_code: str = Field(..., min_length=1, max_length=50, description="Vaccine batch code")
    user_profile: UserProfile

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "batch_code": "EN6201",
                "user_profile": {
                    "age": 45,
                    "sex": "M",
                    "pre_existing_conditions": ["hypertension"],
                    "previous_covid_infection": False,
                    "dose_number": 2,
                },
            }
        }


class RiskFactor(BaseModel):
    """Individual risk factor."""

    factor: str = Field(..., description="Risk factor name")
    impact: str = Field(..., description="Impact on risk score (e.g., '+1.5')")
    description: str = Field(..., description="Detailed description")


class ComparativeStats(BaseModel):
    """Comparative statistics."""

    batch_avg_severity: float = Field(..., description="Average severity for this batch")
    global_avg_severity: float = Field(..., description="Global average severity")
    percentile: int = Field(..., ge=0, le=100, description="Percentile rank (0-100)")


class RiskAssessmentResponse(BaseModel):
    """Risk assessment response schema."""

    batch_code: str
    manufacturer: str
    risk_score: float = Field(..., ge=0, le=10, description="Risk score from 0 (lowest) to 10 (highest)")
    risk_level: str = Field(..., description="Risk level: Low, Medium, or High")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence (0.0-1.0)")
    risk_factors: List[RiskFactor]
    comparative_stats: ComparativeStats
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "batch_code": "EN6201",
                "manufacturer": "Pfizer",
                "risk_score": 7.2,
                "risk_level": "Medium",
                "confidence": 0.85,
                "risk_factors": [
                    {
                        "factor": "Age group 40-50",
                        "impact": "+1.5",
                        "description": "Slightly elevated risk in this age group",
                    },
                    {
                        "factor": "Pre-existing conditions",
                        "impact": "+2.0",
                        "description": "Hypertension increases risk",
                    },
                ],
                "comparative_stats": {
                    "batch_avg_severity": 6.5,
                    "global_avg_severity": 4.2,
                    "percentile": 75,
                },
                "timestamp": "2025-12-25T10:30:00Z",
            }
        }
