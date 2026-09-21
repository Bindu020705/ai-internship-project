from fastapi import APIRouter
from app.schemas.schemas import APIResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=APIResponse[dict])
def check_health():
    return APIResponse(
        success=True,
        message="AI-Powered Water Sustainability Assistant API is operational",
        data={"status": "online", "version": "1.0.0", "sdg_target": "SDG 6"}
    )
