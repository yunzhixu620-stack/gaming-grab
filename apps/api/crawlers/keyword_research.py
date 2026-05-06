"""
Keyword Research Crawler.
Uses Google Autocomplete / suggestion APIs to find long-tail keywords.
Free, no API key needed for basic usage.

Lightweight design — respects machine resource limits.
"""

import httpx
from typing import Optional
import json


class KeywordResearcher:
    """Find long-tail keyword variations for a broad game term."""

    BASE_URLS = {
        # Google Autocomplete (free, no key)
        "google_suggest": "http://suggestqueries.google.com/complete/search",
        # Reddit subreddit search (JSON, no auth for public)
        "reddit_search": "https://www.reddit.com/r/gamingsuggestions/search.json",
    }

    def __init__(self, timeout: float = 10.0):
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={"User-Agent": "GamingPMAgent/0.1 (research)"},
            follow_redirects=True,
        )

    async def get_google_suggestions(self, query: str, lang: str = "en") -> list[str]:
        """Get Google autocomplete suggestions for a query."""
        params = {"client": "firefox", "q": query, "lang": lang}
        try:
            resp = await self.client.get(
                self.BASE_URLS["google_suggest"], params=params
            )
            resp.raise_for_status()
            data = resp.json()
            # Google returns [query, [suggestions]]
            if isinstance(data, list) and len(data) > 1:
                return data[1]
            return []
        except Exception as e:
            print(f"[KeywordResearcher] Google suggest error: {e}")
            return []

    async def expand_query(self, base_query: str, modifiers: list[str] | None = None) -> dict:
        """
        Expand a base query with modifiers and collect all suggestions.
        Returns structured data for Scout Agent analysis.
        """
        if modifiers is None:
            # Default game-relevant modifiers for niche discovery
            modifiers = [
                "co-op", "multiplayer", "online", "single player",
                "relaxing", "chill", "no combat", "puzzle",
                "building", "survival", "sandbox", "open world",
                "horror", "pixel", "indie", "free", "mobile",
                "like minecraft", "like stardew valley", "2024 2025",
                "for couples", "low stress", "beginner friendly",
            ]

        results = {}
        # Base query suggestions
        base_results = await self.get_google_suggestions(base_query)
        results["_base"] = base_results

        # Modified queries
        for mod in modifiers:
            full_query = f"{base_query} {mod}"
            suggestions = await self.get_google_suggestions(full_query)
            if suggestions:
                results[mod] = suggestions

        await self.client.aclose()
        return results

    async def close(self):
        await self.client.aclose()


# Sync wrapper for simple usage
async def research_keywords(query: str) -> dict:
    """Convenience function: research keywords for a query."""
    researcher = KeywordResearcher()
    try:
        return await researcher.expand_query(query)
    finally:
        await researcher.close()
