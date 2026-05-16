import json
from pathlib import Path
from datetime import datetime
from app.core.logging import logger

# correction are saved locally as a JSONL file (one JSON object per line)
# easy to load later for model retraining
FEEDBACK_LOG_PATH = Path("app/data/feedback_log.jsonl")

def save_feedback(image_id: str, original_items: list, corrected_items: list) -> bool:
    """"
    Appends a user correction record to the feedback log.
    Returns True on success, False on failure.
    """
    try:
        FEEDBACK_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)  # ensure directory exists

        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "image_id": image_id,
            "original_detected_items": original_items,
            "corrected_items": corrected_items
        }

        with open(FEEDBACK_LOG_PATH, "a") as f:
            f.write(json.dumps(record) + "\n")

        logger.info(f"Feedback saved for image_id: {image_id}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to save feedback: {e}")
        return False