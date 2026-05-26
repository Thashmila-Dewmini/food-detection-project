from app.ml.model_loader import model_loader
from app.core.config import settings
from app.core.logging import logger
from PIL import Image
import numpy as np
import cv2
import io


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

    #  convert RGB into BGR
    rgb_array = np.array(image)
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)

    results = model(
        bgr_array, 
        verbose=False, 
        conf=0.01, 
        iou=0.7,
        agnostic_nms=False,   # each class handled independently
        max_det=20,
        )

    accepted = []

    for result in results:
        boxes = result.boxes

        if boxes is None:
            continue

        for box in boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]
            
            logger.info(f"RAW detection: {class_name} conf={conf:.3f}")

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
    
    raw_count = len(results[0].boxes) if results else 0
    logger.info(f"Detection complete. Raw: {raw_count}, Accepted items: {len(accepted)}")

    return {
        "accepted": accepted,
        "any_detected": len(accepted) > 0
    }


def run_detection_from_bytes(file_bytes: bytes) -> dict:
    """
    Alternative: run detection directly from raw bytes using cv2
    This most closely matches how YOLO handles file paths internally
    and avoids any PIL color space issues entirely.
    """
    model = model_loader.get_model()

    # Decode bytes directly with cv2 — gives BGR natively
    nparr = np.frombuffer(file_bytes, np.uint8)
    bgr_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if bgr_array is None:
        logger.error("cv2.imdecode failed to decode image bytes")
        return {"accepted": [], "any_detected": False}
    
    results = model(
        bgr_array,
        verbose=False,
        conf=0.01,
        iou=0.7,
        agnostic_nms=False,
        max_det=20,
    )

    accepted = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        for box in boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]

            logger.info(f"RAW detection: {class_name} conf={conf:.3f}")

            if conf < settings.CONFIDENCE_MEDIUM:
                logger.debug(f"Discarded: {class_name} ({conf:.2f})")
                continue

            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = [int(v) for v in xyxy]
 
            accepted.append({
                "class_name": class_name,
                "confidence": round(conf * 100, 1),
                "low_confidence_warning": conf < settings.CONFIDENCE_HIGH,
                "bbox": {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1
                }
            })
 
    raw_count = len(results[0].boxes) if results else 0
    logger.info(f"Detection complete. Raw: {raw_count}, Accepted: {len(accepted)}")
 
    return {
        "accepted": accepted,
        "any_detected": len(accepted) > 0
    }