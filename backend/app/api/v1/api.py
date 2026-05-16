from fastapi import APIRouter
from app.api.v1.routes import analyze, health, feedback

api_router = APIRouter()

api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])  # food detection
api_router.include_router(health.router, prefix="/health", tags=["Health"])   # server health check
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])  # user corrections