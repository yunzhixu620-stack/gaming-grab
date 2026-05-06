"""
Phase 2: Sentiment & Consensus Analysis Router — REAL IMPLEMENTATION.
Handles Reddit sentiment analysis and consensus point extraction.
Independent module — does not import from other routers.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import os
import json
import sys

# Import from same-module services
_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from services.reddit_analyst import RedditAnalyst
from models import ConsensusPoint, Phase2Output

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "projects")


class AnalyzeRequest(BaseModel):
    niche_slug: str = Query(..., description="Slug of the selected niche from Phase 1")
    niche_name: str = Query(..., description="Human-readable name of the niche")
    project_id: str = ""
    extra_queries: list[str] | None = None


@router.get("/consensus")
async def get_consensus_points(project_id: str):
    """Get saved consensus points for a project."""
    data = RedditAnalyst.load_phase2_output(project_id)
    if not data:
        return {"project_id": project_id, "consensus_points": [], "status": "no_data"}
    return {"project_id": project_id, "consensus_points": data.get("consensus_points", []), "status": "ok"}


@router.post("/analyze")
async def analyze_sentiment(request: AnalyzeRequest):
    """
    Analyze Reddit sentiment for a selected niche category.
    This is the main Phase 2 entry point.
    """
    if not request.niche_slug.strip():
        raise HTTPException(status_code=400, detail="niche_slug is required")

    pid = request.project_id or f"proj_{hash(request.niche_slug) % 10000:04d}"

    agent = RedditAnalyst(data_dir=os.path.abspath(DATA_DIR))
    try:
        result = await agent.analyze_niche(
            niche_slug=request.niche_slug,
            niche_name=request.niche_name,
            project_id=pid,
            extra_queries=request.extra_queries,
        )
        return {
            "project_id": result.project_id,
            "niche_slug": result.niche_slug,
            "consensus_points": [p.model_dump() for p in result.consensus_points],
            "emotion_keywords": result.emotion_keywords,
            "scenario_keywords": result.scenario_keywords,
            "generated_at": result.generated_at.isoformat(),
            "consensus_count": len(result.consensus_points),
            "status": "ok",
        }
    except Exception as e:
        print(f"[SentimentRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/result")
async def save_sentiment_result(project_id: str, data: dict):
    """Save Phase 2 output (consensus points) for the next phase."""
    try:
        project_dir = os.path.join(DATA_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase2.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        return {"project_id": project_id, "saved": True, "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {e}")


@router.get("/{project_id}/result")
async def get_sentiment_result(project_id: str):
    """Get Phase 2 output for Phase 3 to consume."""
    data = RedditAnalyst.load_phase2_output(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="No Phase 2 data found. Run /analyze first.")
    return {"project_id": project_id, "data": data, "status": "ok"}
