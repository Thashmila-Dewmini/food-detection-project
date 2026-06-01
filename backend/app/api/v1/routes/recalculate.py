# backend/app/api/v1/routes/recalculate.py
from fastapi import APIRouter

from app.schemas.request import RecalculateRequest
from app.schemas.response import RecalculateResponse
from app.services.recalculate_service import recalculate_nutrition
from app.core.logging import logger


router = APIRouter()


@router.post("/", response_model=RecalculateResponse)
def recalculate(request: RecalculateRequest):
    """
    Recalculate nutrition values after the user manually
    edits portion sizes in the mobile application.

    This endpoint:
    - Accepts updated food item weights
    - Recomputes calories and macronutrients
    - Returns updated totals and item breakdown
    """

    logger.info(
        f"Recalculation request received | items={len(request.items)}"
    )

    result = recalculate_nutrition(request.items)

    logger.info("Recalculation completed successfully")

    return result