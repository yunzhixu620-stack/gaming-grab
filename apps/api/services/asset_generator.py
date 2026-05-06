"""
Asset Generator — Phase 4 Business Logic.
Takes Phase 3 Feature Backlog and generates ready-to-use marketing assets:
- Elevator Pitch (one-sentence hook)
- Steam Short Description (SEO-optimized, player-term-rich)
- Devlog Topic (Reddit-resonant research angle)
- Tag Suggestions (Steam tags)

This is the output phase — structured data → publishable content.
"""

import json
import os
import re
from datetime import datetime
from typing import Optional

import sys
_sys_path = os.path.join(os.path.dirname(__file__), "..")
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from models import GeneratedAssets, Phase2Output, Phase3Output


class AssetGenerator:
    """
    Generates game marketing assets from structured feature data.
    Everything is data-driven — no hallucination.
    """

    # Steam tag library (common indie game tags)
    STEAM_TAGS_POOL = [
        "Indie", "Co-op", "Multiplayer", "Singleplayer", "Relaxing",
        "Sandbox", "Building", "Simulation", "RPG", "Adventure",
        "Casual", "Family Friendly", "Charm", "Pixel Graphics",
        "2D", "3D", "Open World", "Survival", "Crafting",
        "Base Building", "Farming", "Online Co-Op", "Split Screen",
        "Couch Co-Op", "Colorful", "Atmospheric", "Story Rich",
        "Exploration", "Puzzle", "Strategy", "Management",
        "Early Access", "Free to Play", "Moddable",
        "Controller Support", "Keyboard/Mouse",
    ]

    def __init__(self, data_dir: str = "data/projects"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    async def generate_assets(
        self,
        project_id: str,
        phase3_data: dict | None = None,
        phase2_data: dict | None = None,
        custom_name: str = "",
        custom_genre: str = "",
    ) -> GeneratedAssets:
        """
        Full pipeline: load data → generate all assets.
        """
        print(f"[AssetGenerator] Generating assets for project: {project_id}")

        # Step 1: Load data
        if phase3_data is None:
            phase3_path = os.path.join(self.data_dir, project_id, "phase3.json")
            if os.path.exists(phase3_path):
                with open(phase3_path, "r", encoding="utf-8") as f:
                    phase3_data = json.load(f)

        if phase2_data is None:
            phase2_path = os.path.join(self.data_dir, project_id, "phase2.json")
            if os.path.exists(phase2_path):
                with open(phase2_path, "r", encoding="utf-8") as f:
                    phase2_data = json.load(f)

        if not phase3_data and not phase2_data:
            return self._empty_output(project_id)

        # Step 2: Generate each asset type
        backlog = phase3_data.get("backlog", []) if phase3_data else []
        summary = phase3_data.get("summary", "") if phase3_data else ""
        consensus_points = phase2_data.get("consensus_points", []) if phase2_data else []
        emotion_keywords = phase2_data.get("emotion_keywords", []) if phase2_data else []
        niche_slug = phase2_data.get("niche_slug", "") if phase2_data else ""

        elevator_pitch = self._generate_elevator_pitch(
            backlog, summary, niche_slug, custom_name, custom_genre
        )
        steam_desc = self._generate_steam_description(
            backlog, consensus_points, emotion_keywords, niche_slug, custom_name, custom_genre
        )
        devlog_topic = self._generate_devlog_topic(
            backlog, consensus_points, niche_slug
        )
        tags = self._generate_tags(backlog, emotion_keywords)

        # Step 3: Build output
        output = GeneratedAssets(
            project_id=project_id,
            elevator_pitch=elevator_pitch,
            steam_short_desc=steam_desc,
            devlog_topic=devlog_topic,
            tag_suggestions=tags,
            generated_at=datetime.now(),
        )

        # Step 4: Save
        self._save_phase4_output(project_id, output)

        return output

    def _generate_elevator_pitch(
        self, backlog: list[dict], summary: str, niche_slug: str,
        custom_name: str, custom_genre: str,
    ) -> str:
        """Generate one-sentence elevator pitch."""
        name = custom_name or niche_slug.replace("-", " ").title()

        # Extract top P0/P1 mechanisms
        p0_mechanisms = [f.get("game_mechanism", "") for f in backlog if f.get("priority") == "P0"]
        p1_mechanisms = [f.get("game_mechanism", "") for f in backlog if f.get("priority") == "P1"]

        core = p0_mechanisms[0] if p0_mechanisms else (p1_mechanisms[0] if p1_mechanisms else "")
        secondary = p0_mechanisms[1] if len(p0_mechanisms) > 1 else (p1_mechanisms[1] if len(p1_mechanisms) > 1 else "")

        genre = custom_genre or self._infer_genre(niche_slug)

        if core and secondary:
            pitch = (
                f"{name} is a {genre.lower()} where {core.lower()}, "
                f"featuring {secondary.lower()}."
            )
        elif core:
            pitch = (
                f"{name} is a {genre.lower()} that delivers "
                f"{core.lower()} — built for players tired of the same old grind."
            )
        elif summary:
            pitch = f"{name}: {summary.rstrip('.')}."
        else:
            pitch = f"{name} — a fresh take on {genre.lower()} built from real player demand."

        return pitch

    def _generate_steam_description(
        self, backlog: list[dict], consensus_points: list[dict],
        emotion_keywords: list[str], niche_slug: str,
        custom_name: str, custom_genre: str,
    ) -> str:
        """Generate SEO-optimized Steam short description using player's own words."""
        name = custom_name or niche_slug.replace("-", " ").title()

        # Collect player quotes (verbatim snippets)
        quotes = []
        for cp in consensus_points[:5]:
            quote = cp.get("quote", "")
            if quote and len(quote) > 30:
                # Truncate to first sentence-ish
                snippet = re.split(r'[.!?]', quote)[0][:150]
                if snippet:
                    quotes.append(snippet)

        # Extract key mechanisms as bullet points
        p0_features = [f.get("game_mechanism", "") for f in backlog if f.get("priority") == "P0"]
        p1_features = [f.get("game_mechanism", "") for f in backlog if f.get("priority") == "P1"]

        # Build description sections
        lines = []

        # Hook line (what players asked for)
        if quotes:
            need_pattern = re.search(
                r"(looking for|wish|want|need|hope).{0,100}",
                quotes[0], re.IGNORECASE
            )
            if need_pattern:
                lines.append(f'**"{need_pattern.group(0)[:120]}"**')
                lines.append("")
            else:
                lines.append(f'**"{quotes[0][:120]}"**')
                lines.append("")

        # What this game delivers
        lines.append(f"**{name}** delivers:")
        lines.append("")

        for feat in p0_features[:3]:
            lines.append(f"• {feat}")
        for feat in p1_features[:2]:
            lines.append(f"• {feat}")

        lines.append("")

        # Player-vetted keywords
        positive_kw = [kw for kw in emotion_keywords[:10]
                       if kw in ("fun", "chill", "relaxing", "engaging", "beautiful",
                                 "satisfying", "amazing", "incredible", "addictive")]
        if positive_kw:
            kw_str = ", ".join(positive_kw[:5])
            lines.append(f"Players describe it as: **{kw_str}**.")
            lines.append("")

        # Call to action
        lines.append(f"Wishlist now to join the community building {name}.")

        return "\n".join(lines)

    def _generate_devlog_topic(
        self, backlog: list[dict], consensus_points: list[dict],
        niche_slug: str,
    ) -> str:
        """Generate a devlog topic that would resonate on Reddit / social media."""
        name = niche_slug.replace("-", " ").title()

        # Find the most upvoted pain point
        sorted_cp = sorted(consensus_points, key=lambda c: c.get("upvotes", 0), reverse=True)
        top_pain = sorted_cp[0] if sorted_cp else {}
        top_quote = top_pain.get("quote", "")[:200]

        # Find the most intense P0 feature
        p0_features = [f for f in backlog if f.get("priority") == "P0"]
        p0_sorted = sorted(p0_features, key=lambda f: f.get("intensity", 0), reverse=True)
        top_feature = p0_sorted[0] if p0_sorted else {}

        # Generate angle options
        angles = [
            {
                "title": f"How we're building '{top_feature.get('game_mechanism', 'core gameplay')}' based on what {len(consensus_points)}+ Reddit threads asked for",
                "angle": "data-driven development narrative",
            },
            {
                "title": f"Why players are tired of existing games in this space (and how {name} fixes it)",
                "angle": "pain-point validation narrative",
            },
            {
                "title": f'Devlog #1: The "{name}" origin story — from r/gamingsuggestions to prototype',
                "angle": "origin story / behind-the-scenes",
            },
        ]

        # Pick best angle based on available data
        if top_quote and top_pain.get("upvotes", 0) >= 10:
            selected = angles[1]  # Pain point angle (strong signal)
        elif top_feature:
            selected = angles[0]  # Feature deep-dive
        else:
            selected = angles[2]  # Origin story fallback

        result = f"""**Title:** {selected["title"]}

**Angle:** {selected["angle"]}

**Why it works on Reddit:**
- Uses real player language from our research
- Shows data-driven approach (not just "my cool idea")
- Invites discussion ("what would YOU want?")

**Suggested format:**
- 3-5 paragraphs with screenshots/GIFs
- Include the original Reddit thread screenshot as proof of demand
- End with an open question to drive comments"""

        return result

    def _generate_tags(self, backlog: list[dict], emotion_keywords: list[str]) -> list[str]:
        """Generate Steam tag suggestions from features + emotions."""
        tags = set()

        # From mechanism descriptions
        for f in backlog:
            mech = f.get("game_mechanism", "").lower()
            for tag in self.STEAM_TAGS_POOL:
                tag_lower = tag.lower()
                if tag_lower in mech or tag_lower.replace(" ", "_") in mech.replace(" ", "_"):
                    tags.add(tag)

        # From emotion keywords
        emotion_to_tag = {
            "relaxing": "Relaxing",
            "chill": "Relaxing",
            "co-op": "Co-op",
            "multiplayer": "Multiplayer",
            "building": "Base Building",
            "crafting": "Crafting",
            "sandbox": "Sandbox",
            "exploration": "Exploration",
            "puzzle": "Puzzle",
            "story": "Story Rich",
            "atmospheric": "Atmospheric",
            "indie": "Indie",
            "casual": "Casual",
        }
        for kw in emotion_keywords:
            if kw.lower() in emotion_to_tag:
                tags.add(emotion_to_tag[kw.lower()])

        # Always include Indie
        tags.add("Indie")

        # Return top 15 most relevant
        return sorted(list(tags))[:15]

    def _infer_genre(self, niche_slug: str) -> str:
        """Infer game genre from niche slug."""
        slug_lower = niche_slug.lower()
        genre_indicators = {
            "co-op": "Co-op Game",
            "survival": "Survival",
            "building": "Building / Management",
            "rpg": "RPG",
            "puzzle": "Puzzle",
            "strategy": "Strategy",
            "simulation": "Simulation",
            "horror": "Horror",
            "farming": "Farming Sim",
            "sandbox": "Sandbox",
            "chill": "Relaxing Simulation",
            "pixel": "Pixel Art Game",
            "mobile": "Mobile Game",
        }
        for keyword, genre in genre_indicators.items():
            if keyword in slug_lower:
                return genre
        return "Indie Game"

    def _empty_output(self, project_id: str) -> GeneratedAssets:
        return GeneratedAssets(
            project_id=project_id,
            elevator_pitch="",
            steam_short_desc="",
            devlog_topic="",
            tag_suggestions=[],
            generated_at=datetime.now(),
        )

    def _save_phase4_output(self, project_id: str, output: GeneratedAssets):
        """Save output as JSON."""
        project_dir = os.path.join(self.data_dir, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase4.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output.model_dump(), f, indent=2, ensure_ascii=False, default=str)
        print(f"[AssetGenerator] Saved Phase 4 output to {filepath}")

    @staticmethod
    def load_phase4_output(project_id: str, data_dir: str = "data/projects") -> Optional[dict]:
        """Load previously saved Phase 4 output."""
        filepath = os.path.join(data_dir, project_id, "phase4.json")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return None
