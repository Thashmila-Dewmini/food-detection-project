from pydantic import BaseModel
from typing import List

class FeedbackRequest(BaseModel):
    """
    Schema for POST /api/v1/feedback
    Matched the API spec document exactly.
    """
    image_id: str
    original_detected_items: List[dict]
    corrected_items: List[dict]