"""
Domestic Platform Crawlers — Phase 1+2 Extension.
Supports: TapTap, Xiaohongshu (RED), Bilibili.

Strategy:
- TapTap: Public search API (no auth for basic search)
- Xiaohongshu: Web scraping via httpx (public pages)
- Bilibili: Public JSON API (no auth for basic video search)

All crawlers follow the same interface as reddit_crawler.py.
"""

import asyncio
import json
import os
import re
import sys
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

import httpx

_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)


# ─── Base Interface ─────────────────────────────────────

class DomesticCrawler(ABC):
    """Base class for all domestic platform crawlers."""

    PLATFORM_NAME = ""
    BASE_URL = ""

    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout
        self.client = httpx.AsyncClient(
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/html, */*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            },
            timeout=httpx.Timeout(timeout),
            follow_redirects=True,
        )

    async def close(self):
        await self.client.aclose()

    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> list[dict]:
        """Search for game-related content on this platform."""
        ...

    @abstractmethod
    async def get_detail(self, item_id: str) -> dict:
        """Get detailed info for a specific item."""
        ...


# ─── TapTap Crawler ─────────────────────────────────────

class TaptapCrawler(DomesticCrawler):
    """
    TapTap Game Community Crawler.
    Uses public search API + game detail pages.
    """

    PLATFORM_NAME = "taptap"
    BASE_URL = "https://www.taptap.cn"

    async def search(self, query: str, limit: int = 10) -> list[dict]:
        """Search games on TapTap."""
        results = []
        try:
            # TapTap web search endpoint
            url = f"{self.BASE_URL}/webapiv2/search/v1/search"
            params = {
                "keyword": query,
                "limit": limit,
                "type": "app",  # Search for apps/games
            }
            resp = await self.client.get(url, params=params)

            # Check content type before JSON parse
            content_type = resp.headers.get("content-type", "")
            if "json" not in content_type:
                print(f"[TaptapCrawler] Non-JSON response (content-type: {content_type}, status: {resp.status_code})")
                return []

            data = resp.json()

            items = data.get("data", {}).get("list", [])
            for item in items[:limit]:
                results.append({
                    "platform": self.PLATFORM_NAME,
                    "id": str(item.get("id", "")),
                    "title": item.get("title", ""),
                    "description": item.get("description", "") or "",
                    "icon_url": item.get("icon", "") or "",
                    "score": float(item.get("score", 0) or 0),
                    "category": item.get("primary_category_name", "") or "",
                    "tags": [t.get("name", "") for t in (item.get("tags") or [])],
                    "url": f"{self.BASE_URL}/app/{item.get('id', '')}",
                    "downloads": item.get("stat_info", {}).get("newly", 0) or 0,
                    "followers": item.get("stat_info", {}).get("followed", 0) or 0,
                    "raw": item,
                })
        except Exception as e:
            print(f"[TaptapCrawler] Search error: {e}")
            # Fallback: return mock-like structure so pipeline doesn't break
            results.append({
                "platform": self.PLATFORM_NAME,
                "id": "fallback",
                "title": f"[TapTap] Search: {query}",
                "description": f"TapTap search unavailable ({str(e)[:80]}). Use web UI directly.",
                "icon_url": "",
                "score": 0,
                "category": "",
                "tags": [],
                "url": f"{self.BASE_URL}/search?keyword={query}",
                "downloads": 0,
                "followers": 0,
                "raw": {},
            })

        return results

    async def get_detail(self, app_id: str) -> dict:
        """Get detailed game info from TapTap."""
        try:
            url = f"{self.BASE_URL}/webapiv2/app/v1/detail-by-id/{app_id}"
            resp = await self.client.get(url)
            return resp.json().get("data", {})
        except Exception as e:
            print(f"[TaptapCrawler] Detail error: {e}")
            return {}

    async def get_game_reviews(self, app_id: str, limit: int = 20) -> list[dict]:
        """Get user reviews for sentiment analysis."""
        reviews = []
        try:
            url = f"{self.BASE_URL}/webapiv2/review/v1/by-app"
            params = {"app_id": app_id, "limit": limit, "sort": "hot"}
            resp = await self.client.get(url, params=params)
            data = resp.json()
            items = data.get("data", {}).get("list", [])
            for item in items:
                reviews.append({
                    "platform": self.PLATFORM_NAME,
                    "review_id": str(item.get("id", "")),
                    "content": item.get("contents", "") or "",
                    "author": item.get("user", {}).get("nickname", "") or "",
                    "score": float(item.get("score", 0) or 0),
                    "likes": item.get("like_count", 0) or 0,
                    "created_at": item.get("created_time", 0),
                    "raw": item,
                })
        except Exception as e:
            print(f"[TaptapCrawler] Reviews error: {e}")
        return reviews


# ─── Xiaohongshu (RED) Crawler ──────────────────────────

class XiaohongshuCrawler(DomesticCrawler):
    """
    Xiaohongshu (Little Red Book) Crawler.
    Scrapes public note pages for gaming-related content.
    """

    PLATFORM_NAME = "xiaohongshu"
    BASE_URL = "https://www.xiaohongshu.com"

    async def search(self, query: str, limit: int = 10) -> list[dict]:
        """Search notes on Xiaohongshu."""
        results = []
        try:
            # XHS uses a different API pattern
            url = "https://edith.xiaohongshu.com/api/sns/web/v1/search/notes"
            params = {
                "keyword": query,
                "page": 1,
                "page_size": limit,
                "sort": "general",
                "note_type": 0,
            }
            resp = await self.client.get(url, params=params)

            # Check content type before JSON parse
            content_type = resp.headers.get("content-type", "")
            if "json" not in content_type:
                print(f"[XiaohongshuCrawler] Non-JSON response (content-type: {content_type}, status: {resp.status_code})")
                return []

            data = resp.json()

            items = data.get("data", {}).get("items", [])
            for item in items[:limit]:
                note = item.get("note_card", item)
                results.append({
                    "platform": self.PLATFORM_NAME,
                    "id": note.get("display_id", ""),
                    "title": note.get("display_title", ""),
                    "description": note.get("desc", "") or "",
                    "cover_url": note.get("cover", {}).get("url_default", "")
                                or note.get("cover", {}).get("url", "") or "",
                    "likes": note.get("interact_info", {}).get("liked_count", "") or "0",
                    "user": note.get("user", {}).get("nickname", "") or "",
                    "type": note.get("type", "") or "",
                    "url": f"{self.BASE_URL}/explore/{note.get('display_id', '')}",
                    "tags": [t.get("name", "") for t in (note.get("tag_list") or [])],
                    "raw": item,
                })
        except Exception as e:
            print(f"[XiaohongshuCrawler] Search error: {e}")
            results.append({
                "platform": self.PLATFORM_NAME,
                "id": "fallback",
                "title": f"[XHS] Search: {query}",
                "description": f"Xiaohongshu search unavailable ({str(e)[:80]}). Use web UI directly.",
                "cover_url": "",
                "likes": "0",
                "user": "",
                "type": "",
                "url": f"{self.BASE_URL}/search_result?keyword={query}&source=web_explore_feed",
                "tags": [],
                "raw": {},
            })

        return results

    async def get_detail(self, note_id: str) -> dict:
        """Get detailed note content."""
        try:
            url = f"{self.BASE_URL}/discovery/item/{note_id}"
            resp = await self.client.get(url)
            # Parse SSR data from HTML
            html = resp.text
            match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});', html, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            return {}
        except Exception as e:
            print(f"[XiaohongshuCrawler] Detail error: {e}")
            return {}

    async def get_note_comments(self, note_id: str, limit: int = 30) -> list[dict]:
        """Get comments for sentiment analysis."""
        comments = []
        try:
            url = "https://edith.xiaohongshu.com/api/sns/web/v2/comment/page"
            params = {
                "note_id": note_id,
                "cursor": "",
                "top_comment_id": "",
                "image_formats": "jpg,webp,avif",
            }
            resp = await self.client.get(url, params=params)
            data = resp.json()
            items = data.get("data", {}).get("comments", [])
            for item in items[:limit]:
                comments.append({
                    "platform": self.PLATFORM_NAME,
                    "comment_id": item.get("id", ""),
                    "content": item.get("content", "") or "",
                    "user": item.get("user_info", {}).get("nickname", "") or "",
                    "likes": item.get("like_count", 0) or 0,
                    "created_at": item.get("create_time", 0),
                    "raw": item,
                })
        except Exception as e:
            print(f"[XiaohongshuCrawler] Comments error: {e}")
        return comments


# ─── Bilibili Crawler ──────────────────────────────────

class BilibiliCrawler(DomesticCrawler):
    """
    Bilibili Video Platform Crawler.
    Uses public search and video APIs.
    """

    PLATFORM_NAME = "bilibili"
    BASE_URL = "https://api.bilibili.com"

    async def search(self, query: str, limit: int = 10) -> list[dict]:
        """Search videos on Bilibili."""
        results = []
        try:
            url = f"{self.BASE_URL}/x/web-interface/search/type"
            params = {
                "keyword": query,
                "search_type": "video",
                "page": 1,
                "page_size": limit,
                "order": "totalrank",
            }
            resp = await self.client.get(url, params=params)

            # Check content type before JSON parse
            content_type = resp.headers.get("content-type", "")
            if "json" not in content_type:
                print(f"[BilibiliCrawler] Non-JSON response (content-type: {content_type}, status: {resp.status_code})")
                return []

            data = resp.json()

            items = data.get("data", {}).get("result", []) or []
            for item in items[:limit]:
                # Clean HTML tags from description
                desc = re.sub(r"<[^>]+>", "", item.get("description", "") or "")
                results.append({
                    "platform": self.PLATFORM_NAME,
                    "id": str(item.get("bvid", "")),
                    "title": item.get("title", "") or "",
                    "description": desc[:300],
                    "cover_url": item.get("pic", "") or "",
                    "author": item.get("author", "") or "",
                    "views": int(item.get("play", 0) or 0),
                    "danmaku": int(item.get("video_review", 0) or 0),
                    "favorites": int(item.get("favorites", 0) or 0),
                    "duration": item.get("duration", "") or "",
                    "pubdate": item.get("pubdate", 0) or 0,
                    "url": f"https://www.bilibili.com/video/{item.get('bvid', '')}",
                    "tag": item.get("tag", "") or "",
                    "raw": item,
                })
        except Exception as e:
            print(f"[BilibiliCrawler] Search error: {e}")
            results.append({
                "platform": self.PLATFORM_NAME,
                "id": "fallback",
                "title": f"[BiliBili] Search: {query}",
                "description": f"Bilibili search unavailable ({str(e)[:80]}). Use web UI directly.",
                "cover_url": "",
                "author": "",
                "views": 0,
                "danmaku": 0,
                "favorites": 0,
                "duration": "",
                "pubdate": 0,
                "url": f"https://search.bilibili.com/all?keyword={query}",
                "tag": "",
                "raw": {},
            })

        return results

    async def get_detail(self, bvid: str) -> dict:
        """Get detailed video info."""
        try:
            url = f"{self.BASE_URL}/x/web-interface/view"
            params = {"bvid": bvid}
            resp = await self.client.get(url, params=params)
            return resp.json().get("data", {})
        except Exception as e:
            print(f"[BilibiliCrawler] Detail error: {e}")
            return {}

    async def get_video_comments(self, aid: int | str, limit: int = 30) -> list[dict]:
        """Get video comments (danmaku + replies) for sentiment analysis."""
        comments = []
        try:
            url = f"{self.BASE_URL}/x/v2/reply"
            params = {
                "type": 1,  # Video type
                "oid": aid,
                "pn": 1,
                "ps": limit,
                "sort": 1,
            }
            resp = await self.client.get(url, params=params)
            data = resp.json()
            items = data.get("data", {}).get("replies", []) or []
            for item in items[:limit]:
                # Get main reply
                member = item.get("member", {})
                comment_text = item.get("content", {}).get("message", "") or ""
                comments.append({
                    "platform": self.PLATFORM_NAME,
                    "comment_id": str(item.get("rpid", "")),
                    "content": comment_text,
                    "user": member.get("uname", "") or "",
                    "likes": item.get("like", 0) or 0,
                    created_at_str: item.get("ctime", 0),
                    "raw": item,
                })

                # Also get sub-replies (replies to this comment)
                for sub in (item.get("replies") or [])[:5]:
                    sub_member = sub.get("member", {})
                    sub_text = sub.get("content", {}).get("message", "") or ""
                    comments.append({
                        "platform": self.PLATFORM_NAME,
                        "comment_id": str(sub.get("rpid", "")),
                        "content": sub_text,
                        "user": sub_member.get("uname", "") or "",
                        "likes": sub.get("like", 0) or 0,
                        "is_reply_to": comment_text[:50],
                        "raw": sub,
                    })
        except Exception as e:
            print(f"[BilibiliCrawler] Comments error: {e}")
        return comments


# ─── Unified Multi-Platform Search ──────────────────────

async def multi_platform_search(
    query: str,
    platforms: list[str] | None = None,
    per_platform_limit: int = 8,
) -> dict[str, list[dict]]:
    """
    Search across multiple domestic platforms simultaneously.
    Returns results grouped by platform name.
    """
    if platforms is None:
        platforms = ["taptap", "xiaohongshu", "bilibili"]

    crawler_map = {
        "taptap": TaptapCrawler,
        "xiaohongshu": XiaohongshuCrawler,
        "bilibili": BilibiliCrawler,
    }

    tasks = {}
    for p in platforms:
        if p in crawler_map:
            crawler_cls = crawler_map[p]
            crawler = crawler_cls()
            tasks[p] = crawler.search(query, limit=per_platform_limit)

    results = {}
    for platform_name, task in tasks.items():
        try:
            results[platform_name] = await task
        except Exception as e:
            print(f"[MultiSearch] Error on {platform_name}: {e}")
            results[platform_name] = []

    return results


async def get_domestic_sentiment_data(
    query: str,
    platforms: list[str] | None = None,
) -> list[dict]:
    """
    Get all sentiment-ready data from domestic platforms.
    Returns unified format for VADER analysis.
    """
    all_data = []

    # Search each platform
    search_results = await multi_platform_search(query, platforms=platforms)

    # For each result, fetch comments/reviews where available
    taptap_items = search_results.get("taptap", [])
    xhs_items = search_results.get("xiaohongshu", [])
    bili_items = search_results.get("bilibili", [])

    # TapTap reviews
    taptap = TaptapCrawler()
    for item in taptap_items[:3]:  # Top 3 games only
        if item.get("id") and item["id"] != "fallback":
            reviews = await taptap.get_game_reviews(item["id"], limit=10)
            for r in reviews:
                all_data.append({
                    **r,
                    "source_title": item.get("title", ""),
                    "source_url": item.get("url", ""),
                })
    await taptap.close()

    # XHS comments
    xhs = XiaohongshuCrawler()
    for item in xhs_items[:3]:  # Top 3 notes only
        if item.get("id") and item["id"] != "fallback":
            comments = await xhs.get_note_comments(item["id"], limit=15)
            for c in comments:
                all_data.append({
                    **c,
                    "source_title": item.get("title", ""),
                    "source_url": item.get("url", ""),
                })
    await xhs.close()

    # Bilibili comments
    bili = BilibiliCrawler()
    for item in bili_items[:3]:  # Top 3 videos only
        if item.get("id") and item["id"] != "fallback":
            # Need AID for comments, get from detail first
            detail = await bili.get_detail(item["id"])
            aid = detail.get("aid", "")
            if aid:
                comments = await bili.get_video_comments(aid, limit=15)
                for c in comments:
                    all_data.append({
                        **c,
                        "source_title": item.get("title", ""),
                        "source_url": item.get("url", ""),
                    })
    await bili.close()

    return all_data
