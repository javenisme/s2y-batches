"""Batch schemas."""

from typing import Optional, List, Dict
from datetime import date
from pydantic import BaseModel, Field


class BatchResponse(BaseModel):
    """Batch response schema."""

    batch_code: str
    manufacturer: str
    vaccine_type: str = "COVID-19"
    total_reports: int
    deaths: int
    disabilities: int
    life_threatening: int
    hospitalizations: int
    severe_reports_pct: Optional[float] = None
    lethality_pct: Optional[float] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    first_report_date: Optional[date] = None
    last_report_date: Optional[date] = None
    country_distribution: Optional[Dict[str, int]] = None
    state_distribution: Optional[Dict[str, int]] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class BatchSearchParams(BaseModel):
    """Batch search parameters."""

    manufacturer: Optional[str] = Field(None, description="Filter by manufacturer")
    risk_score_min: Optional[float] = Field(None, ge=0, le=10, description="Minimum risk score")
    risk_score_max: Optional[float] = Field(None, ge=0, le=10, description="Maximum risk score")
    min_reports: int = Field(10, ge=0, description="Minimum number of adverse event reports")
    limit: int = Field(50, ge=1, le=500, description="Maximum number of results")
    offset: int = Field(0, ge=0, description="Pagination offset")

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "manufacturer": "Pfizer",
                "risk_score_min": 5.0,
                "risk_score_max": 10.0,
                "min_reports": 100,
                "limit": 20,
                "offset": 0,
            }
        }


class BatchSearchResponse(BaseModel):
    """Batch search response."""

    batches: List[BatchResponse]
    total_count: int
    limit: int
    offset: int

    class Config:
        """Pydantic config."""
        from_attributes = True
