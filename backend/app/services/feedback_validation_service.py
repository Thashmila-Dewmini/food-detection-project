# backend/app/services/feedback_validation_service.py

from app.services.nutrition_service import NUTRITION_DB
from app.core.logging import logger


# Validation thresholds

# Acceptable portion size range relative to the default serving size.
PORTION_MIN_MULTIPLIER = 0.1
PORTION_MAX_MULTIPLIER = 5.0

# Fallback serving size when nutrition data is unavailable.
FALLBACK_DEFAULT_SERVING_G = 100.0

# Absolute upper limit for a single food item's weight.
SINGLE_ITEM_MAX_WEIGHT_G = 1500.0

# Meal-level calorie validation.
# Caloric density scales with meal size and provides a more
# reliable signal than a fixed calorie threshold alone.
MAX_MEAL_CALORIC_DENSITY_KCAL_PER_G = 2.5

# Absolute safeguard against unrealistic meal totals.
SOFT_MAX_TOTAL_CALORIES = 5000.0

# Maximum number of food items allowed in a meal.
MAX_TOTAL_ITEMS = 15

# Maximum number of user-added items is determined dynamically
# from the original detection count.
MAX_NEW_ITEM_ADDITIONS = None

# Confidence threshold used when validating removal of detected items.
HIGH_CONFIDENCE_THRESHOLD = 60.0


# Public entry point

def validate_feedback(
    original_detected_items: list[dict],
    corrected_items: list[dict],
) -> dict:
    """
    Applies all rule-based validation checks to user-corrected
    food detections before feedback is accepted.

    Returns:
        {
            "valid": bool,
            "reasons": list[str]
        }
    """

    reasons: list[str] = []

    _check_total_item_count(corrected_items, reasons)
    _check_item_additions(original_detected_items, corrected_items, reasons)
    _check_portion_weights(corrected_items, reasons)
    _check_total_calories(corrected_items, reasons)
    _check_high_confidence_removals(
        original_detected_items,
        corrected_items,
        reasons,
    )

    is_valid = len(reasons) == 0

    if is_valid:
        logger.info("Feedback validation passed all Layer-1 checks.")
    else:
        logger.warning(
            f"Feedback validation failed Layer-1 checks: {reasons}"
        )

    return {
        "valid": is_valid,
        "reasons": reasons,
    }



# Validation rules

def _check_total_item_count(
    corrected_items: list[dict],
    reasons: list[str],
) -> None:
    """
    Ensures the corrected meal does not exceed the maximum
    supported number of food items.
    """

    count = len(corrected_items)

    if count > MAX_TOTAL_ITEMS:
        reasons.append(
            f"Corrected list contains {count} items. "
            f"A single meal photo cannot realistically contain "
            f"more than {MAX_TOTAL_ITEMS} items."
        )


def _check_item_additions(
    original_detected_items: list[dict],
    corrected_items: list[dict],
    reasons: list[str],
) -> None:
    """
    Prevents users from adding an excessive number of new food
    items relative to the original detection results.
    """

    original_names = {
        item["item_name"].strip().lower()
        for item in original_detected_items
    }

    corrected_names = {
        item["item_name"].strip().lower()
        for item in corrected_items
    }

    new_additions = corrected_names - original_names
    max_allowed = max(len(original_detected_items), 1)

    if len(new_additions) > max_allowed:
        reasons.append(
            f"You added {len(new_additions)} new items "
            f"({', '.join(new_additions)}). "
            f"At most {max_allowed} new item(s) can be added "
            f"based on the original {len(original_detected_items)} "
            f"detection(s)."
        )


