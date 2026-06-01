# backend/app/api/v1/routes/health.py
from fastapi import APIRouter

from app.schemas.response import HealthResponse
from app.core.logging import logger


router = APIRouter()


@router.get("", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint.

    Used by:
    - Mobile app startup verification
    - Backend uptime monitoring
    - Debugging connectivity issues
    """

    logger.info("Health check requested")

    return HealthResponse(
        status="ok",
        message="NutriSight API is running successfully.",
    )