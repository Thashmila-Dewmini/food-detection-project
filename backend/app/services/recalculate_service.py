# backend/app/services/recalculate_service.py
from typing import List

from app.services.nutrition_service import (
    get_nutrition_for_item_by_weight,
    calculate_totals,
)

from app.core.logging import logger


def recalculate_nutrition(items: List) -> dict:
    """
    Recalculate nutritional values after the user manually adjusts
    portion sizes in the mobile application.

    Each item's nutrition is recalculated using its updated weight,
    then meal totals are recomputed.
    """

    updated_items = []

    for item in items:
        nutrition = get_nutrition_for_item_by_weight(
            class_name=item.item_name,
            weight_g=item.estimated_weight_g,
        )

        updated_items.append({
            "item_name": item.item_name,
            "confidence_score": 100.0,
            "estimated_weight_g": nutrition["estimated_weight_g"],
            "calories": nutrition["calories"],
            "protein_g": nutrition["protein_g"],
            "carbs_g": nutrition["carbs_g"],
            "fat_g": nutrition["fat_g"],

            # Bounding box information is unavailable during
            # manual recalculation because the user is only
            # modifying portion sizes.
            "bounding_box": {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0,
            },

            "low_confidence_warning": False,
        })

    totals = calculate_totals(updated_items)

    logger.info(
        f"Nutrition recalculation completed for {len(updated_items)} items."
    )

    return {
        "status": "success",
        "message": "Nutrition recalculated successfully.",
        "detected_items": updated_items,
        **totals,
    }