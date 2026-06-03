# backend/app/api/v1/api.py

# sets up the main API routing structure for a FastAPI application.
from fastapi import APIRouter
from app.api.v1.routes import analyze, health, feedback, recalculate

api_router = APIRouter()

api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])  # food detection
api_router.include_router(health.router, prefix="/health", tags=["Health"])   # server health check
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])  # user corrections
api_router.include_router(recalculate.router, prefix="/recalculate", tags=["Recalculate"])  # corrected values