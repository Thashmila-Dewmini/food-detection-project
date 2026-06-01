# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Central configuration for NutriSight backend.

    All environment-specific and system-wide constants
    are defined here to ensure easy tuning and scalability.
    """

    # --------------------------------------------------------
    # Application metadata
    # --------------------------------------------------------
    APP_NAME: str = "NutriSight API"
    APP_VERSION: str = "1.0"

    # --------------------------------------------------------
    # Model configuration
    # --------------------------------------------------------
    MODEL_PATH: str = (
        "runs/detect/outputs/"
        "food_detection_v1-3/weights/best.pt"
    )

    # --------------------------------------------------------
    # YOLO detection thresholds
    # --------------------------------------------------------
    CONFIDENCE_HIGH: float = 0.60   # confident prediction
    CONFIDENCE_MEDIUM: float = 0.30 # borderline prediction

    # --------------------------------------------------------
    # Image validation rules
    # --------------------------------------------------------
    MIN_FILE_SIZE_BYTES: int = 10_240       # 10 KB
    MAX_FILE_SIZE_BYTES: int = 10_485_760    # 10 MB

    ALLOWED_CONTENT_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
    ]

    # --------------------------------------------------------
    # Calorie classification thresholds
    # --------------------------------------------------------
    CALORIE_LOW_MAX: int = 400
    CALORIE_MEDIUM_MAX: int = 600

    # --------------------------------------------------------
    # Nutrition database
    # --------------------------------------------------------
    NUTRITION_DB_PATH: str = (
        "app/data/nutrition_db.json"
    )

    # --------------------------------------------------------
    # Optional future expansion (clean architecture ready)
    # --------------------------------------------------------
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()