from fastapi import APIRouter

from app.schemas.request import (
    RecalculateRequest
)

from app.schemas.response import (
    RecalculateResponse
)

from app.services.recalculate_service import (
    recalculate_nutrition
)

router = APIRouter()


@router.post(
    "/",
    response_model=RecalculateResponse
)
def recalculate(
    request: RecalculateRequest
):
    """
    Recalculate nutrition values after
    user manually edits portion sizes.
    """

    return recalculate_nutrition(
        request.items
    )