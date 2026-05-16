from ultralytics import YOLO
from app.core.config import settings
from app.core.logging import logger

class ModelLoader:
    """
    Singleton pattern - loads the YOLO model once when the backend starts.
    All requests share the same model instance to avoid reloading on every call.
    """

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load(self):
        if self._model is None:
            logger.info(f"Loading YOLO model from: {settings.MODEL_PATH}")
            self._model = YOLO(settings.MODEL_PATH)
            logger.info("Model loaded successfully.")
        return self._model
    
    def get_model(self) -> YOLO:
        if self._model is None:
            self.load()
        return self._model


# single shared instance used across the app
model_loader = ModelLoader()