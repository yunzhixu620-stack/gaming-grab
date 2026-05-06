"""
Phase 2: Sentiment & Consensus Analysis Router
Handles Reddit/social media sentiment analysis.
Independent — does not import from other routers.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/consensus")
async def get_consensus_points(project_id: str):
    """Get saved consensus points for a project."""
    # TODO: Implement in P2-SENTIMENT development phase
    return {"project_id": project_id, "consensus_points": [], "status": "not_implemented"}


@router.post("/analyze")
async def analyze_sentiment(niche_slug: str, project_id: str = ""):
    """Analyze Reddit sentiment for a selected niche category."""
    # TODO: Implement in P2-SENTIMENT development phase
    return {"niche_slug": niche_slug, "project_id": project_id, "results": [], "status": "not_implemented"}


@router.post("/{project_id}/result")
async def save_sentiment_result(project_id: str, data: dict):
    """Save Phase 2 output (consensus points) for the next phase."""
    # TODO: Save to data/projects/{project_id}/phase2.json
    return {"project_id": project_id, "saved": True, "status": "not_implemented"}


@router.get("/{project_id}/result")
async def get_sentiment_result(project_id: str):
    """Get Phase 2 output for Phase 3 to consume."""
    # TODO: Read from data/projects/{project_id}/phase2.json
    return {"project_id": project_id, "data": None, "status": "not_implemented"}
