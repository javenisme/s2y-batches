"""Risk assessment endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Batch
from app.schemas.risk import (
    RiskAssessmentRequest,
    RiskAssessmentResponse,
    RiskFactor,
    ComparativeStats,
)

router = APIRouter()


@router.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(
    request: RiskAssessmentRequest,
    db: Session = Depends(get_db),
) -> RiskAssessmentResponse:
    """
    Calculate personalized risk score for a vaccine batch.

    Takes user profile (age, sex, conditions) and returns personalized risk assessment
    with contributing factors and comparative statistics.

    Note: This is a simplified implementation for Sprint 2.
    Full ML model integration will be in Sprint 3.
    """
    # Get batch data
    batch = db.query(Batch).filter(Batch.batch_code == request.batch_code).first()

    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{request.batch_code}' not found",
        )

    # Calculate base risk score (simplified logic for Sprint 2)
    # In Sprint 3, this will use the trained XGBoost model
    base_score = _calculate_base_risk_score(batch)

    # Apply user-specific adjustments
    user_adjustment = _calculate_user_adjustment(request.user_profile)

    # Calculate final risk score
    final_risk_score = min(10.0, max(0.0, base_score + user_adjustment))

    # Determine risk level
    if final_risk_score < 4.0:
        risk_level = "Low"
    elif final_risk_score < 7.0:
        risk_level = "Medium"
    else:
        risk_level = "High"

    # Calculate comparative stats
    global_avg = db.query(func.avg(Batch.risk_score)).scalar() or 4.2
    batch_avg = batch.risk_score or base_score

    # Calculate percentile (simplified)
    higher_count = (
        db.query(Batch).filter(Batch.risk_score > final_risk_score).count()
    )
    total_count = db.query(Batch).count()
    percentile = int((1 - higher_count / total_count) * 100) if total_count > 0 else 50

    # Build risk factors list
    risk_factors = _build_risk_factors(request.user_profile, base_score, user_adjustment)

    return RiskAssessmentResponse(
        batch_code=request.batch_code,
        manufacturer=batch.manufacturer,
        risk_score=round(final_risk_score, 2),
        risk_level=risk_level,
        confidence=0.75,  # Placeholder confidence for Sprint 2
        risk_factors=risk_factors,
        comparative_stats=ComparativeStats(
            batch_avg_severity=round(batch_avg, 2),
            global_avg_severity=round(global_avg, 2),
            percentile=percentile,
        ),
    )


def _calculate_base_risk_score(batch: Batch) -> float:
    """
    Calculate base risk score from batch statistics.

    This is a simplified heuristic for Sprint 2.
    Sprint 3 will replace this with trained XGBoost model.
    """
    # Weighted combination of severity metrics
    lethality_score = (batch.lethality_pct or 0) * 2.0  # Weight: 2x
    severe_score = (batch.severe_reports_pct or 0) * 0.5  # Weight: 0.5x

    # Normalize to 0-10 scale
    base_score = min(10.0, (lethality_score + severe_score) / 10)

    return base_score


def _calculate_user_adjustment(profile) -> float:
    """
    Calculate user-specific risk adjustment.

    Returns adjustment value to be added to base score.
    """
    adjustment = 0.0

    # Age factor
    if profile.age >= 65:
        adjustment += 1.5
    elif profile.age >= 50:
        adjustment += 1.0
    elif profile.age <= 18:
        adjustment += 0.5

    # Pre-existing conditions
    if profile.pre_existing_conditions:
        high_risk_conditions = {"diabetes", "hypertension", "heart disease", "copd"}
        matching = set(c.lower() for c in profile.pre_existing_conditions) & high_risk_conditions
        adjustment += len(matching) * 0.8

    # Previous COVID infection
    if profile.previous_covid_infection:
        adjustment -= 0.3  # Slight protective effect

    return adjustment


def _build_risk_factors(profile, base_score: float, adjustment: float) -> list[RiskFactor]:
    """Build list of risk factors with explanations."""
    factors = []

    # Age factor
    if profile.age >= 65:
        factors.append(
            RiskFactor(
                factor=f"Age {profile.age} (65+)",
                impact="+1.5",
                description="Older age groups have higher risk of severe adverse events",
            )
        )
    elif profile.age >= 50:
        factors.append(
            RiskFactor(
                factor=f"Age {profile.age} (50-64)",
                impact="+1.0",
                description="Middle-aged individuals show moderately elevated risk",
            )
        )

    # Pre-existing conditions
    if profile.pre_existing_conditions:
        conditions_str = ", ".join(profile.pre_existing_conditions[:3])
        if len(profile.pre_existing_conditions) > 3:
            conditions_str += f" (+{len(profile.pre_existing_conditions) - 3} more)"

        factors.append(
            RiskFactor(
                factor="Pre-existing conditions",
                impact=f"+{len(profile.pre_existing_conditions) * 0.8:.1f}",
                description=f"Conditions ({conditions_str}) may increase risk",
            )
        )

    # Previous COVID
    if profile.previous_covid_infection:
        factors.append(
            RiskFactor(
                factor="Previous COVID-19 infection",
                impact="-0.3",
                description="Prior infection may provide some protective immunity",
            )
        )

    # Batch severity
    if base_score > 6.0:
        factors.append(
            RiskFactor(
                factor="High batch severity",
                impact=f"+{base_score:.1f}",
                description="This batch has above-average adverse event reports",
            )
        )

    return factors


@router.get("/batch/{batch_code}", response_model=dict)
async def get_batch_risk_stats(
    batch_code: str,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get aggregate risk statistics for a batch (no personalization).

    Returns batch-level risk metrics without user-specific adjustments.
    """
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()

    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    return {
        "batch_code": batch.batch_code,
        "manufacturer": batch.manufacturer,
        "total_reports": batch.total_reports,
        "deaths": batch.deaths,
        "disabilities": batch.disabilities,
        "life_threatening": batch.life_threatening,
        "hospitalizations": batch.hospitalizations,
        "severe_reports_pct": float(batch.severe_reports_pct) if batch.severe_reports_pct else None,
        "lethality_pct": float(batch.lethality_pct) if batch.lethality_pct else None,
        "risk_score": float(batch.risk_score) if batch.risk_score else None,
    }
