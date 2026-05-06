"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";
  const initialSlug = searchParams.get("niche_slug") || "";
  const initialName = searchParams.get("niche_name") || "";

  const [nicheSlug, setNicheSlug] = useState(initialSlug);
  const [nicheName, setNicheName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

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
      const data = await res.json() as AnalysisResult & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "Analysis failed");
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze if params provided
  useEffect(() => {
    if (initialSlug && initialName && !result && !loading) handleAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sentColor = (score: number) =>
    score > 0.3 ? { bg: "bg-green-50", text: "text-green-600", label: "positive" } :
    score < -0.3 ? { bg: "bg-red-50", text: "text-red-500", label: "negative" } :
    { bg: "bg-gray-50", text: "text-gray-500", label: "neutral" };

  return (
    <div className="mi-scroll-area mi-safe-bottom">
      {/* Header */}
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-bold">Phase 2: Sentiment</h1>
        </div>
        <p className="text-white/60 text-[12px] ml-9">Reddit sentiment analysis + consensus extraction</p>
      </header>

      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* Input (only show if no auto-data) */}
        {!result && !loading && (
          <>
            <div className="mi-card p-4 space-y-3">
              <input
                type="text"
                value={nicheSlug}
                onChange={(e) => setNicheSlug(e.target.value)}
                placeholder="Niche slug (e.g. chill-coop-farming)"
                className="mi-input"
              />
              <input
                type="text"
                value={nicheName}
                onChange={(e) => setNicheName(e.target.value)}
                placeholder="Display name (e.g. Chill Co-op Farming)"
                className="mi-input"
              />
              <button
                onClick={handleAnalyze}
                disabled={!nicheSlug.trim() || !nicheName.trim()}
                className="w-full mi-btn mi-btn-primary py-3"
              >
                Analyze Reddit
              </button>
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">Analyzing Reddit threads...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* Results */}
        {result && result.consensus_points.length > 0 && (
          <>
            {/* Summary bar */}
            <div className="mi-card p-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-gray-900">
                  {result.consensus_count} consensus points
                </span>
                {result.emotion_keywords.slice(0, 6).map((kw) => (
                  <span key={kw} className="text-[10px] bg-pink-50 text-pink-400 px-1.5 py-0.5 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Consensus cards (米游社 feed style) */}
            {result.consensus_points.map((cp) => {
              const sc = sentColor(cp.sentiment_score);
              return (
                <div key={cp.id} className="mi-card overflow-hidden">
                  {/* Colored top border for sentiment */}
                  <div className={`h-1 ${
                    cp.sentiment_score > 0.3 ? "bg-green-400" :
                    cp.sentiment_score < -0.3 ? "bg-red-400" : "bg-gray-300"
                  }`} />

                  <div className="p-4 space-y-2.5">
                    {/* Meta row */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                        {sc.label} · {cp.sentiment_score.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        ▲ {cp.upvotes} upvotes
                      </span>
                    </div>

                    {/* Pain / Desire */}
                    {cp.pain_point && cp.pain_point !== "Unknown" && (
                      <div className="bg-orange-50/50 rounded-lg px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-orange-400/80 font-semibold">Pain</span>
                        <p className="text-[13px] text-gray-700 mt-0.5 leading-relaxed">{cp.pain_point}</p>
                      </div>
                    )}
                    {cp.underlying_need && cp.underlying_need !== "Unknown" && (
                      <div className="bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-500/80 font-semibold">Desire</span>
                        <p className="text-[13px] text-gray-700 mt-0.5 leading-relaxed">{cp.underlying_need}</p>
                      </div>
                    )}

                    {/* Quote */}
                    <blockquote className="text-[13px] text-gray-500 leading-relaxed italic pl-3 border-l-2 border-gray-200 line-clamp-3">
                      &ldquo;{cp.quote}&rdquo;
                    </blockquote>

                    {/* Source link */}
                    {cp.source_url && (
                      <a href={cp.source_url} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-mono block">
                        {cp.source_platform} → view thread
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Next CTA */}
            <button
              onClick={() => router.push(`/phase/3?project_id=${result.project_id}`)}
              className="w-full mi-btn mi-btn-primary py-3.5 shadow-md shadow-blue-200"
            >
              Structure Features → Phase 3
            </button>
          </>
        )}
      </main>
    </div>
  );
}
