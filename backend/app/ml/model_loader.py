# backend/app/ml/model_loader.py
from ultralytics import YOLO

from app.core.config import settings
from app.core.logging import logger


class ModelLoader:
    """
    Singleton model loader for YOLOv8.

    Ensures:
    - Model is loaded only once at startup
    - Shared across all API requests
    - Prevents expensive re-initialization
    """

    _instance = None
    _model = None

    def __new__(cls):
        """
        Singleton instance creation.
        Ensures only one ModelLoader exists.
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load(self) -> YOLO:
        """
        Loads YOLO model into memory if not already loaded.
        """

        if self._model is None:
            logger.info(
                f"Loading YOLO model from: {settings.MODEL_PATH}"
            )

            self._model = YOLO(settings.MODEL_PATH)

            logger.info("YOLO model loaded successfully.")

        return self._model

    def get_model(self) -> YOLO:
        """
        Returns the loaded model instance.
        Loads it if not already initialized.
        """

        if self._model is None:
            return self.load()

        return self._model


# ------------------------------------------------------------
# Global shared model instance
# ------------------------------------------------------------
model_loader = ModelLoader()