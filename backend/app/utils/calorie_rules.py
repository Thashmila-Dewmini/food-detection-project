# backend/app/utils/calorie_rules.py
from app.core.config import settings

def classify_calorie_impact(total_calories: float) -> str:
    """
    Classifies total meal calories into Low, medium, high
    Thresholds defined in config (from API spec).
    """

    if total_calories < settings.CALORIE_LOW_MAX:
        return "Low"
    elif total_calories <= settings.CALORIE_MEDIUM_MAX:
        return "Medium"
    else:
        return "High"