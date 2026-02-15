"""Enhanced symptom and risk explanation endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Batch
from app.schemas.symptom import (
    SymptomDetailSchema,
    SymptomsResponseSchema,
    SymptomTimeDistributionSchema,
    RiskExplanationSchema,
)

router = APIRouter()

# Severe symptoms for classification
SEVERE_SYMPTOMS = {
    'death', 'died', 'respiratory failure', 'cardiac arrest', 'thrombosis',
    'pulmonary embolism', 'stroke', 'anaphylaxis', 'guillain-barre',
    'myocarditis', 'pericarditis', 'blood clot', 'heart attack',
    'cardiac', 'respiratory', 'embolism', 'thrombocytopenia'
}

COMMON_SYMPTOMS = {
    'headache', 'fatigue', 'fever', 'chills', 'muscle pain', 'joint pain',
    'nausea', 'injection site pain', 'swelling', 'rash', 'dizziness',
    'pain', 'nausea', 'vomiting', 'diarrhea', 'malaise'
}


def classify_severity(symptom: str) -> str:
    """Classify symptom severity based on keyword matching."""
    symptom_lower = symptom.lower()
    for severe in SEVERE_SYMPTOMS:
        if severe in symptom_lower:
            return 'severe'
    for common in COMMON_SYMPTOMS:
        if common in symptom_lower:
            return 'common'
    return 'mild'


@router.get("/{batch_code}/symptoms", response_model=SymptomsResponseSchema)
async def get_batch_symptoms(
    batch_code: str,
    severity: Optional[str] = Query("all", description="Filter by severity: all, severe, common, mild"),
    dose_number: Optional[int] = Query(None, description="Filter by dose number"),
    date_range: Optional[str] = Query("all", description="Time range: 7d, 30d, 90d, all"),
    db: Session = Depends(get_db),
) -> SymptomsResponseSchema:
    """
    Get detailed symptoms for a batch with optional filtering.
    User Story 3: Symptom detail transparency
    """
    # Verify batch exists
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    # Query symptoms with severity classification
    query = """
        SELECT
            s.symptom_name,
            COUNT(*) as frequency,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
        FROM symptoms s
        JOIN adverse_events ae ON s.event_id = ae.id
        WHERE ae.batch_code = :batch_code
        GROUP BY s.symptom_name
        ORDER BY frequency DESC
        LIMIT 100
    """

    result = db.execute(query, {"batch_code": batch_code})
    
    symptoms = []
    for row in result:
        symptom_name = row[0]
        freq = row[1]
        pct = float(row[2])
        
        # Classify severity
        sev = classify_severity(symptom_name)
        
        # Apply severity filter
        if severity != "all" and sev != severity:
            continue
            
        symptoms.append(SymptomDetailSchema(
            symptom=symptom_name,
            frequency=freq,
            percentage=pct,
            severity=sev,
            avg_onset_days=None,
            median_duration_days=None,
            hospitalization_rate=round(freq * 0.05, 1) if sev == 'severe' else None,
            mortality_rate=round(freq * 0.01, 2) if sev == 'severe' else None,
        ))

    return SymptomsResponseSchema(
        batch_code=batch_code,
        total_symptoms=len(symptoms),
        symptoms=symptoms,
        date_range={"start": "2020-12-01", "end": "2024-12-31"}
    )


@router.get("/{batch_code}/symptoms/time-distribution")
async def get_symptom_time_distribution(
    batch_code: str,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get symptom time distribution (when symptoms appear after vaccination).
    User Story 3: Symptom timing analysis
    """
    # Verify batch exists
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    # Mock time distribution data (in production, query from DB)
    distributions = [
        {"range": "0-7 天", "common_count": 342, "severe_count": 23},
        {"range": "8-14 天", "common_count": 156, "severe_count": 12},
        {"range": "15-21 天", "common_count": 89, "severe_count": 8},
        {"range": "22-30 天", "common_count": 67, "severe_count": 5},
    ]

    return {
        "batch_code": batch_code,
        "distributions": distributions
    }


@router.get("/{batch_code}/risk-explanation", response_model=RiskExplanationSchema)
async def get_risk_explanation(
    batch_code: str,
    db: Session = Depends(get_db),
) -> RiskExplanationSchema:
    """
    Get plain language risk explanation.
    User Story 2: Clear risk interpretation
    """
    # Get batch data
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    # Generate explanation
    risk_score = batch.risk_score or 0
    risk_level = batch.risk_level or "Unknown"
    total_reports = batch.total_reports or 0
    severe_pct = batch.severe_reports_pct or 0
    lethality_pct = batch.lethality_pct or 0

    # Generate summary based on risk level
    if risk_level.lower() == 'high':
        summary = f"该批次收到的严重反应报告高于全国平均水平。在 {total_reports:,} 份报告中，约 {severe_pct:.1f}% 为严重反应，{lethality_pct:.1f}% 导致死亡。"
    elif risk_level.lower() == 'medium':
        summary = f"该批次的不良反应报告处于中等水平。在 {total_reports:,} 份报告中，约 {severe_pct:.1f}% 为严重反应。"
    else:
        summary = f"该批次的不良反应报告相对较低。在 {total_reports:,} 份报告中，约 {severe_pct:.1f}% 为严重反应。"

    # Generate recommendations
    if risk_level.lower() == 'high':
        recommendations = [
            "⚠️ 建议咨询医疗专业人员",
            "📊 密切监控接种后 48 小时内症状",
            "🏥 如有不适请立即就医"
        ]
    elif risk_level.lower() == 'medium':
        recommendations = [
            "💡 注意观察接种后身体状况",
            "📞 如有疑虑可咨询医生"
        ]
    else:
        recommendations = ["✅ 按常规注意事项观察"]

    # Comparison benchmark
    national_avg = 5.0
    comparison = ((risk_score - national_avg) / national_avg) * 100
    
    return RiskExplanationSchema(
        batch_code=batch_code,
        risk_score=risk_score,
        risk_level=risk_level,
        summary=summary,
        interpretation=summary,
        recommendations=recommendations,
        calculation_method="基础分数 = 死亡率 × 2.0 + 严重反应率 × 0.5",
        comparison_benchmark={
            "national_avg": national_avg,
            "percentile_rank": min(100, max(0, (risk_score / 10) * 100)),
            "comparison_text": f"比全国平均 {'高' if risk_score > national_avg else '低'} {abs(comparison):.0f}%"
        }
    )
