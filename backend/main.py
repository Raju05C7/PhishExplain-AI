from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.email_upload import router as email_upload_router

from api.analyze import router as analyze_router


app = FastAPI(
    title="PhishExplain AI API",
    description="Backend API for phishing detection and AI security explanations.",
    version="1.0.0",
)


# ==================== CORS ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROUTES ====================

app.include_router(analyze_router)
app.include_router(email_upload_router)


# ==================== BASIC ROUTES ====================

@app.get("/")
def root():
    return {
        "message": "PhishExplain AI API is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PhishExplain AI Backend",
    }