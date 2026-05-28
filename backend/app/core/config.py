from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):

    # App
    APP_NAME: str = "NutriSight API"
    APP_VERSION: str = "1.0"

    # Model
    MODEL_PATH: str = "runs/detect/outputs/food_detection_v1-3/weights/best.pt"

    # Confidence threshold (from spec + training results)
    CONFIDENCE_HIGH: float = 0.60 # accept and display normally
    CONFIDENCE_MEDIUM: float = 0.30 # display with warning badge
    # below 0.30 -> discarded -> trigger no_food_detected

    # Image validation
    MIN_FILE_SIZE_BYTES: int = 10_240 # 10 KB
    MAX_FILE_SIZE_BYTES: int = 10_485_760 # 10 MB
    ALLOWED_CONTENT_TYPES: list = ["image/jpeg", "image/png"]

    # calorie impact thresholds 
    CALORIE_LOW_MAX: int = 400  # <400 kcal: Low
    CALORIE_MEDIUM_MAX: int = 600  # 400-600 kcal: Medium
    # >600 kcal: High

    # Nutrition data
    NUTRITION_DB_PATH: str = "app/data/nutrition_db.json"

    class Config:
        env_file = ".env"
        

settings = Settings()