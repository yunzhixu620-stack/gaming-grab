"""
Phase 3: Data Structuring Router
Handles converting raw sentiment data into structured Feature Backlog.
Independent — does not import from other routers.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/backlog")
async def get_feature_backlog(project_id: str):
    """Get saved feature backlog for a project."""
    # TODO: Implement in P3-STRUCTURING development phase
    return {"project_id": project_id, "backlog": [], "status": "not_implemented"}


@router.post("/structure")
async def structure_requirements(project_id: str):
    """Convert Phase 2 consensus points into Feature Backlog (P0-P3)."""
    # TODO: Implement in P3-STRUCTURING development phase
    return {"project_id": project_id, "backlog": [], "status": "not_implemented"}


@router.post("/{project_id}/result")
async def save_structuring_result(project_id: str, data: dict):
    """Save Phase 3 output (Feature Backlog) for the next phase."""
    # TODO: Save to data/projects/{project_id}/phase3.json
    return {"project_id": project_id, "saved": True, "status": "not_implemented"}


@router.get("/{project_id}/result")
async def get_structuring_result(project_id: str):
    """Get Phase 3 output for Phase 4 to consume."""
    # TODO: Read from data/projects/{project_id}/phase3.json
    return {"project_id": project_id, "data": None, "status": "not_implemented"}
