from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.ml.model_loader import model_loader
from app.core.logging import logger 

@asynccontextmanager
async def lifespan(app: FastAPI):
    # load YOLO model once
    logger.info("Starting NutriSight API...")
    model_loader.load()
    logger.info("Startup complete. Ready to accept requests.")
    yield

    # shutdown
    logger.info("Shutting down NutriSight API.")

# create FastAPI app instance
app = FastAPI(
    title="NutriSight API",
    version="1.0",
    lifespan=lifespan
)

# register all routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "NutriSight API is running!"}