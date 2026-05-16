from fastapi import APIRouter

"""mobile app startup check
   backend monitoring
   debugging
"""

router = APIRouter()

@router.get("")
def health_check():
    return {
        "status": "ok",
        "message": "NutriTrack backend is running!"
    }