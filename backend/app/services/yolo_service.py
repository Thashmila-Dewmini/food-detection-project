# backend/app/services/yolo_service.py
from app.ml.model_loader import model_loader
from app.core.config import settings
from app.core.logging import logger

import numpy as np
import cv2


def _run_yolo(bgr_image: np.ndarray):
    """
    Internal helper:
    Runs YOLO inference on a BGR image.
    """

    model = model_loader.get_model()

    results = model(
        bgr_image,
        verbose=False,
        conf=0.01,
        iou=0.7,
        agnostic_nms=False,
        max_det=20,
    )

    return results


def _process_results(results):
    """
    Converts raw YOLO output -> structured detections
    with confidence filtering.
    """

    accepted = []

    for result in results:
        boxes = result.boxes

        if boxes is None:
            continue

        for box in boxes:

            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = model_loader.get_model().names[cls_id]

            logger.info(
                f"Detection: {class_name} | confidence={conf:.3f}"
            )

            
            # Confidence filtering
            if conf < settings.CONFIDENCE_MEDIUM:
                logger.debug(
                    f"Discarded low confidence: {class_name}"
                )
                continue

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )

            accepted.append({
                "class_name": class_name,
                "confidence": round(conf * 100, 1),
                "low_confidence_warning": (
                    conf < settings.CONFIDENCE_HIGH
                ),
                "bbox": {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                }
            })

    return accepted


def run_detection_from_bytes(file_bytes: bytes) -> dict:
    """
    Main inference pipeline.

    Steps:
    1. Decode image bytes -> BGR (OpenCV)
    2. Run YOLO model
    3. Filter + format results
    """

    # Decode image safely using OpenCV
    nparr = np.frombuffer(file_bytes, np.uint8)
    bgr_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if bgr_image is None:
        logger.error("Failed to decode image bytes")
        return {
            "accepted": [],
            "any_detected": False,
        }

    # Run inference
    results = _run_yolo(bgr_image)

    accepted = _process_results(results)

    logger.info(
        f"YOLO completed | "
        f"accepted={len(accepted)}"
    )

    return {
        "accepted": accepted,
        "any_detected": len(accepted) > 0,
    }