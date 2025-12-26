"""Batch endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models import Batch
from app.schemas.batch import BatchResponse, BatchSearchParams, BatchSearchResponse

router = APIRouter()


@router.get("/search", response_model=BatchSearchResponse)
async def search_batches(
    manufacturer: str | None = Query(None, description="Filter by manufacturer"),
    risk_score_min: float | None = Query(None, ge=0, le=10, description="Minimum risk score"),
    risk_score_max: float | None = Query(None, ge=0, le=10, description="Maximum risk score"),
    min_reports: int = Query(10, ge=0, description="Minimum number of reports"),
    limit: int = Query(50, ge=1, le=500, description="Maximum results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
) -> BatchSearchResponse:
    """
    Search vaccine batches with filters.

    Returns paginated list of batches matching the search criteria.
    """
    # Build query
    query = db.query(Batch).filter(Batch.total_reports >= min_reports)

    # Apply filters
    if manufacturer:
        query = query.filter(Batch.manufacturer == manufacturer)
    if risk_score_min is not None:
        query = query.filter(Batch.risk_score >= risk_score_min)
    if risk_score_max is not None:
        query = query.filter(Batch.risk_score <= risk_score_max)

    # Get total count
    total_count = query.count()

    # Apply pagination and ordering
    batches = (
        query.order_by(Batch.risk_score.desc().nullslast())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return BatchSearchResponse(
        batches=[BatchResponse.model_validate(batch) for batch in batches],
        total_count=total_count,
        limit=limit,
        offset=offset,
    )


@router.get("/{batch_code}", response_model=BatchResponse)
async def get_batch(
    batch_code: str,
    db: Session = Depends(get_db),
) -> BatchResponse:
    """
    Get detailed information for a specific batch code.

    Returns complete batch statistics including adverse events, severity metrics,
    and risk score.
    """
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()

    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    return BatchResponse.model_validate(batch)


@router.get("/{batch_code}/top-symptoms")
async def get_batch_top_symptoms(
    batch_code: str,
    limit: int = Query(20, ge=1, le=100, description="Number of top symptoms"),
    db: Session = Depends(get_db),
) -> dict:
    """
    Get top symptoms for a specific batch.

    Returns the most frequently reported symptoms with their counts and percentages.
    """
    # Verify batch exists
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(
            status_code=404,
            detail=f"Batch code '{batch_code}' not found",
        )

    # Query top symptoms (using raw SQL for simplicity in Sprint 2)
    # In production, this would use the materialized view or ORM
    query = f"""
        SELECT
            s.symptom_name,
            COUNT(*) as frequency,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
        FROM symptoms s
        JOIN adverse_events ae ON s.event_id = ae.id
        WHERE ae.batch_code = :batch_code
        GROUP BY s.symptom_name
        ORDER BY frequency DESC
        LIMIT :limit
    """

    result = db.execute(query, {"batch_code": batch_code, "limit": limit})
    symptoms = [
        {
            "symptom_name": row[0],
            "frequency": row[1],
            "percentage": float(row[2]),
        }
        for row in result
    ]

    return {
        "batch_code": batch_code,
        "total_symptoms": len(symptoms),
        "symptoms": symptoms,
    }
