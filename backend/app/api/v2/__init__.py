"""v2 API Router - Aggregates all v2 endpoints."""

from fastapi import APIRouter

from app.api.v2 import batch, region, symptom, composite

api_router = APIRouter()

# Include all v2 routers
api_router.include_router(batch.router, prefix="/risk/batch", tags=["Batch Risk V2"])
api_router.include_router(region.router, prefix="/risk/regional", tags=["Region Risk"])
api_router.include_router(symptom.router, prefix="/risk/symptom", tags=["Symptom Risk"])
api_router.include_router(composite.router, prefix="/risk", tags=["Composite Risk"])