def _check_portion_weights(
    corrected_items: list[dict],
    reasons: list[str],
) -> None:
    """
    Validates that each food item's weight falls within a
    realistic range based on nutrition database serving sizes.
    """

    for item in corrected_items:
        name = item.get("item_name", "Unknown")
        weight = item.get("estimated_weight_g", 0)

        # Absolute upper limit per item.
        if weight > SINGLE_ITEM_MAX_WEIGHT_G:
            reasons.append(
                f"'{name}' has an unrealistic weight of {weight}g. "
                f"Maximum allowed per item is {SINGLE_ITEM_MAX_WEIGHT_G}g."
            )
            continue

        db_entry = _lookup_nutrition_entry(name)

        default_g = (
            db_entry["default_serving_g"]
            if db_entry
            else FALLBACK_DEFAULT_SERVING_G
        )

        min_g = round(default_g * PORTION_MIN_MULTIPLIER, 1)
        max_g = round(default_g * PORTION_MAX_MULTIPLIER, 1)

        if weight < min_g:
            reasons.append(
                f"'{name}' weight of {weight}g is too low. "
                f"Minimum realistic portion is {min_g}g "
                f"(based on a {default_g}g default serving)."
            )

        elif weight > max_g:
            reasons.append(
                f"'{name}' weight of {weight}g is too high. "
                f"Maximum realistic portion is {max_g}g "
                f"(based on a {default_g}g default serving)."
            )


def _check_total_calories(
    corrected_items: list[dict],
    reasons: list[str],
) -> None:
    """
    Validates meal-level calorie plausibility using caloric
    density and an absolute calorie limit.
    """

    total_calories = 0.0
    total_weight_g = 0.0

    for item in corrected_items:
        name = item.get("item_name", "")
        weight = item.get("estimated_weight_g", 0)

        db_entry = _lookup_nutrition_entry(name)

        cal_per_100g = (
            db_entry.get("calories_per_100g", 100)
            if db_entry
            else 100
        )

        total_calories += (weight / 100.0) * cal_per_100g
        total_weight_g += weight

    total_calories = round(total_calories, 1)
    total_weight_g = round(total_weight_g, 1)

    # Absolute safeguard against unrealistic calorie totals.
    if total_calories > SOFT_MAX_TOTAL_CALORIES:
        reasons.append(
            f"Total estimated calories for the corrected meal is "
            f"{total_calories} kcal, which exceeds the absolute "
            f"limit of {SOFT_MAX_TOTAL_CALORIES} kcal. "
            f"Please check your portion weights."
        )
        return

    # Validate overall meal caloric density.
    if total_weight_g > 0:
        density = round(total_calories / total_weight_g, 3)

        if density > MAX_MEAL_CALORIC_DENSITY_KCAL_PER_G:
            reasons.append(
                f"The caloric density of your corrected meal is "
                f"{density} kcal/g (total {total_calories} kcal across "
                f"{total_weight_g} g), which exceeds the realistic "
                f"maximum of {MAX_MEAL_CALORIC_DENSITY_KCAL_PER_G} kcal/g. "
                f"Please review your portion sizes."
            )


def _check_high_confidence_removals(
    original_detected_items: list[dict],
    corrected_items: list[dict],
    reasons: list[str],
) -> None:
    """
    Flags removal of items that were detected with high
    confidence and are no longer present in the corrected list.
    """

    corrected_names_lower = [
        item["item_name"].strip().lower()
        for item in corrected_items
    ]

    for item in original_detected_items:
        name = item.get("item_name", "")
        confidence = item.get("confidence_score", 0)

        if confidence < HIGH_CONFIDENCE_THRESHOLD:
            continue

        name_lower = name.strip().lower()

        # Allow minor naming variations.
        still_present = any(
            name_lower in corrected_lower
            or corrected_lower in name_lower
            for corrected_lower in corrected_names_lower
        )

        if not still_present:
            reasons.append(
                f"'{name}' was detected with {confidence}% confidence "
                f"but is missing from your corrected list. "
                f"High-confidence detections should only be removed "
                f"if the item is genuinely not present in the image."
            )



# Helpers

def _lookup_nutrition_entry(item_name: str) -> dict | None:
    """
    Performs a case-insensitive lookup in the nutrition database.

    Returns:
        Nutrition entry if found, otherwise None.
    """

    entry = NUTRITION_DB.get(item_name)
    if entry:
        return entry

    name_lower = item_name.strip().lower()

    for key, value in NUTRITION_DB.items():
        if key.strip().lower() == name_lower:
            return value

    return None

