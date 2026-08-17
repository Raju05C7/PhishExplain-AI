from fastapi import APIRouter

from schemas.analysis import AnalysisRequest, AnalysisResponse
from services.phishing_detector import analyze_message


router = APIRouter(
    prefix="/api",
    tags=["Analysis"],
)


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_email(request: AnalysisRequest):
    result = analyze_message(
        sender=request.sender,
        subject=request.subject,
        message=request.message,
    )

    return result