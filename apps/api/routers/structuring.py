"""
Phase 3: Data Structuring Router — REAL IMPLEMENTATION.
Converts Phase 2 consensus points into structured Feature Backlog.
Independent module — does not import from other routers.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import json
import sys

_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from services.pm_agent import PMAgent
from models import FeatureItem, Phase3Output

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "projects")


class StructureRequest(BaseModel):
    project_id: str = ""


@router.get("/backlog")
async def get_feature_backlog(project_id: str):
    """Get saved feature backlog for a project."""
    data = PMAgent.load_phase3_output(project_id)
    if not data:
        return {"project_id": project_id, "backlog": [], "status": "no_data"}
    return {"project_id": project_id, "backlog": data.get("backlog", []), "summary": data.get("summary", ""), "status": "ok"}


@router.post("/structure")
async def structure_requirements(request: StructureRequest):
    """
    Convert Phase 2 consensus points into Feature Backlog (P0-P3).
    This is the main Phase 3 entry point.
    """
    if not request.project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    # Check if Phase 2 data exists
    phase2_path = os.path.join(DATA_DIR, request.project_id, "phase2.json")
    if not os.path.exists(phase2_path):
        raise HTTPException(
            status_code=404,
            detail="No Phase 2 data found. Run Phase 2 (/sentiment/analyze) first.",
        )

    agent = PMAgent(data_dir=os.path.abspath(DATA_DIR))
    try:
        result = await agent.structure_requirements(project_id=request.project_id)
        return {
            "project_id": result.project_id,
            "backlog": [f.model_dump() for f in result.backlog],
            "summary": result.summary,
            "generated_at": result.generated_at.isoformat(),
            "feature_count": len(result.backlog),
            "p0_count": sum(1 for f in result.backlog if f.priority == "P0"),
            "p1_count": sum(1 for f in result.backlog if f.priority == "P1"),
            "p2_count": sum(1 for f in result.backlog if f.priority == "P2"),
            "p3_count": sum(1 for f in result.backlog if f.priority == "P3"),
            "status": "ok",
        }
    except Exception as e:
        print(f"[StructuringRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/result")
async def save_structuring_result(project_id: str, data: dict):
    """Save Phase 3 output (Feature Backlog) for the next phase."""
    try:
        project_dir = os.path.join(DATA_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase3.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        return {"project_id": project_id, "saved": True, "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {e}")


@router.get("/{project_id}/result")
async def get_structuring_result(project_id: str):
    """Get Phase 3 output for Phase 4 to consume."""
    data = PMAgent.load_phase3_output(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="No Phase 3 data found. Run /structure first.")
    return {"project_id": project_id, "data": data, "status": "ok"}
