import cv2
import numpy as np
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
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        logger.warning("cv2 could not decode image — file may be corrupted")
        return (False, "Image file appears to be corrupted or unreadable.")

    return True, ""


def get_image_dimensions(file_bytes: bytes):
    """
    Returns width and height of image using cv2
    used for bounding box area ratio calculation in nutrition service.
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return (640, 640)
    h, w = img.shape[:2]
    return (w, h)