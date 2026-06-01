# backend/app/services/nutrition_service.py
import json
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.core.logging import logger


# Portion estimation constants
MIN_PORTION_SCALE = 0.3
MAX_PORTION_SCALE = 1.5
AREA_SCALE_MULTIPLIER = 5.0


def _load_nutrition_db() -> dict[str, Any]:
    """
    Load the nutrition database from disk.

    Returns:
        Dictionary containing food nutrition data.

    Raises:
        RuntimeError: If the nutrition database cannot be loaded.
    """
    db_path = Path(settings.NUTRITION_DB_PATH)

    try:
        with open(db_path, "r", encoding="utf-8") as file:
            return json.load(file)

    except FileNotFoundError:
        logger.error(f"Nutrition database not found: {db_path}")
        raise RuntimeError("Nutrition database file is missing.")

    except json.JSONDecodeError as exc:
        logger.error(f"Invalid nutrition database JSON: {exc}")
        raise RuntimeError("Nutrition database contains invalid JSON.")


# Load database once during application startup
NUTRITION_DB = _load_nutrition_db()

# Create a normalized lookup table to handle
# case differences and accidental whitespace.
_NORMALIZED_DB = {
    key.strip().lower(): key
    for key in NUTRITION_DB
    if not key.startswith("_")
}


def _lookup_entry(class_name: str) -> dict[str, Any] | None:
    """
    Retrieve a nutrition entry using multiple matching strategies.

    Matching order:
    1. Exact match
    2. Case-insensitive normalized match
    3. Partial match

    Args:
        class_name: Detected food name.

    Returns:
        Nutrition entry dictionary or None if no match is found.
    """

    # Exact match
    entry = NUTRITION_DB.get(class_name)
    if entry:
        return entry

    # Normalized match
    normalized_name = class_name.strip().lower()
    original_key = _NORMALIZED_DB.get(normalized_name)

    if original_key:
        logger.debug(
            f"Normalized lookup matched '{class_name}' -> '{original_key}'"
        )
        return NUTRITION_DB[original_key]

    # Partial match
    for normalized_key, original_key in _NORMALIZED_DB.items():
        if (
            normalized_name in normalized_key
            or normalized_key in normalized_name
        ):
            logger.debug(
                f"Partial lookup matched '{class_name}' -> '{original_key}'"
            )
            return NUTRITION_DB[original_key]

    return None


def _default_entry() -> dict[str, float]:
    """
    Fallback nutrition values used when a food item
    cannot be found in the nutrition database.
    """
    return {
        "calories_per_100g": 100,
        "protein_per_100g": 3.0,
        "carbs_per_100g": 15.0,
        "fat_per_100g": 3.0,
        "default_serving_g": 100,
    }


def get_nutrition_for_item(
    class_name: str,
    bbox: dict,
    image_width: int,
    image_height: int,
) -> dict[str, float]:
    """
    Estimate nutrition values for a detected food item.

    Portion size is estimated using the relative size of the
    detected bounding box compared to the entire image.

    Args:
        class_name: Detected food category.
        bbox: Bounding box dictionary.
        image_width: Width of the image in pixels.
        image_height: Height of the image in pixels.

    Returns:
        Estimated nutrition information.
    """

    entry = _lookup_entry(class_name)

    if entry is None:
        logger.warning(
            f"No nutrition data found for '{class_name}'. Using defaults."
        )
        entry = _default_entry()

    bbox_area = bbox["width"] * bbox["height"]
    image_area = image_width * image_height

    if image_area > 0:
        area_ratio = bbox_area / image_area

        scale = max(
            MIN_PORTION_SCALE,
            min(
                MAX_PORTION_SCALE,
                area_ratio * AREA_SCALE_MULTIPLIER,
            ),
        )
    else:
        logger.warning(
            "Image area is zero. Falling back to default serving size."
        )
        scale = 1.0

    estimated_weight_g = round(
        entry["default_serving_g"] * scale,
        1,
    )

    factor = estimated_weight_g / 100.0

    return {
        "estimated_weight_g": estimated_weight_g,
        "calories": round(entry["calories_per_100g"] * factor, 1),
        "protein_g": round(entry["protein_per_100g"] * factor, 1),
        "carbs_g": round(entry["carbs_per_100g"] * factor, 1),
        "fat_g": round(entry["fat_per_100g"] * factor, 1),
    }


def get_nutrition_for_item_by_weight(
    class_name: str,
    weight_g: float,
) -> dict[str, float]:
    """
    Calculate nutrition values using a user-specified weight.

    Used when the user manually edits portion sizes and requests
    recalculation.

    Args:
        class_name: Food name.
        weight_g: User-adjusted weight in grams.

    Returns:
        Calculated nutrition information.
    """

    entry = _lookup_entry(class_name)

    if entry is None:
        logger.warning(
            f"No nutrition data found for '{class_name}'. Using defaults."
        )
        entry = _default_entry()

    factor = weight_g / 100.0

    return {
        "estimated_weight_g": round(weight_g, 1),
        "calories": round(entry["calories_per_100g"] * factor, 1),
        "protein_g": round(entry["protein_per_100g"] * factor, 1),
        "carbs_g": round(entry["carbs_per_100g"] * factor, 1),
        "fat_g": round(entry["fat_per_100g"] * factor, 1),
    }


def calculate_totals(items: list[dict]) -> dict[str, Any]:
    """
    Calculate total nutrition values for all detected items.

    Args:
        items: List of nutrition dictionaries.

    Returns:
        Aggregated nutrition totals and calorie impact category.
    """

    total_calories = round(
        sum(item["calories"] for item in items),
        1,
    )

    total_protein = round(
        sum(item["protein_g"] for item in items),
        1,
    )

    total_carbs = round(
        sum(item["carbs_g"] for item in items),
        1,
    )

    total_fat = round(
        sum(item["fat_g"] for item in items),
        1,
    )

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
        "calorie_impact": calorie_impact,
    }