"""
Phase 4: Asset Generation Router
Handles generating Steam-ready assets (pitch, description, devlog topics).
Independent — does not import from other routers.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/assets")
async def get_generated_assets(project_id: str):
    """Get saved assets for a project."""
    # TODO: Implement in P4-ASSET-GEN development phase
    return {"project_id": project_id, "assets": {}, "status": "not_implemented"}


@router.post("/generate")
async def generate_assets(project_id: str):
    """Generate elevator pitch, Steam description, and devlog topic from Feature Backlog."""
    # TODO: Implement in P4-ASSET-GEN development phase
    return {"project_id": project_id, "assets": {}, "status": "not_implemented"}


@router.post("/{project_id}/result")
async def save_asset_result(project_id: str, data: dict):
    """Save Phase 4 output (final assets)."""
    # TODO: Save to data/projects/{project_id}/phase4.json
    return {"project_id": project_id, "saved": True, "status": "not_implemented"}


@router.get("/{project_id}/result")
async def get_asset_result(project_id: str):
    """Get Phase 4 final output."""
    # TODO: Read from data/projects/{project_id}/phase4.json
    return {"project_id": project_id, "data": None, "status": "not_implemented"}
