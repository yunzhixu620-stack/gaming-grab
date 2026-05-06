"""
Reddit Analyst Agent — Phase 2 Business Logic.
Takes a selected niche from Phase 1, fetches Reddit discussions,
performs sentiment analysis, and extracts consensus points.

This is the "brain" of Phase 2 — raw posts → structured insights.
"""

import json
import os
import re
import asyncio
from datetime import datetime
from typing import Optional

import sys
_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from crawlers.reddit_crawler import RedditCrawler
from models import ConsensusPoint, Phase2Output

# Try to import VADER (lightweight, no GPU needed)
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _VADER_AVAILABLE = True
except ImportError:
    _VADER_AVAILABLE = False
    print("[RedditAnalyst] WARNING: vaderSentiment not installed. Run: pip install vaderSentiment")


class RedditAnalyst:
    """
    Analyzes Reddit discussions around a niche category.
    Produces structured consensus points with pain/desire signals.
    """

    # Subreddits to search for game sentiment analysis
    GAME_SUBREDDITS = [
        "gamingsuggestions",
        "indiegaming",
        "games",
        "TrueGaming",
        "rpg_gamers",
        "cozygamers",
        "gamedev",
        "patientgamers",
        "ShouldIbuythisgame",
    ]

    # Pain point patterns (what players complain about)
    PAIN_PATTERNS = [
        r"hate.*(when|that|how)",
        r"(why|what).*(no|not|never)",
        r"tired of",
        r"sick of",
        r"frustrat(ed|ing)",
        r"disappoint(ed|ing)",
        r"(too much|too many|too often)",
        r"(grindy|pay.to.win|p2w|always.online)",
        r"(can't|cannot|won't|don't).*find",
        r"wish there (was|were|is)",
        r"looking for.*like.*(but|except)",
        r"nothing like",
        r"(boring|repetitive|same old)",
        r"(forced|mandatory).*(multiplayer|online|social)",
        r"(casuals need not|hardcore only|git gud)",
    ]

    # Desire patterns (what players want)
    DESIRE_PATTERNS = [
        r"(wish|hope|want).*(had|was|could)",
        r"(looking for|need|seeking).*(recommend|suggest)",
        r"(hidden gem|underrated|overlooked)",
        r"(perfect for|great with|love that)",
        r"(chill|relaxing|cozy|peaceful)",
        r"(beginner friendly|accessible|easy to learn)",
        r"(creative|sandbox|build your own)",
        r"(like X but).*(better|different|without)",
        r"(any games like|similar to)",
        r"(finally|at last|exactly what)",
    ]

    def __init__(self, data_dir: str = "data/projects"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.analyzer = SentimentIntensityAnalyzer() if _VADER_AVAILABLE else None

    async def analyze_niche(
        self,
        niche_slug: str,
        niche_name: str,
        project_id: str = "",
        extra_queries: list[str] | None = None,
    ) -> Phase2Output:
        """
        Full pipeline: search Reddit → analyze posts → extract consensus points.
        """
        print(f"[RedditAnalyst] Analyzing niche: {niche_name} ({niche_slug})")

        # Step 1: Search Reddit with multiple query variations
        crawler = RedditCrawler()
        try:
            all_posts = await self._search_niche(crawler, niche_name, extra_queries)
        finally:
            await crawler.close()

        if not all_posts:
            print(f"[RedditAnalyst] No posts found for {niche_name}")
            return self._empty_output(project_id, niche_slug)

        # Step 2: Analyze each post's comments for deeper insights
        enriched_posts = await self._enrich_with_comments(crawler, all_posts[:5])

        # Step 3: Extract consensus points from posts + comments
        consensus_points = self._extract_consensus(enriched_posts)

        # Step 4: Aggregate emotion/scenario keywords
        emotion_keywords = self._extract_keywords(all_posts, type="emotion")
        scenario_keywords = self._extract_keywords(all_posts, type="scenario")

        # Step 5: Build output
        output = Phase2Output(
            project_id=project_id,
            niche_slug=niche_slug,
            consensus_points=consensus_points,
            emotion_keywords=emotion_keywords,
            scenario_keywords=scenario_keywords,
            generated_at=datetime.now(),
        )

        # Step 6: Save
        if project_id:
            self._save_phase2_output(project_id, output)

        return output

    async def _search_niche(
        self,
        crawler: RedditCrawler,
        niche_name: str,
        extra_queries: list[str] | None = None,
    ) -> list[dict]:
        """Search Reddit with the niche name + variations."""
        queries = [niche_name]

        if extra_queries:
            queries.extend(extra_queries)
        else:
            # Auto-generate query variations
            queries.extend([
                f"{niche_name} recommendation",
                f"{niche_name} like but better",
                f"why no {niche_name}",
                f"{niche_name} hidden gem",
                f"best {niche_name}",
            ])

        all_posts = []
        seen_ids = set()

        for query in queries[:4]:  # Limit to 4 queries to avoid rate limiting
            results = await crawler.multi_subreddit_search(
                query,
                subreddits=self.GAME_SUBREDDITS[:4],  # Use top 4 subreddits per query
                per_subreddit=5,
            )
            for sub, posts in results.items():
                for post in posts:
                    if post["id"] not in seen_ids:
                        seen_ids.add(post["id"])
                        post["_query"] = query
                        post["_subreddit"] = sub
                        all_posts.append(post)

            # Be nice to Reddit API
            await asyncio.sleep(1)

        return all_posts

    async def _enrich_with_comments(
        self, crawler: RedditCrawler, posts: list[dict]
    ) -> list[dict]:
        """Fetch top comments for key posts."""
        enriched = []
        for post in posts[:5]:  # Top 5 posts by upvotes
            try:
                comments = await crawler.get_post_comments(
                    post["_subreddit"], post["id"], limit=10
                )
                post["comments"] = comments
                # Sort by upvotes
                post["comments"].sort(key=lambda c: c["upvotes"], reverse=True)
            except Exception as e:
                post["comments"] = []
            enriched.append(post)
        return enriched

    def _extract_consensus(self, posts: list[dict]) -> list[ConsensusPoint]:
        """
        Extract consensus points from posts and comments.
        Each consensus point = pain point + underlying desire + verbatim quote.
        """
        points = []
        id_counter = 1

        for post in sorted(posts, key=lambda p: p.get("upvotes", 0), reverse=True)[:10]:
            # Analyze post title + body
            title_text = post.get("title", "")
            body_text = post.get("selftext", "")
            combined = f"{title_text} {body_text}".strip()

            if len(combined) < 20:
                continue

            # Sentiment score
            sentiment = 0.0
            if self.analyzer:
                scores = self.analyzer.polarity_scores(combined)
                sentiment = scores.get("compound", 0.0)

            # Classify as pain or desire
            pain_match = self._match_patterns(combined, self.PAIN_PATTERNS) or ""
            desire_match = self._match_patterns(combined, self.DESIRE_PATTERNS) or ""

            is_pain = len(pain_match) > len(desire_match)

            # Build consensus point
            point = ConsensusPoint(
                id=f"cp-{id_counter:03d}",
                pain_point=pain_match or ("Unknown" if is_pain else ""),
                underlying_need=desire_match or ("Unknown" if not is_pain else ""),
                quote=title_text if len(title_text) > len(body_text) else combined[:300],
                sentiment_score=round(sentiment, 3),
                source_url=post.get("url", ""),
                source_platform="reddit",
                upvotes=post.get("upvotes", 0),
            )
            points.append(point)
            id_counter += 1

            # Also extract from top comments
            for comment in post.get("comments", [])[:3]:
                comment_body = comment.get("body", "")
                if len(comment_body) < 20:
                    continue

                comment_sentiment = 0.0
                if self.analyzer:
                    c_scores = self.analyzer.polarity_scores(comment_body)
                    comment_sentiment = c_scores.get("compound", 0.0)

                c_pain = self._match_patterns(comment_body, self.PAIN_PATTERNS) or ""
                c_desire = self._match_patterns(comment_body, self.DESIRE_PATTERNS) or ""

                c_point = ConsensusPoint(
                    id=f"cp-{id_counter:03d}",
                    pain_point=c_pain or "",
                    underlying_need=c_desire or "",
                    quote=comment_body[:400],
                    sentiment_score=round(comment_sentiment, 3),
                    source_url=post.get("url", ""),
                    source_platform="reddit",
                    upvotes=comment.get("upvotes", 0),
                )
                points.append(c_point)
                id_counter += 1

        # Sort by upvotes (most impactful first), then by sentiment intensity
        points.sort(key=lambda p: (abs(p.sentiment_score), p.upvotes), reverse=True)

        return points[:10]  # Return top 10 consensus points

    def _match_patterns(self, text: str, patterns: list[str]) -> str | None:
        """Return first matching pattern group, or None."""
        text_lower = text.lower()
        for pattern in patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                # Return the matched portion
                return match.group(0)[:200]
        return None

    def _extract_keywords(self, posts: list[dict], type: str = "emotion") -> list[str]:
        """Extract high-frequency keywords from posts."""
        # Game-relevant keyword lists by category
        emotion_words = {
            "frustrating", "fun", "boring", "exciting", "relaxing", "stressful",
            "addictive", "repetitive", "engaging", "disappointing", "amazing",
            "overrated", "underrated", "chill", "grindy", "satisfying",
            "anoying", "beautiful", "terrible", "incredible", "mediocre",
        }

        scenario_words = {
            "singleplayer", "multiplayer", "coop", "pvp", "pve", "solo",
            "online", "offline", "lan", "couch", "split-screen", "crossplay",
            "controller", "keyboard", "mobile", "vr", "modding", "dlc",
            "early access", "free to play", "subscription", "season pass",
        }

        target_set = emotion_words if type == "emotion" else scenario_words

        # Count occurrences across all posts
        word_counts = {}
        for post in posts:
            text = (post.get("title", "") + " " + post.get("selftext", "")).lower()
            for word in target_set:
                if f" {word} " in text or f" {word}" in text.split()[-1:]:
                    word_counts[word] = word_counts.get(word, 0) + 1

            # Also count in comments
            for comment in post.get("comments", []):
                ctext = comment.get("body", "").lower()
                for word in target_set:
                    if f" {word} " in ctext or f" {word}" in ctext.split()[-1:]:
                        word_counts[word] = word_counts.get(word, 0) + 1

        # Sort by frequency, return top words
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        return [w for w, c in sorted_words[:15]]

    def _empty_output(self, project_id: str, niche_slug: str) -> Phase2Output:
        return Phase2Output(
            project_id=project_id,
            niche_slug=niche_slug,
            consensus_points=[],
            emotion_keywords=[],
            scenario_keywords=[],
            generated_at=datetime.now(),
        )

    def _save_phase2_output(self, project_id: str, output: Phase2Output):
        """Save output as JSON for next phase."""
        project_dir = os.path.join(self.data_dir, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase2.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output.model_dump(), f, indent=2, ensure_ascii=False, default=str)
        print(f"[RedditAnalyst] Saved Phase 2 output to {filepath}")

    @staticmethod
    def load_phase2_output(project_id: str, data_dir: str = "data/projects") -> Optional[dict]:
        """Load previously saved Phase 2 output."""
        filepath = os.path.join(data_dir, project_id, "phase2.json")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return None
