# backend/app/api/v1/routes/feedback.py
from fastapi import APIRouter

from app.schemas.request import FeedbackRequest
from app.schemas.response import FeedbackResponse
from app.services.feedback_service import save_feedback
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackRequest):
    """
    Store user feedback for model improvement.

    This endpoint saves:
    - Original model predictions
    - User-corrected labels

    The data is later used for retraining and improving
    detection accuracy.
    """

    logger.info(
        f"Feedback received | image_id={payload.image_id} | "
        f"original_items={len(payload.original_detected_items)} | "
        f"corrected_items={len(payload.corrected_items)}"
    )

    success = save_feedback(
        image_id=payload.image_id,
        original_items=payload.original_detected_items,
        corrected_items=payload.corrected_items,
    )

    if success:
        logger.info(
            f"Feedback saved successfully for image_id={payload.image_id}"
        )

        return FeedbackResponse(
            status="success",
            message="Feedback received and saved. Thank you!",
        )

    logger.error(
        f"Failed to save feedback for image_id={payload.image_id}"
    )

    return FeedbackResponse(
        status="error",
        message="Feedback could not be saved. Please try again.",
    )