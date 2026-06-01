# backend/app/api/v1/routes/analyze.py
from fastapi import APIRouter, UploadFile, File

from app.schemas.response import (
    AnalyzeResponse,
    DetectedItem,
    BoundingBox,
)

from app.services.yolo_service import run_detection_from_bytes
from app.services import nutrition_service
from app.utils.image_utils import (
    validate_image_bytes,
    get_image_dimensions,
)
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=AnalyzeResponse)
async def analyze_food_image(
    image: UploadFile = File(...)
):
    """
    Analyze uploaded food image and return:

    1. Detected food items (YOLOv8)
    2. Nutrition estimation per item
    3. Total nutrition summary
    4. Calorie impact classification

    This endpoint represents the full AI pipeline.
    """

    # --------------------------------------------------------
    # Step 1: Read uploaded file into memory
    # --------------------------------------------------------
    file_bytes = await image.read()
    content_type = image.content_type or ""

    logger.info(
        f"Image received: {image.filename}, "
        f"type={content_type}, "
        f"size={len(file_bytes)} bytes"
    )

    # --------------------------------------------------------
    # Step 2: Validate image integrity
    # --------------------------------------------------------
    is_valid, error_msg = validate_image_bytes(
        file_bytes,
        content_type,
    )

    if not is_valid:
        logger.warning(f"Image validation failed: {error_msg}")

        return AnalyzeResponse(
            status="error",
            message=error_msg,
            detected_items=None,
            total_calories=None,
            total_protein_g=None,
            total_carbs_g=None,
            total_fat_g=None,
            calorie_impact=None,
        )

    # --------------------------------------------------------
    # Step 3: Extract image dimensions
    # (used for bounding box → portion estimation)
    # --------------------------------------------------------
    image_width, image_height = get_image_dimensions(file_bytes)

    # --------------------------------------------------------
    # Step 4: Run YOLO detection
    # --------------------------------------------------------
    try:
        detection_result = run_detection_from_bytes(file_bytes)

    except Exception as e:
        logger.error(f"YOLO inference failed: {e}")

        return AnalyzeResponse(
            status="error",
            message=(
                "Internal server error during food detection."
            ),
            detected_items=None,
            total_calories=None,
            total_protein_g=None,
            total_carbs_g=None,
            total_fat_g=None,
            calorie_impact=None,
        )

    # --------------------------------------------------------
    # Step 5: Handle no detections
    # --------------------------------------------------------
    if not detection_result["any_detected"]:
        logger.info("No food detected in image.")

        return AnalyzeResponse(
            status="no_food_detected",
            message="No food items were detected in this image.",
            detected_items=[],
            total_calories=0,
            total_protein_g=0,
            total_carbs_g=0,
            total_fat_g=0,
            calorie_impact=None,
        )

    # --------------------------------------------------------
    # Step 6: Convert detections → nutrition data
    # --------------------------------------------------------
    detected_items = []
    nutrition_list = []

    for det in detection_result["accepted"]:

        nutrition = nutrition_service.get_nutrition_for_item(
            class_name=det["class_name"],
            bbox=det["bbox"],
            image_width=image_width,
            image_height=image_height,
        )

        detected_items.append(
            DetectedItem(
                item_name=det["class_name"],
                confidence_score=det["confidence"],
                estimated_weight_g=nutrition["estimated_weight_g"],
                calories=nutrition["calories"],
                protein_g=nutrition["protein_g"],
                carbs_g=nutrition["carbs_g"],
                fat_g=nutrition["fat_g"],
                bounding_box=BoundingBox(**det["bbox"]),
                low_confidence_warning=det[
                    "low_confidence_warning"
                ],
            )
        )

        nutrition_list.append(nutrition)

    # --------------------------------------------------------
    # Step 7: Aggregate totals
    # --------------------------------------------------------
    totals = nutrition_service.calculate_totals(
        nutrition_list
    )

    logger.info(
        f"Analysis complete | "
        f"Items: {len(detected_items)} | "
        f"Calories: {totals['total_calories']} | "
        f"Impact: {totals['calorie_impact']}"
    )

    # --------------------------------------------------------
    # Step 8: Response
    # --------------------------------------------------------
    return AnalyzeResponse(
        status="success",
        message="Food items detected successfully.",
        detected_items=detected_items,
        total_calories=totals["total_calories"],
        total_protein_g=totals["total_protein_g"],
        total_carbs_g=totals["total_carbs_g"],
        total_fat_g=totals["total_fat_g"],
        calorie_impact=totals["calorie_impact"],
    )