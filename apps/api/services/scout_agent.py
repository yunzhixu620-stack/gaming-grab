"""
Scout Agent — Phase 1 Business Logic.
Takes raw keyword data + Reddit posts, analyzes them, and produces
structured NicheCandidate list.

This is the "brain" of Phase 1 — it transforms raw data into insights.
"""

import json
import re
import os
from datetime import datetime
from typing import Optional

# Import our crawlers (same module, no cross-router imports)
import sys
import os
_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from crawlers.keyword_research import KeywordResearcher
from crawlers.reddit_crawler import RedditCrawler

# Import shared models
from models import NicheCandidate, Phase1Output


class ScoutAgent:
    """
    Analyzes keyword suggestions and Reddit discussions to identify
    underserved niche game categories.
    """

    # Keywords that indicate player frustration / unmet needs
    PAIN_INDICATORS = [
        "without", "no", "but not", "hate", "tired of",
        "why is there no", "wish there was", "looking for",
        "can't find", "nothing like", "frustrated",
        "disappointed", "boring", "repetitive", "grindy",
        "pay to win", "p2w", "always online", "always-online",
        "too stressful", "too hard", "casuals need not",
        "no solo", "forced multiplayer",
    ]

    # Keywords that indicate positive desire / ideal experience
    DESIRE_INDICATORS = [
        "chill", "relaxing", "cozy", "peaceful",
        "like X but", "similar to", "recommend me",
        "hidden gem", "underrated", "overlooked",
        "perfect for", "great with friends",
        "beginner friendly", "accessible",
        "creative", "sandbox", "build your own",
    ]

    def __init__(self, data_dir: str = "data/projects"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    async def discover_niches(
        self,
        query: str,
        project_id: str = "",
    ) -> Phase1Output:
        """
        Full pipeline: keyword research → analyze → generate candidates.
        """
        print(f"[ScoutAgent] Starting niche discovery for: {query}")

        # Step 1: Get keyword suggestions
        researcher = KeywordResearcher()
        try:
            keyword_data = await researcher.expand_query(query)
        finally:
            await researcher.close()

        # Step 2: Search Reddit for context (optional, can run in parallel)
        crawler = RedditCrawler()
        try:
            reddit_data = await crawler.multi_subreddit_search(
                query, per_subreddit=5
            )
        except Exception as e:
            print(f"[ScoutAgent] Reddit search failed (non-fatal): {e}")
            reddit_data = {}
        finally:
            await crawler.close()

        # Step 3: Analyze and extract niche candidates
        candidates = self._analyze_keyword_data(query, keyword_data, reddit_data)

        # Step 4: Build output
        output = Phase1Output(
            project_id=project_id,
            query=query,
            candidates=candidates,
            generated_at=datetime.now(),
        )

        # Step 5: Save to file
        if project_id:
            self._save_phase1_output(project_id, output)

        return output

    def _analyze_keyword_data(
        self,
        base_query: str,
        keyword_data: dict,
        reddit_data: dict,
    ) -> list[NicheCandidate]:
        """Transform raw keyword + Reddit data into structured candidates."""

        candidates = []
        seen_slugs = set()

        # Process base suggestions
        base_suggestions = keyword_data.get("_base", [])
        for suggestion in base_suggestions[:10]:
            slug = self._slugify(suggestion)
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            candidate = NicheCandidate(
                slug=slug,
                name=suggestion.title(),
                search_volume=0,  # Would need API for real volume
                difficulty=0.0,   # Would need API for real KD
                core_compromise=self._extract_compromise(suggestion),
                positioning=f"Games about {suggestion.lower()}",
                sources=["google_autocomplete"],
            )
            candidates.append(candidate)

        # Process modifier-based suggestions (richer data)
        for modifier, suggestions in keyword_data.items():
            if modifier.startswith("_"):
                continue
            for suggestion in suggestions[:3]:  # Top 3 per modifier
                slug = self._slugify(suggestion)
                if slug in seen_slugs:
                    continue
                seen_slugs.add(slug)

                # Check if this has pain/desire signals
                pain_score = self._count_indicators(suggestion, self.PAIN_INDICATORS)
                desire_score = self._count_indicators(suggestion, self.DESIRE_INDICATORS)

                candidate = NicheCandidate(
                    slug=slug,
                    name=suggestion.title(),
                    search_volume=0,
                    difficulty=round(50.0 - desire_score * 10, 1),  # Higher desire = lower difficulty proxy
                    core_compromise=self._extract_compromise(suggestion),
                    positioning=self._generate_positioning(suggestion, modifier),
                    sources=["google_autocomplete", f"modifier:{modifier}"],
                )
                candidates.append(candidate)

        # Enrich with Reddit context if available
        if reddit_data:
            candidates = self._enrich_with_reddit(candidates, reddit_data)

        # Sort by potential (simple heuristic: more desire signals = higher potential)
        candidates.sort(key=lambda c: c.difficulty)  # Lower "difficulty" = higher potential in our scheme

        return candidates[:8]  # Return top 8 max

    def _extract_compromise(self, text: str) -> str:
        """Extract what players are compromising on / avoiding."""
        text_lower = text.lower()
        compromises = []

        # Common patterns
        patterns = [
            r"without\s+(.+?)(?:\s+and|\s+but|$)",
            r"no\s+(.+?)(?:\s+game|\s+mode|$)",
            r"not\s+(.+?)(?:\s+like|\s+as|$)",
            r"like\s+.+?\s+but\s+(.+?)(?:$|\.|,)",
            r"(?:but|except)\s+(.+?)(?:$|\.|,)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                compromises.append(match.group(1).strip())

        return "; ".join(compromises) if compromises else ""

    def _generate_positioning(self, suggestion: str, modifier: str) -> str:
        """Generate one-line positioning statement."""
        return (
            f"A game that combines {modifier.replace('_', ' ')} "
            f"with the core appeal of '{suggestion}', "
            f"targeting players who want something different."
        )

    def _count_indicators(self, text: str, indicators: list[str]) -> int:
        """Count how many indicator keywords appear in text."""
        text_lower = text.lower()
        count = 0
        for indicator in indicators:
            if indicator.lower() in text_lower:
                count += 1
        return count

    def _enrich_with_reddit(
        self,
        candidates: list[NicheCandidate],
        reddit_data: dict,
    ) -> list[NicheCandidate]:
        """Cross-reference candidates with Reddit discussion data."""
        # Collect all post titles from Reddit
        all_titles = []
        for sub, posts in reddit_data.items():
            for post in posts:
                all_titles.append(post.get("title", ""))

        # Simple keyword matching to enrich candidates
        for candidate in candidates:
            matching_posts = []
            name_words = set(candidate.name.lower().split())

            for title in all_titles:
                title_lower = title.lower()
                overlap = len(name_words & set(title_lower.split()))
                if overlap >= 2:  # At least 2 words match
                    matching_posts.append(title)

            if matching_posts:
                candidate.sources.append(f"reddit:{len(matching_posts)}_posts")

        return candidates

    def _slugify(self, text: str) -> str:
        """Convert text to URL-safe slug."""
        slug = text.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug.strip())
        return slug[:50] or "niche"

    def _save_phase1_output(self, project_id: str, output: Phase1Output):
        """Save output as JSON for next phase."""
        project_dir = os.path.join(self.data_dir, project_id)
        os.makedirs(project_dir, exist_ok=True)

        filepath = os.path.join(project_dir, "phase1.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output.model_dump(), f, indent=2, ensure_ascii=False, default=str)

        print(f"[ScoutAgent] Saved Phase 1 output to {filepath}")

    @staticmethod
    def load_phase1_output(project_id: str, data_dir: str = "data/projects") -> Optional[dict]:
        """Load previously saved Phase 1 output."""
        filepath = os.path.join(data_dir, project_id, "phase1.json")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return None
