# backend/app/core/logging.py
import logging
import sys
from app.core.config import settings


def setup_logger(name: str = "nutriSight") -> logging.Logger:
    """
    Creates and configures a reusable application logger.

    Features:
    - Console output (stdout)
    - Structured log format
    - Prevents duplicate handlers
    - Configurable log level
    """

    logger = logging.getLogger(name)

    # Prevent duplicate handlers (important in FastAPI reload)
    if logger.handlers:
        return logger


    # Set log level from config
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(level)


    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)


    # Log format
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Shared application logger instance
logger = setup_logger()