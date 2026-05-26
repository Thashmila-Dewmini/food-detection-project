from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.response import AnalyzeResponse, DetectedItem, BoundingBox
from app.services.yolo_service import run_detection_from_bytes
from app.services import nutrition_service
from app.utils.image_utils import validate_image_bytes, get_image_dimensions
from app.core.logging import logger


router = APIRouter()

@router.post("", response_model=AnalyzeResponse)
async def analyze_food_image(image: UploadFile = File(...)):
    """
    POST /api/v1/analyze

    Full pipeline:
    1. Read and validate the uploaded image
    2. Run YOLOv8 food detection
    3. Map detections to nutrition database
    4. Calculate totals and calories impact
    5. Return structured JSON response
    """

    # step 1: Read image bytes
    file_bytes = await image.read()
    content_type = image.content_type or ""

    logger.info(f"Received image: {image.filename}, type: {content_type}, size: {len(file_bytes)} bytes")

    # step 2: Backend image validation
    is_valid, error_msg = validate_image_bytes(file_bytes, content_type)

    if not is_valid:
        logger.warning(f"Image validation failed: {error_msg}")
        # return validation error as a structured response, not a 400 crash
        return AnalyzeResponse(
            status="error",
            message=error_msg,
            detected_items=None,
            total_calories=None,
            total_protein_g=None,
            total_carbs_g=None,
            total_fat_g=None,
            calorie_impact=None
        )
    
    # step 3: Get image dimensions for nutrition portion estimation
    image_width, image_height = get_image_dimensions(file_bytes)
    
    # step 4: Run YOLOv8 detection
    try:
        detection_result = run_detection_from_bytes(file_bytes)
    except Exception as e:
        logger.error(f"YOLO inference failed: {e}")
        return AnalyzeResponse(
            status="error",
            message="An internal server error occurred during food detection. Please try again.",
            detected_items=None,
            total_calories=None,
            total_protein_g=None,
            total_carbs_g=None,
            total_fat_g=None,
            calorie_impact=None
        )
    
    # step 5: Handle no food detected
    if not detection_result["any_detected"]:
        logger.info("No food items detected in the image.")
        return AnalyzeResponse(
            status="no_food_detected",
            message="No food items were detected in this image.",
            detected_items=[],
            total_calories=0,
            total_protein_g=0,
            total_carbs_g=0,
            total_fat_g=0,
            calorie_impact=None
        )
    
    # step 6: Map detections to nutrition database
    detected_items = []
    nutrition_list = []

    for det in detection_result["accepted"]:

        nutrition = nutrition_service.get_nutrition_for_item(
            class_name=det["class_name"],
            bbox=det["bbox"],
            image_width=image_width,
            image_height=image_height
        )

        detected_items.append(DetectedItem(
            item_name=det["class_name"],
            confidence_score=det["confidence"],
            estimated_weight_g=nutrition["estimated_weight_g"],
            calories=nutrition["calories"],
            protein_g=nutrition["protein_g"],
            carbs_g=nutrition["carbs_g"],
            fat_g=nutrition["fat_g"],
            bounding_box=BoundingBox(**det["bbox"]),
            low_confidence_warning=det["low_confidence_warning"]
        ))

        nutrition_list.append(nutrition)

    # step 7: calculate totals and calorie impact (after processing all items)
    totals = nutrition_service.calculate_totals(nutrition_list)

    logger.info(
        f"Analysis complete. Items: {len(detected_items)}, "
        f"Total kcal: {totals['total_calories']}, "
        f"Impact: {totals['calorie_impact']}"
    )

    return AnalyzeResponse(
        status="success",
        message="Food items detected successfully.",
        detected_items=detected_items,
        total_calories=totals["total_calories"],
        total_protein_g=totals["total_protein_g"],
        total_carbs_g=totals["total_carbs_g"],
        total_fat_g=totals["total_fat_g"],
        calorie_impact=totals["calorie_impact"]
    )