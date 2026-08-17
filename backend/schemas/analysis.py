from typing import List, Literal

from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    sender: str = Field(default="", max_length=320)
    subject: str = Field(default="", max_length=500)
    message: str = Field(..., min_length=1, max_length=50000)


class AnalysisResponse(BaseModel):
    prediction: Literal["phishing", "legitimate"]
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["low", "medium", "high"]
    indicators: List[str]
    explanation: str
    recommended_action: str