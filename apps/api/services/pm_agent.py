"""
PM Agent — Phase 3 Business Logic.
Takes Phase 2 consensus points and converts them into a structured
Feature Backlog with priorities (P0-P3) and game mechanism descriptions.

This is the "brain" of Phase 3 — player complaints → game design specs.
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
from models import FeatureItem, Phase2Output, Phase3Output


class PMAgent:
    """
    Product Manager Agent.
    Transforms unstructured player sentiment into actionable game design features.
    """

    # Priority rules
    P0_CRITERIA = ["core loop", "main mechanic", "fundamental", "must have", "essential"]
    P1_CRITERIA = ["key differentiator", "important", "primary", "should have", "expected"]
    P2_CRITERIA = ["nice to have", "polish", "would be good", "bonus", "enhancement"]
    P3_CRITERIA = ["stretch goal", "later", "future", "optional", "v2"]

    # Mechanism mapping keywords → game design language (Chinese)
    MECHANISM_MAP = {
        # Co-op / Multiplayer patterns
        "co-op": "合作多人系统，支持共享进度",
        "multiplayer": "多人联机系统，含大厅/匹配机制",
        "couch co-op": "本地分屏或同屏合作模式",
        "online": "在线连接功能，含服务器基础设施",
        "drop-in": "随时加入/退出的合作玩法支持",

        # Gameplay feel patterns
        "chill": "低压力游戏节奏，无时间限制",
        "relaxing": "沉浸式氛围设计，舒缓的视听体验",
        "no combat": "非暴力冲突解决机制",
        "peaceful": "零攻击性交互系统（种田、建造、探索）",
        "low stress": "宽容的难度曲线，无失败惩罚或软失败",

        # Progression patterns
        "progression": "技能/经验/解锁成长体系",
        "grindy acceptable": "令人满足的重复循环，带可见的增量奖励",
        "creative": "用户生成内容或自由创作工具",
        "sandbox": "开放式环境，支持涌现式玩法",
        "building": "基地/建造/建造系统，支持放置和自定义",

        # Social patterns
        "make friends": "游戏内社交功能（聊天、送礼、拜访）",
        "random people": "陌生人匹配；可选近距离语音/文字聊天",
        "talk with": "通讯系统（文字聊天、表情、标记系统）",

        # Accessibility patterns
        "beginner friendly": "新手引导教程 + 难度分级 + 提示系统",
        "accessible": "面向大众的 UI/UX 设计（大字体、色盲模式、按键重映射）",

        # Content patterns
        "hidden gem factor": "独特的美术风格或非常规设定，让人眼前一亮",
        "like X but": "借鉴 [参考作品] 但在 [维度] 上做出差异化",
        "replayable": "程序化生成或多条叙事分支",
    }

    def __init__(self, data_dir: str = "data/projects"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    async def structure_requirements(
        self,
        project_id: str,
        phase2_data: dict | None = None,
    ) -> Phase3Output:
        """
        Full pipeline: load Phase 2 data → transform → generate Feature Backlog.
        """
        print(f"[PMAgent] Structuring requirements for project: {project_id}")

        # Step 1: Load Phase 2 data
        if phase2_data is None:
            phase2_path = os.path.join(self.data_dir, project_id, "phase2.json")
            if os.path.exists(phase2_path):
                with open(phase2_path, "r", encoding="utf-8") as f:
                    phase2_data = json.load(f)
            else:
                return self._empty_output(project_id)

        # Step 2: Transform consensus points into features
        backlog = self._build_backlog(phase2_data)

        # Step 3: Generate summary
        summary = self._generate_summary(backlog, phase2_data)

        # Step 4: Build output
        output = Phase3Output(
            project_id=project_id,
            backlog=backlog,
            summary=summary,
            generated_at=datetime.now(),
        )

        # Step 5: Save
        self._save_phase3_output(project_id, output)

        return output

    def _build_backlog(self, phase2_data: dict) -> list[FeatureItem]:
        """Transform consensus points into a prioritized feature list."""
        consensus_points = phase2_data.get("consensus_points", [])
        emotion_keywords = phase2_data.get("emotion_keywords", [])

        backlog = []
        id_counter = 1

        for cp in consensus_points:
            quote = cp.get("quote", "")
            pain = cp.get("pain_point", "")
            desire = cp.get("underlying_need", "")
            sentiment = cp.get("sentiment_score", 0.0)
            upvotes = cp.get("upvotes", 0)
            cp_id = cp.get("id", "")

            if not quote.strip() and not pain.strip():
                continue

            # Determine priority based on signals
            priority = self._determine_priority(quote, pain, desire, sentiment, upvotes, emotion_keywords)

            # Translate complaint into game mechanism
            mechanism = self._translate_to_mechanism(quote, pain, desire)

            # Calculate intensity (emotional weight)
            intensity = self._calculate_intensity(sentiment, upvotes, len(quote))

            feature = FeatureItem(
                id=f"feat-{id_counter:03d}",
                raw_complaint=f"Pain: {pain}. Desire: {desire}. Quote: {quote[:300]}",
                intensity=round(min(1.0, intensity), 2),
                game_mechanism=mechanism,
                priority=priority,
                source_consensus_id=cp_id,
                notes=self._generate_notes(pain, desire, sentiment),
            )
            backlog.append(feature)
            id_counter += 1

        # Sort by priority (P0 first), then by intensity within same priority
        priority_order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
        backlog.sort(key=lambda f: (priority_order.get(f.priority, 99), -f.intensity))

        return backlog

    def _determine_priority(
        self, quote: str, pain: str, desire: str,
        sentiment: float, upvotes: int, emotion_keywords: list[str],
    ) -> str:
        """Determine P0-P3 priority based on multiple signals."""
        combined = f"{quote} {pain} {desire}".lower()
        score = 0.0

        # Signal 1: Upvote weight (high engagement = more important)
        if upvotes >= 50:
            score += 3.0
        elif upvotes >= 20:
            score += 2.0
        elif upvotes >= 5:
            score += 1.0

        # Signal 2: Sentiment extremity (strong feelings = important need)
        score += abs(sentiment) * 2.0

        # Signal 3: Keyword matching against priority criteria
        for kw in self.P0_CRITERIA:
            if kw in combined:
                score += 4.0
        for kw in self.P1_CRITERIA:
            if kw in combined:
                score += 2.5
        for kw in self.P2_CRITERIA:
            if kw in combined:
                score += 1.0

        # Signal 4: Core desire words
        core_desires = ["need", "want", "looking for", "wish", "must", "essential", "fundamental"]
        for word in core_desires:
            if word in combined:
                score += 2.0

        # Map score to priority
        if score >= 6.0:
            return "P0"
        elif score >= 3.5:
            return "P1"
        elif score >= 1.5:
            return "P2"
        else:
            return "P3"

    def _translate_to_mechanism(self, quote: str, pain: str, desire: str) -> str:
        """Translate player language into game design mechanism description."""
        combined = f"{quote} {pain} {desire}".lower()

        # Check against known mechanism patterns
        best_match = ""
        best_match_len = 0

        for pattern, mechanism in self.MECHANISM_MAP.items():
            if pattern in combined and len(pattern) > best_match_len:
                best_match = mechanism
                best_match_len = len(pattern)

        if best_match:
            return best_match

        # Fallback: generate from the text itself (Chinese)
        if pain and desire:
            return f"解决「{pain[:80]}」痛点，同时满足「{desire[:80]}」诉求的功能系统"
        elif desire:
            return f"提供以下体验：{desire[:120]}"
        elif pain:
            return f"针对以下问题的解决方案：{pain[:120]}"
        else:
            return f"基于玩家反馈衍生的功能：{quote[:100]}"

    def _calculate_intensity(self, sentiment: float, upvotes: int, text_length: int) -> float:
        """
        Calculate emotional intensity 0-1.
        Combines sentiment strength, engagement, and verbosity (longer rants = more intense).
        """
        sent_component = abs(sentiment) * 0.4
        vote_component = min(upvotes / 100.0, 1.0) * 0.35
        length_component = min(text_length / 500.0, 1.0) * 0.25

        return sent_component + vote_component + length_component

    def _generate_notes(self, pain: str, desire: str, sentiment: float) -> str:
        """Generate human-readable notes for each feature (Chinese)."""
        parts = []
        if sentiment > 0.3:
            parts.append("正面情感 — 玩家表达了热情/期待")
        elif sentiment < -0.3:
            parts.append("负面情感 — 玩家表达了不满/痛点")

        if not pain or pain == "Unknown":
            parts.append("纯诉求信号 — 未提及明确痛点")
        if not desire or desire == "Unknown":
            parts.append("纯痛点信号 — 未提及明确诉求")

        return "；".join(parts) if parts else "标准功能需求"

    def _generate_summary(self, backlog: list[FeatureItem], phase2_data: dict) -> str:
        """Generate one-paragraph concept summary (Chinese)."""
        p0_count = sum(1 for f in backlog if f.priority == "P0")
        p1_count = sum(1 for f in backlog if f.priority == "P1")
        total = len(backlog)

        niche_slug = phase2_data.get("niche_slug", "unknown")
        top_desires = [f.game_mechanism for f in backlog[:3]]

        summary = (
            f"一款{niche_slug.replace('-', ' ')}游戏，"
            f"包含 {p0_count} 项核心必备功能、"
            f"{p1_count} 项关键差异化功能，"
            f"以及 {total - p0_count - p1_count} 项增强功能。"
            f"核心支柱：{' | '.join(top_desires)}。"
        )
        return summary

    def _empty_output(self, project_id: str) -> Phase3Output:
        return Phase3Output(
            project_id=project_id,
            backlog=[],
            summary="No data available.",
            generated_at=datetime.now(),
        )

    def _save_phase3_output(self, project_id: str, output: Phase3Output):
        """Save output as JSON for next phase."""
        project_dir = os.path.join(self.data_dir, project_id)
        os.makedirs(project_dir, exist_ok=True)
        filepath = os.path.join(project_dir, "phase3.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output.model_dump(), f, indent=2, ensure_ascii=False, default=str)
        print(f"[PMAgent] Saved Phase 3 output to {filepath}")

    @staticmethod
    def load_phase3_output(project_id: str, data_dir: str = "data/projects") -> Optional[dict]:
        """Load previously saved Phase 3 output."""
        filepath = os.path.join(data_dir, project_id, "phase3.json")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return None
