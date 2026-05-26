from app.services.nutrition_service import (
    NUTRITION_DB,
    calculate_totals
)

from app.core.logging import logger


def recalculate_nutrition(items: list) -> dict:
    """
    Recalculates nutrition values using
    manually edited portion sizes.
    """

    updated_items = []

    for item in items:

        normalized_name = item.item_name.strip().title()

        entry = NUTRITION_DB.get(normalized_name)

        if entry is None:
            logger.warning(
                f"No nutrition data found for {item.item_name}"
            )

            continue

        # scale nutrition by edited weight
        factor = item.estimated_weight_g / 100.0

        updated_items.append({
            "item_name": item.item_name,
            "confidence_score": 100.0,

            "estimated_weight_g": item.estimated_weight_g,

            "calories": round(
                entry["calories_per_100g"] * factor,
                1
            ),

            "protein_g": round(
                entry["protein_per_100g"] * factor,
                1
            ),

            "carbs_g": round(
                entry["carbs_per_100g"] * factor,
                1
            ),

            "fat_g": round(
                entry["fat_per_100g"] * factor,
                1
            ),

            # placeholder bbox
            "bounding_box": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
            },

            "low_confidence_warning": False
        })

    totals = calculate_totals(updated_items)

    logger.info("Nutrition recalculation completed.")

    return {
        "status": "success",
        "message": "Nutrition recalculated successfully.",
        "detected_items": updated_items,
        **totals
    }