"""
Shared data models (Pydantic).
Used across all modules. Changes here affect all Phases.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Project ──────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = ""


class Project(BaseModel):
    id: str
    name: str
    description: str = ""
    created_at: datetime
    current_phase: int = 1  # 1-4


# ─── Phase 1: Niche Discovery ─────────────────────────────

class NicheCandidate(BaseModel):
    slug: str  # e.g. "chill-coop-farming"
    name: str  # e.g. "Chill Co-op Farming"
    search_volume: int = 0  # estimated monthly searches
    difficulty: float = 0.0  # keyword difficulty 0-100
    core_compromise: str = ""  # e.g. "without zombies"
    positioning: str = ""  # one-line positioning
    sources: list[str] = []  # where this data came from


class Phase1Output(BaseModel):
    project_id: str
    query: str  # original search term
    candidates: list[NicheCandidate] = []
    generated_at: datetime


# ─── Phase 2: Sentiment Analysis ───────────────────────────

class ConsensusPoint(BaseModel):
    id: str
    pain_point: str  # what players hate about existing games
    underlying_need: str  # what they actually want
    quote: str  # verbatim player comment (simulated or real)
    sentiment_score: float = 0.0  # -1 to 1
    source_url: str = ""
    source_platform: str = ""  # reddit, bili, taptap, etc.
    upvotes: int = 0


class Phase2Output(BaseModel):
    project_id: str
    niche_slug: str
    consensus_points: list[ConsensusPoint] = []
    emotion_keywords: list[str] = []  # high-frequency emotion words
    scenario_keywords: list[str] = []  # high-frequency scenario words
    generated_at: datetime


# ─── Phase 3: Feature Backlog ──────────────────────────────

class PriorityLevel(str):
    P0 = "P0"  # Must have — core loop
    P1 = "P1"  # Should have — key differentiator
    P2 = P2 = "P2"  # Nice to have — polish
    P3 = "P3"  # Later — stretch goals


class FeatureItem(BaseModel):
    id: str
    raw_complaint: str  # original player complaint
    intensity: float = 0.0  # emotional intensity 0-1
    game_mechanism: str  # translated into game design language
    priority: str = "P2"  # P0-P3
    source_consensus_id: str = ""  # links back to Phase 2
    notes: str = ""


class Phase3Output(BaseModel):
    project_id: str
    backlog: list[FeatureItem] = []
    summary: str = ""  # one-paragraph summary of the game concept
    generated_at: datetime


# ─── Phase 4: Generated Assets ─────────────────────────────

class GeneratedAssets(BaseModel):
    project_id: str
    elevator_pitch: str = ""  # one-sentence hook
    steam_short_desc: str = ""  # optimized for SEO + player terms
    devlog_topic: str = ""  # first devlog title + angle
    tag_suggestions: list[str] = []  # Steam tags
    generated_at: datetime
