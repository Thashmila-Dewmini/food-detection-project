from pydantic import BaseModel
from typing import Optional, List

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class DetectedItem(BaseModel):
    item_name: str
    confidence_score: float          
    estimated_weight_g: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    bounding_box: BoundingBox
    low_confidence_warning: bool     # true if confidence_score < 60%

class AnalyzeResponse(BaseModel):
    """
    Response for POST /api/v1/analyze 
    Covers all three cases: success, no_food_detected, error
    """
    status: str    # "success", "no_food_detected" or "error"
    message: str
    detected_items: Optional[List[DetectedItem]] = None
    total_calories: Optional[float] = None
    total_protein_g: Optional[float] = None
    total_carbs_g: Optional[float] = None
    total_fat_g: Optional[float] = None
    calorie_impact: Optional[str] = None    # "low", "medium" or "high" 


class HealthResponse(BaseModel):
    status: str
    message: str


class FeedbackResponse(BaseModel):
    status: str
    message: str

