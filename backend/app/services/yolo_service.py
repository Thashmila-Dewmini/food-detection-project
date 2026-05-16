from app.ml.model_loader import model_loader
from app.core.config import settings
from app.core.logging import logger
from PIL import Image
import numpy as np


def run_detection(image: Image.Image) -> dict:
    """"
    Runs YOLOv8 inference on a PIL Image.
    Applies confidence filtering per the spec:
    >= 0.60 -> accepted, no warning
    0.30-0.59 -> accepted, low_confidence_warning = True
    < 0.30 -> discarded

    Returns a dict with:
    - accepted: list of detections to include in the response
    - any_detected: bool (False triggers no_food_detected response)
    """
    model = model_loader.get_model()

    # convert PIL Image to numpy array for YOLO
    img_array = np.array(image)

    results = model(img_array, verbose=False)

    accepted = []

    for result in results:
        boxes = result.boxes

        if boxes is None:
            continue

        for box in boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]

            # descard extremely low confidence detections
            if conf < settings.CONFIDENCE_MEDIUM:
                logger.debug(f"Discarded low-confidence detection: {class_name} ({conf:.2f})")
                continue

            # get bounding box in pixel coordinates
            xyxy = box.xyxy[0].tolist()  
            x1, y1, x2, y2 = [int(v) for v in xyxy]

            accepted.append({
                "class_name": class_name,
                "confidence": round(conf * 100, 1),   # store as percentage 
                "low_confidence_warning": conf < settings.CONFIDENCE_HIGH,
                "bbox": {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1
                }
            })
    
    logger.info(f"Detection complete. Accepted items: {len(accepted)}")

    return {
        "accepted": accepted,
        "any_detected": len(accepted) > 0
    }