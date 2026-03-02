"""
FastAPI backend for AI Forensic Accounting - Hugging Face integration.
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODELS_DIR = Path(__file__).parent / "models"


@asynccontextmanager
async def lifespan(app: FastAPI):
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="AI Forensic Accounting API",
    description="Hugging Face-powered fraud detection and model training",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response models ---


class AnalyzeRequest(BaseModel):
    vendors: list[dict] = []
    invoices: list[dict] = []
    payments: list[dict] = []
    glEntries: list[dict] = []
    useZeroShot: bool = False
    useTabular: bool = True


class TrainRequest(BaseModel):
    vendors: list[dict] = []
    invoices: list[dict] = []
    payments: list[dict] = []
    glEntries: list[dict] = []
    ruleBasedLabels: bool = True
    pushToHub: bool = False
    hfRepoId: str | None = None


# --- Routes ---


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ai-forensic-backend"}


@app.get("/api/model/status")
def model_status():
    """Check if a trained model exists."""
    model_path = MODELS_DIR / "fraud_classifier.joblib"
    return {
        "model_exists": model_path.exists(),
        "model_path": str(model_path) if model_path.exists() else None,
    }


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    """Run AI-based fraud risk scoring on uploaded data."""
    try:
        from ai.inference import score_records

        data = {
            "vendors": request.vendors,
            "invoices": request.invoices,
            "payments": request.payments,
            "glEntries": request.glEntries,
        }
        scores = score_records(
            data,
            use_zero_shot=request.useZeroShot,
            use_tabular=request.useTabular,
        )
        return {"success": True, "scores": scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/train")
def train(request: TrainRequest):
    """Train a fraud detection model using the provided data."""
    try:
        from ai.training import train_model

        data = {
            "vendors": request.vendors,
            "invoices": request.invoices,
            "payments": request.payments,
            "glEntries": request.glEntries,
        }
        result = train_model(
            data,
            rule_based_labels=request.ruleBasedLabels,
            push_to_hub=request.pushToHub,
            hf_repo_id=request.hfRepoId,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
