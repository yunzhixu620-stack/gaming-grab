"""
Phase 4: Asset Generation Router — REAL IMPLEMENTATION.
Generates marketing assets from Feature Backlog (Phase 3).
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
from services.asset_generator import AssetGenerator
from models import GeneratedAssets

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "projects")


class GenerateRequest(BaseModel):
    project_id: str = ""
    custom_name: str = ""
    custom_genre: str = ""


@router.get("/assets")
async def get_assets(project_id: str):
    """Get saved generated assets."""
    data = AssetGenerator.load_phase4_output(project_id)
    if not data:
        return {"project_id": project_id, "assets": None, "status": "no_data"}
    return {"project_id": project_id, **data, "status": "ok"}


@router.post("/generate")
async def generate_assets(request: GenerateRequest):
    """
    Generate all marketing assets from Phase 3 Feature Backlog.
    This is the main Phase 4 entry point.
    """
    if not request.project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    # Check if Phase 3 data exists
    phase3_path = os.path.join(DATA_DIR, request.project_id, "phase3.json")
    if not os.path.exists(phase3_path):
        raise HTTPException(
            status_code=404,
            detail="No Phase 3 data found. Run Phase 3 (/structuring/structure) first.",
        )

    generator = AssetGenerator(data_dir=os.path.abspath(DATA_DIR))
    try:
        result = await generator.generate_assets(
            project_id=request.project_id,
            custom_name=request.custom_name,
            custom_genre=request.custom_genre,
        )
        return {
            "project_id": result.project_id,
            "elevator_pitch": result.elevator_pitch,
            "steam_short_desc": result.steam_short_desc,
            "devlog_topic": result.devlog_topic,
            "tag_suggestions": result.tag_suggestions,
            "generated_at": result.generated_at.isoformat(),
            "tag_count": len(result.tag_suggestions),
            "status": "ok",
        }
    except Exception as e:
        print(f"[AssetGenRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/result")
async def save_asset_result(project_id: str, data: dict):
    """Save Phase 4 output."""
    try:
        project_dir = os.path.join(DATA_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase4.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        return {"project_id": project_id, "saved": True, "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {e}")


@router.get("/{project_id}/result")
async def get_asset_result(project_id: str):
    """Get Phase 4 output."""
    data = AssetGenerator.load_phase4_output(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="No Phase 4 data found. Run /generate first.")
    return {"project_id": project_id, "data": data, "status": "ok"}
