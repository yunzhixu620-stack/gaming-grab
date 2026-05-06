/**
 * Shared types for Gaming PM Agent.
 * Used by both frontend (TypeScript) and backend (Python equivalent in models.py).
 * Changes here must sync with apps/api/models.py.
 */

// ─── Project ──────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string; // ISO datetime
  current_phase: 1 | 2 | 3 | 4;
}

// ─── Phase 1: Niche Discovery ─────────────────────────────

export interface NicheCandidate {
  slug: string;
  name: string;
  search_volume: number;
  difficulty: number; // 0-100
  core_compromise: string;
  positioning: string;
  sources: string[];
}

export interface Phase1Output {
  project_id: string;
  query: string;
  candidates: NicheCandidate[];
  generated_at: string;
}

// ─── Phase 2: Sentiment Analysis ───────────────────────────

export interface ConsensusPoint {
  id: string;
  pain_point: string;
  underlying_need: string;
  quote: string;
  sentiment_score: number; // -1 to 1
  source_url: string;
  source_platform: "reddit" | "bili" | "taptap" | "nga" | "xiaohongshu";
  upvotes: number;
}

export interface Phase2Output {
  project_id: string;
  niche_slug: string;
  consensus_points: ConsensusPoint[];
  emotion_keywords: string[];
  scenario_keywords: string[];
  generated_at: string;
}

// ─── Phase 3: Feature Backlog ──────────────────────────────

export type Priority = "P0" | "P1" | "P2" | "P3";

export interface FeatureItem {
  id: string;
  raw_complaint: string;
  intensity: number; // 0-1
  game_mechanism: string;
  priority: Priority;
  source_consensus_id: string;
  notes: string;
}

export interface Phase3Output {
  project_id: string;
  backlog: FeatureItem[];
  summary: string;
  generated_at: string;
}

// ─── Phase 4: Generated Assets ─────────────────────────────

export interface GeneratedAssets {
  project_id: string;
  elevator_pitch: string;
  steam_short_desc: string;
  devlog_topic: string;
  tag_suggestions: string[];
  generated_at: string;
}
