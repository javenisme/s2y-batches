"""Composite risk endpoint - combines batch, region, and symptom risk."""

from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


# ============ Models ============

class UserProfileInput(BaseModel):
    """User profile for composite assessment."""
    age: int
    sex: str
    pre_existing_conditions: Optional[List[str]] = None
    previous_covid_infection: bool = False
    dose_number: Optional[int] = None


class CompositeRiskFactor(BaseModel):
    """Individual risk factor."""
    factor: str
    source: str  # batch, region, symptom, user
    impact: str
    description: str


class CompositeComparativeStats(BaseModel):
    """Comparative statistics for composite risk."""
    your_risk: float
    batch_avg: float
    region_avg: float
    national_avg: float


class CompositeAssessRequest(BaseModel):
    """Request for composite risk assessment."""
    batch_code: str
    zipcode: Optional[str] = None
    symptoms: Optional[List[str]] = None
    user_profile: Optional[UserProfileInput] = None


class ActionRecommendation(BaseModel):
    """Action recommendation."""
    priority: str  # low, medium, high, critical
    action: str
    description: str


class CompositeAssessResponse(BaseModel):
    """Response for composite risk assessment."""
    # Identification
    batch_code: str
    zipcode: Optional[str] = None
    assessment_timestamp: str
    
    # Overall risk
    overall_risk_score: float
    risk_level: str
    confidence: float
    
    # Component scores
    batch_risk_score: float
    region_risk_score: Optional[float] = None
    symptom_risk_score: Optional[float] = None
    user_risk_score: Optional[float] = None
    
    # Factors
    risk_factors: List[CompositeRiskFactor]
    
    # Comparison
    comparative_stats: CompositeComparativeStats
    
    # Recommendations
    recommendations: List[ActionRecommendation]
    
    # Warnings
    warnings: List[str]


# ============ Endpoints ============

@router.post("/composite", response_model=CompositeAssessResponse)
async def assess_composite_risk(request: CompositeAssessRequest):
    """
    Perform comprehensive risk assessment combining:
    - Batch risk
    - Regional risk (if zipcode provided)
    - Symptom risk (if symptoms provided)
    - User profile risk (if provided)
    """
    # TODO: Connect to actual data sources and implement calculation
    
    # Mock response for demonstration
    batch_risk_score = 7.2
    region_risk_score = None
    symptom_risk_score = None
    user_risk_score = None
    
    # Calculate based on provided inputs
    if request.zipcode:
        region_risk_score = 5.8
    
    if request.symptoms:
        symptom_risk_score = 7.8
    
    if request.user_profile:
        # Calculate user-specific adjustment
        user_adjustment = 0.0
        if request.user_profile.age >= 65:
            user_adjustment += 1.5
        if request.user_profile.pre_existing_conditions:
            user_adjustment += len(request.user_profile.pre_existing_conditions) * 0.5
        user_risk_score = batch_risk_score + user_adjustment
    
    # Calculate overall risk (weighted average)
    components = [batch_risk_score]
    weights = [0.5]  # Base weight for batch
    
    if region_risk_score:
        components.append(region_risk_score)
        weights.append(0.2)
    
    if symptom_risk_score:
        components.append(symptom_risk_score)
        weights.append(0.2)
    
    if user_risk_score:
        components.append(user_risk_score)
        weights.append(0.1)
    
    total_weight = sum(weights)
    overall_risk = sum(c * w for c, w in zip(components, weights)) / total_weight
    
    # Determine risk level
    if overall_risk < 4:
        risk_level = "Low"
    elif overall_risk < 7:
        risk_level = "Medium"
    elif overall_risk < 8:
        risk_level = "High"
    else:
        risk_level = "Critical"
    
    # Build risk factors
    risk_factors = [
        CompositeRiskFactor(
            factor="Batch severity",
            source="batch",
            impact="+2.5",
            description="This batch has higher than average adverse event reports"
        )
    ]
    
    if region_risk_score and region_risk_score > 6:
        risk_factors.append(CompositeRiskFactor(
            factor="Regional risk",
            source="region",
            impact="+1.0",
            description="This area has elevated vaccination risk factors"
        ))
    
    if symptom_risk_score and symptom_risk_score > 6:
        risk_factors.append(CompositeRiskFactor(
            factor="Symptom combination",
            source="symptom",
            impact="+2.0",
            description="Reported symptoms indicate elevated risk"
        ))
    
    if request.user_profile and request.user_profile.age >= 65:
        risk_factors.append(CompositeRiskFactor(
            factor="Age 65+",
            source="user",
            impact="+1.5",
            description="Older adults have higher risk for adverse events"
        ))
    
    # Build recommendations
    recommendations = []
    if overall_risk >= 7:
        recommendations.append(ActionRecommendation(
            priority="high",
            action="Consult healthcare provider",
            description="Discuss risks and benefits with your doctor before vaccination"
        ))
        recommendations.append(ActionRecommendation(
            priority="high",
            action="Monitor closely",
            description="Be prepared to seek medical attention if symptoms appear"
        ))
    else:
        recommendations.append(ActionRecommendation(
            priority="low",
            action="Standard vaccination",
            description="Proceed with standard vaccination process"
        ))
    
    # Warnings
    warnings = []
    if symptom_risk_score and symptom_risk_score >= 8:
        warnings.append("Reported symptoms require immediate medical attention")
    
    return CompositeAssessResponse(
        batch_code=request.batch_code,
        zipcode=request.zipcode,
        assessment_timestamp=datetime.utcnow().isoformat(),
        overall_risk_score=round(overall_risk, 2),
        risk_level=risk_level,
        confidence=0.78,
        batch_risk_score=batch_risk_score,
        region_risk_score=region_risk_score,
        symptom_risk_score=symptom_risk_score,
        user_risk_score=user_risk_score,
        risk_factors=risk_factors,
        comparative_stats=CompositeComparativeStats(
            your_risk=round(overall_risk, 2),
            batch_avg=5.8,
            region_avg=region_risk_score or 4.5,
            national_avg=4.2
        ),
        recommendations=recommendations,
        warnings=warnings
    )


@router.get("/recommendations")
async def get_recommendations(
    risk_score: float,
    age: int = None,
    conditions: str = None
):
    """
    Get personalized recommendations based on risk score and user profile.
    """
    # TODO: Implement recommendation engine
    recommendations = []
    
    if risk_score >= 8:
        recommendations = [
            {
                "priority": "critical",
                "action": "Consult specialist",
                "description": "Schedule appointment with healthcare provider to discuss vaccination decision"
            },
            {
                "priority": "high",
                "action": "Emergency plan",
                "description": "Know emergency contact numbers and nearest hospital locations"
            }
        ]
    elif risk_score >= 6:
        recommendations = [
            {
                "priority": "medium",
                "action": "Medical consultation",
                "description": "Discuss with doctor before vaccination"
            },
            {
                "priority": "medium",
                "action": "Observation period",
                "description": "Plan to stay near medical facilities for 24-48 hours post-vaccination"
            }
        ]
    else:
        recommendations = [
            {
                "priority": "low",
                "action": "Proceed normally",
                "description": "Standard vaccination protocol applies"
            }
        ]
    
    return {
        "risk_score": risk_score,
        "recommendations": recommendations
    }
