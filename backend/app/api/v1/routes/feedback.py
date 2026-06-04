# backend/app/api/v1/routes/feedback.py
from fastapi import APIRouter

from app.schemas.request import FeedbackRequest
from app.schemas.response import FeedbackResponse
from app.services.feedback_service import save_feedback
from app.services.feedback_validation_service import validate_feedback
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackRequest):
    """
    Validate and store user feedback for model improvement.

    Pipeline:
    1. Layer 1 — Rule-based sanity checks (portion weights,
       item count, calorie plausibility, high-confidence removals)
    2. If validation passes  -> save feedback for retraining
    3. If validation fails   -> return rejection reasons to client
       without saving, so bad data never enters the training pipeline.
    """

    logger.info(
        f"Feedback received | image_id={payload.image_id} | "
        f"original_items={len(payload.original_detected_items)} | "
        f"corrected_items={len(payload.corrected_items)}"
    )

    # Layer 1: Rule-based validation

    validation = validate_feedback(
        original_detected_items=payload.original_detected_items,
        corrected_items=payload.corrected_items,
    )

    if not validation["valid"]:
        logger.warning(
            f"Feedback rejected (Layer-1) for image_id={payload.image_id} | "
            f"reasons={validation['reasons']}"
        )

        return FeedbackResponse(
            status="rejected",
            message="Your correction could not be saved because it did not "
                    "pass our validation checks. Please review and try again.",
            reasons=validation["reasons"],
        )


    # Validation passed — safe to persist
  
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
            reasons=[],
        )

    logger.error(
        f"Failed to save feedback for image_id={payload.image_id}"
    )

    return FeedbackResponse(
        status="error",
        message="Feedback could not be saved. Please try again.",
        reasons=[],
    )

    