"""
Reddit Crawler.
Uses Reddit's public JSON API (no auth needed for public data).
Falls back to old.reddit.com if needed.

Lightweight — respects machine resource limits.
No PRAW dependency (keeps it simple).
"""

import httpx
import json
import asyncio
from typing import Optional
from datetime import datetime


class RedditCrawler:
    """
    Fetch public Reddit data without authentication.
    Uses .json suffix on Reddit URLs.
    """

    HEADERS = {
        "User-Agent": "GamingPMAgent/0.1 (research/educational)"
    }

    # Key subreddits for game discovery
    DEFAULT_SUBREDDITS = [
        "gamingsuggestions",
        "indiegaming",
        "games",
        "TrueGaming",
        "rpg_gamers",
        "cozygamers",
    ]

    def __init__(self, timeout: float = 15.0):
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers=self.HEADERS,
            follow_redirects=True,
        )

    async def search_subreddit(
        self,
        subreddit: str,
        query: str,
        sort: str = "relevance",
        limit: int = 25,
        before: Optional[str] = None,
    ) -> list[dict]:
        """
        Search posts in a subreddit by keyword.
        Returns list of post dicts with metadata.
        """
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params = {
            "q": query,
            "sort": sort,
            "limit": limit,
            "restrict_sr": "on",  # restrict to this subreddit
        }
        if before:
            params["before"] = before

        try:
            resp = await self.client.get(url, params=params)
            if resp.status_code == 429:
                # Rate limited — wait and retry once
                await asyncio.sleep(2)
                resp = await self.client.get(url, params=params)

            resp.raise_for_status()
            data = resp.json()

            posts = []
            for child in data.get("data", {}).get("children", []):
                post_data = child.get("data", {})
                posts.append({
                    "id": post_data.get("id", ""),
                    "title": post_data.get("title", ""),
                    "selftext": post_data.get("selftext", "")[:2000],  # truncate long text
                    "author": post_data.get("author", ""),
                    "subreddit": post_data.get("subreddit", ""),
                    "upvotes": post_data.get("ups", 0),
                    "comment_count": post_data.get("num_comments", 0),
                    "created_utc": post_data.get("created_utc", 0),
                    "url": f"https://www.reddit.com{post_data.get('permalink', '')}",
                    "is_text_post": post_data.get("is_self", False),
                })
            return posts

        except Exception as e:
            print(f"[RedditCrawler] Error searching r/{subreddit}: {e}")
            return []

    async def get_post_comments(
        self,
        subreddit: str,
        post_id: str,
        limit: int = 50,
    ) -> list[dict]:
        """Get comments for a specific post."""
        url = f"https://www.reddit.com/r/{subreddit}/comments/{post_id}.json"
        params = {"limit": limit}

        try:
            resp = await self.client.get(url, params=params)
            if resp.status_code == 429:
                await asyncio.sleep(2)
                resp = await self.client.get(url, params=params)

            resp.raise_for_status()
            data = resp.json()

            comments = []
            # Comments are in the second element of the response
            if len(data) > 1:
                for child in data[1].get("data", {}).get("children", []):
                    comment_data = child.get("data", {})
                    # Skip 'more' comments (load more links)
                    if child.get("kind") == "more":
                        continue
                    comments.append({
                        "id": comment_data.get("id", ""),
                        "body": comment_data.get("body", "")[:2000],
                        "author": comment_data.get("author", ""),
                        "upvotes": comment_data.get("ups", 0),
                        "depth": comment_data.get("depth", 0),
                        "is_submitter": comment_data.get("is_submitter", False),
                    })
            return comments

        except Exception as e:
            print(f"[RedditCrawler] Error fetching comments for {post_id}: {e}")
            return []

    async def multi_subreddit_search(
        self,
        query: str,
        subreddits: list[str] | None = None,
        per_subreddit: int = 10,
    ) -> dict[str, list[dict]]:
        """Search across multiple subreddits concurrently."""
        if subreddits is None:
            subreddits = self.DEFAULT_SUBREDDITS

        tasks = [
            self.search_subreddit(sub, query, limit=per_subreddit)
            for sub in subreddits
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        output = {}
        for sub, result in zip(subreddits, results):
            if isinstance(result, Exception):
                print(f"[RedditCrawler] Failed r/{sub}: {result}")
                output[sub] = []
            else:
                output[sub] = result

        return output

    async def close(self):
        await self.client.aclose()


# Sync wrapper
async def search_reddit(query: str, subreddits: list[str] | None = None) -> dict:
    """Convenience function: search Reddit across subreddits."""
    crawler = RedditCrawler()
    try:
        return await crawler.multi_subreddit_search(query, subreddits)
    finally:
        await crawler.close()
