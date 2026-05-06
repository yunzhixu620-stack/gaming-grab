"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Types
interface ConsensusPoint {
  id: string;
  pain_point: string;
  underlying_need: string;
  quote: string;
  sentiment_score: number;
  source_url: string;
  source_platform: string;
  upvotes: number;
}

interface AnalysisResult {
  project_id: string;
  niche_slug: string;
  consensus_points: ConsensusPoint[];
  emotion_keywords: string[];
  scenario_keywords: string[];
  generated_at: string;
  consensus_count: number;
  status: string;
}

export default function SentimentPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [nicheSlug, setNicheSlug] = useState("");
  const [nicheName, setNicheName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  // Auto-fill if coming from Phase 1
  useEffect(() => {
    if (projectId && !nicheSlug) {
      // Could fetch Phase 1 data to pre-fill; for now just show the field
    }
  }, [projectId]);

  const handleAnalyze = async () => {
    if (!nicheSlug.trim() || !nicheName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/sentiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche_slug: nicheSlug,
          niche_name: nicheName,
          project_id: projectId,
        }),
      });
      const data: AnalysisResult = await res.json();
      if (data.status === "ok") {
        setResult(data);
      } else {
        setError(data.detail || "Analysis failed");
      }
    } catch (e) {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mb-1">
            <a href="/" className="hover:text-indigo-400">Home</a>
            <span>→</span>
            <a href="/phase/1" className="hover:text-indigo-400">Phase 1</a>
            <span>→</span>
            <span className="text-neutral-400">Phase 2</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Phase 2: Sentiment &amp; Consensus
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Select a niche from Phase 1 → Analyze Reddit sentiment → Extract player pain points &amp; desires
          </p>
        </div>

        {/* Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={nicheSlug}
            onChange={(e) => setNicheSlug(e.target.value)}
            placeholder="Niche slug (e.g. chill-coop-farming)"
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3
                       text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500
                       focus:outline-none transition-colors"
          />
          <input
            type="text"
            value={nicheName}
            onChange={(e) => setNicheName(e.target.value)}
            placeholder="Niche name (e.g. Chill Co-op Farming)"
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3
                       text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500
                       focus:outline-none transition-colors"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !nicheSlug.trim() || !nicheName.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800
                       disabled:text-neutral-600 rounded-lg font-medium transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Reddit"}
          </button>
        </div>

        {projectId && (
          <p className="text-xs text-neutral-600">
            Project ID: <code className="bg-neutral-900 px-1.5 py-0.5 rounded">{projectId}</code>
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            <p className="mt-3 text-sm">Querying Reddit (r/gamingsuggestions, r/indiegaming, r/games...)...</p>
          </div>
        )}

        {/* Results */}
        {result && result.consensus_points.length > 0 && (
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <span className="text-neutral-400">
                Found <strong className="text-neutral-200">{result.consensus_count}</strong> consensus points
              </span>
              {result.emotion_keywords.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {result.emotion_keywords.slice(0, 8).map((kw) => (
                    <span key={kw} className="text-[10px] bg-red-950/30 text-red-400/80 px-1.5 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
              {result.scenario_keywords.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {result.scenario_keywords.slice(0, 8).map((kw) => (
                    <span key={kw} className="text-[10px] bg-blue-950/30 text-blue-400/80 px-1.5 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Consensus Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {result.consensus_points.map((cp) => (
                <ConsensusCard key={cp.id} point={cp} />
              ))}
            </div>

            {/* Next Phase CTA */}
            <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-sm text-neutral-500">
                Confirm consensus → Continue to Phase 3: Feature Backlog
              </span>
              <a
                href={`/phase/3?project_id=${result.project_id}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                Continue to Phase 3 →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Consensus Card Component ──────────────────────────

function ConsensusCard({ point }: { point: ConsensusPoint }) {
  // Color based on sentiment
  const sentColor =
    point.sentiment_score > 0.3
      ? "border-green-900/50" // positive
      : point.sentiment_score < -0.3
      ? "border-red-900/50"   // negative
      : "border-neutral-800";  // neutral

  const sentLabel =
    point.sentiment_score > 0.3
      ? "positive"
      : point.sentiment_score < -0.3
      ? "negative"
      : "neutral";

  return (
    <div className={`bg-neutral-900 border rounded-xl p-5 ${sentColor}`}>
      {/* Header: score + votes */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
          sentLabel === "positive" ? "bg-green-950/50 text-green-400" :
          sentLabel === "negative" ? "bg-red-950/50 text-red-400" :
          "bg-neutral-800 text-neutral-500"
        }`}>
          sentiment: {point.sentiment_score.toFixed(2)} ({sentLabel})
        </span>
        <span className="text-[10px] font-mono text-neutral-600">
          ▲ {point.upvotes} upvotes
        </span>
      </div>

      {/* Pain Point */}
      {point.pain_point && point.pain_point !== "Unknown" && (
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-wider text-red-400/70 font-medium">Pain</span>
          <p className="text-sm text-red-300/90 mt-0.5">{point.pain_point}</p>
        </div>
      )}

      {/* Underlying Need */}
      {point.underlying_need && point.underlying_need !== "Unknown" && (
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-wider text-green-400/70 font-medium">Desire</span>
          <p className="text-sm text-green-300/90 mt-0.5">{point.underlying_need}</p>
        </div>
      )}

      {/* Verbatim Quote */}
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium">Player Quote</span>
        <blockquote className="text-sm text-neutral-400 mt-1 italic leading-relaxed border-l-2 border-neutral-700 pl-3">
            &ldquo;{point.quote}&rdquo;
        </blockquote>
      </div>

      {/* Source */}
      {point.source_url && (
        <a
          href={point.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-neutral-600 hover:text-indigo-400 mt-2 inline-block"
        >
          {point.source_platform} → view thread
        </a>
      )}
    </div>
  );
}
