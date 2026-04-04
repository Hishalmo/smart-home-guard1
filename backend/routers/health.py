import time

from fastapi import APIRouter, Request

router = APIRouter()

_start_time = time.time()


@router.get("/health")
async def health(request: Request) -> dict:
    ml_service = request.app.state.ml_service
    return {
        "status": "ok",
        "model_loaded": ml_service.is_loaded,
        "model_name": "LightGBM",
        "uptime_seconds": round(time.time() - _start_time, 1),
    }
