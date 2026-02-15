"""API v1 package."""

from fastapi import APIRouter

from app.api.v1 import batch, risk, symptom

api_router = APIRouter()

# Include routers
api_router.include_router(batch.router, prefix="/batch", tags=["batch"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
api_router.include_router(symptom.router, prefix="/batch", tags=["symptoms"])
