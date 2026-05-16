from fastapi import APIRouter
from app.schemas.request import FeedbackRequest
from app.schemas.response import FeedbackResponse
from app.services.feedback_service import save_feedback
from app.core.logging import logger

router = APIRouter()

@router.post("", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackRequest):
    """
    POST /api/v1/feedback
    Stores user-corrected predictions locally for future model retraining.
    """
    logger.info(f"Feedback received for image_id: {payload.image_id}")

    success = save_feedback(
        image_id=payload.image_id,
        original_items=payload.original_detected_items,
        corrected_items=payload.corrected_items
    )

    if success:
        return FeedbackResponse(
            status="success",
            message="Feedback received and saved. Thank you!"
        )
    else:
        return FeedbackResponse(
            status="error",
            message="Feedback could not be saved. Please try again."
        )