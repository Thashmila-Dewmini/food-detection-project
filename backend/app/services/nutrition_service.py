import json
from pathlib import Path
from app.core.config import settings
from app.core.logging import logger

# load nutrition DB once at import time
_db_path = Path(settings.NUTRITION_DB_PATH)

with open(_db_path,  'r') as f:
    NUTRITION_DB = json.load(f)

def get_nutrition_for_item(class_name: str, bbox: dict, image_width: int, image_height: int) -> dict:
    """
    Looks up nutrition values for a detected food item.
    Estimates portion weight using bounding box area relative to image size
    combined with the default serving weight for that food category.
    """
    entry = NUTRITION_DB.get(class_name)

    if entry is None:
        logger.warning(f"No nutrition data found for: {class_name}. Using defaults.")
        entry = {
            "calories_per_100g": 100,
            "protein_per_100g": 3.0,
            "carbs_per_100g": 15.0,
            "fat_per_100g": 3.0,
            "default_serving_g": 100
        }
    
    # Estimate portion weight
    # method: scale default serving by the fraction of the image bounding box covers
    # This is a heuristic - gives a more realistic estimate than always using the default
    bbox_area = bbox['width'] * bbox['height']
    image_area = image_width * image_height

    if image_area > 0:
        area_ratio = bbox_area / image_area
        # If the item covers 100% of the image -> use 1.5x default serving
        # If it covers 10% use ~0.5x default serving
        # Clamp between 0.3x and 1.5x of default
        scale = max(0.3, min(1.5, area_ratio * 5))
    else:
        scale = 1.0  # fallback to default if image area is zero for some reason
    
    estimated_weight_g = round(entry['default_serving_g'] * scale, 1)

    # scale nutrition to estimated weight
    factor = estimated_weight_g / 100.0

    return {
        "estimated_weight_g": estimated_weight_g,
        "calories": round(entry["calories_per_100g"] * factor, 1),
        "protein_g": round(entry["protein_per_100g"] * factor, 1),
        "carbs_g": round(entry["carbs_per_100g"] * factor, 1),
        "fat_g": round(entry["fat_per_100g"] * factor, 1)
    }


def calculate_totals(items: list) -> dict:
    """
    Sums up nutrition across all detected items and assigns calories impact category.
    """
    total_calories = round(sum(item["calories"] for item in items), 1)
    total_protein = round(sum(item["protein_g"] for item in items), 1)
    total_carbs = round(sum(item["carbs_g"] for item in items), 1)
    total_fat = round(sum(item["fat_g"] for item in items), 1)

    # calories impact classification
    if total_calories < settings.CALORIE_LOW_MAX:
        calorie_impact = "Low"
    elif total_calories <= settings.CALORIE_MEDIUM_MAX:
        calorie_impact = "Medium"
    else:
        calorie_impact = "High"
    
    return {
        "total_calories": total_calories,
        "total_protein_g": total_protein,
        "total_carbs_g": total_carbs,
        "total_fat_g": total_fat,
        "calorie_impact": calorie_impact
    }