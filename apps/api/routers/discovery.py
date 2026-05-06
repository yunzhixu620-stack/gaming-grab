"""
Phase 1: Niche Discovery Router
Handles keyword research and niche category discovery.
Independent — does not import from other routers.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/niches")
async def list_niche_candidates(project_id: str):
    """Get saved niche candidates for a project."""
    # TODO: Implement in P1-DISCOVERY development phase
    return {"project_id": project_id, "niches": [], "status": "not_implemented"}


@router.post("/niches/search")
async def search_niches(query: str, project_id: str = ""):
    """Search for niche categories based on a broad game genre/keyword."""
    # TODO: Implement in P1-DISCOVERY development phase
    return {"query": query, "project_id": project_id, "results": [], "status": "not_implemented"}


@router.post("/{project_id}/result")
async def save_discovery_result(project_id: str, data: dict):
    """Save Phase 1 output (niche candidate pool) for the next phase."""
    # TODO: Save to data/projects/{project_id}/phase1.json
    return {"project_id": project_id, "saved": True, "status": "not_implemented"}


@router.get("/{project_id}/result")
async def get_discovery_result(project_id: str):
    """Get Phase 1 output for Phase 2 to consume."""
    # TODO: Read from data/projects/{project_id}/phase1.json
    return {"project_id": project_id, "data": None, "status": "not_implemented"}
