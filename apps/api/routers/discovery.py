"""
Phase 1: Niche Discovery Router — REAL IMPLEMENTATION.
Handles keyword research and niche category discovery.
Independent module — does not import from other routers.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import os
import json

# Import from same-module services (no cross-router imports)
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from services.scout_agent import ScoutAgent
from models import NicheCandidate, Phase1Output

router = APIRouter()

# Data directory relative to this file's location
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "projects")


class SearchRequest(BaseModel):
    query: str = Query(..., min_length=2, max_length=200, description="Broad game genre or keyword")
    project_id: str = ""


@router.get("/niches")
async def list_niche_candidates(project_id: str):
    """Get saved niche candidates for a project."""
    data = ScoutAgent.load_phase1_output(project_id)
    if not data:
        return {"project_id": project_id, "niches": [], "status": "no_data"}
    return {"project_id": project_id, "niches": data.get("candidates", []), "status": "ok"}


@router.post("/niches/search")
async def search_niches(request: SearchRequest):
    """
    Search for niche categories based on a broad game genre/keyword.
    This is the main Phase 1 entry point.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Generate project_id if not provided
    pid = request.project_id or f"proj_{hash(request.query) % 10000:04d}"

    agent = ScoutAgent(data_dir=os.path.abspath(DATA_DIR))
    try:
        result = await agent.discover_niches(
            query=request.query,
            project_id=pid,
        )
        return {
            "project_id": result.project_id,
            "query": result.query,
            "candidates": [c.model_dump() for c in result.candidates],
            "generated_at": result.generated_at.isoformat(),
            "candidate_count": len(result.candidates),
            "status": "ok",
        }
    except Exception as e:
        print(f"[DiscoveryRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/result")
async def save_discovery_result(project_id: str, data: dict):
    """Save Phase 1 output (niche candidate pool) for the next phase."""
    try:
        project_dir = os.path.join(DATA_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase1.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        return {"project_id": project_id, "saved": True, "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {e}")


@router.get("/{project_id}/result")
async def get_discovery_result(project_id: str):
    """Get Phase 1 output for Phase 2 to consume."""
    data = ScoutAgent.load_phase1_output(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="No Phase 1 data found. Run /niches/search first.")
    return {"project_id": project_id, "data": data, "status": "ok"}
