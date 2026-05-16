from PIL import Image
import io
from app.core.config import settings
from app.core.logging import logger


def validate_image_bytes(file_bytes: bytes, content_type: str):
    """
    Backend image validation.
    Frontend (React Native) handles: file type, file size, blur detection.
    Backend handles: can the file actually be decoded as a valid image.
    
    Returns (is_valid: bool, error_message: str)
    """

    # Check content type
    if content_type not in settings.ALLOWED_CONTENT_TYPES:
        return False, f"Unsupported file type: {content_type}. Only JPEG and PNG are accepted."

    # Check file size
    size = len(file_bytes)
    if size < settings.MIN_FILE_SIZE_BYTES:
        return False, "Image file is too small (minimum 10 KB)."
    if size > settings.MAX_FILE_SIZE_BYTES:
        return False, "Image file is too large (maximum 10 MB)."

    # Try to open and verify image integrity
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()   # Checks for corruption without fully decoding
    except Exception as e:
        logger.warning(f"Image integrity check failed: {e}")
        return False, "Image file appears to be corrupted or unreadable."

    return True, ""


def load_image(file_bytes: bytes) -> Image.Image:
    """
    Loads and converts image to RGB for YOLO inference.
    Must be called after validate_image_bytes passes.
    """
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    return img