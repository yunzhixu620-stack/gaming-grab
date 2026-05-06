"use client";

import { useState } from "react";

// Types (mirrors shared-types/index.ts)
interface NicheCandidate {
  slug: string;
  name: string;
  search_volume: number;
  difficulty: number;
  core_compromise: string;
  positioning: string;
  sources: string[];
}

interface SearchResult {
  project_id: string;
  query: string;
  candidates: NicheCandidate[];
  generated_at: string;
  candidate_count: number;
  status: string;
}

export default function DiscoveryPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  // Data source selection
  const [sources, setSources] = useState<string[]>(["reddit"]);
  const SOURCE_OPTIONS = [
    { id: "reddit", label: "Reddit (Overseas)", icon: "🌍" },
    { id: "taptap", label: "TapTap", icon: "🎮" },
    { id: "xiaohongshu", label: "Xiaohongshu (RED)", icon: "📕" },
    { id: "bilibili", label: "Bilibili", icon: "📺" },
  ];

  const toggleSource = (sourceId: string) => {
    setSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/discovery/niches/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, sources }),
      });
      const data: SearchResult = await res.json();
      if (data.status === "ok") {
        setResult(data);
      } else {
        setError(data.detail || "Search failed");
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Phase 1: Niche Discovery
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Enter a broad game category. Get structured niche candidates.
          </p>
        </div>

        {/* Search Box + Source Selector */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder='e.g. "co-op games", "base building", "survival craft"'
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3
                         text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500
                         focus:outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800
                         disabled:text-neutral-600 rounded-lg font-medium transition-colors"
            >
              {loading ? "Searching..." : "Discover"}
            </button>
          </div>

          {/* Data Source Toggles */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-neutral-500 self-center mr-1">Data sources:</span>
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleSource(opt.id)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  sources.includes(opt.id)
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-neutral-900 text-neutral-600 border border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
            <p className="mt-3 text-sm">Querying Google + Reddit...</p>
          </div>
        )}

        {/* Results Grid */}
        {result && result.candidates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>
                Found <strong className="text-neutral-300">{result.candidate_count}</strong> niche candidates for &ldquo;{result.query}&rdquo;
              </span>
              <span>Project: <code className="text-xs bg-neutral-900 px-2 py-0.5 rounded">{result.project_id}</code></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.candidates.map((c, i) => (
                <NicheCard key={c.slug} candidate={c} rank={i + 1} />
              ))}
            </div>

            {/* Next Phase CTA */}
            <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-sm text-neutral-500">
                Select a niche to continue to → Phase 2: Sentiment Analysis
              </span>
              <a
                href={`/phase/2?project_id=${result.project_id}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                Continue to Phase 2 →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Niche Card Component ───────────────────────────────

function NicheCard({ candidate, rank }: { candidate: NicheCandidate; rank: number }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group">
      {/* Rank + Name */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-neutral-600">#{rank.toString().padStart(2, "0")}</span>
        <h3 className="font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors">
          {candidate.name}
        </h3>
      </div>

      {/* Positioning */}
      <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{candidate.positioning}</p>

      {/* Core Compromise (if any) */}
      {candidate.core_compromise && (
        <div className="mb-3">
          <span className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
            Avoids: {candidate.core_compromise}
          </span>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-800">
        {candidate.sources.map((src) => (
          <span key={src} className="text-[10px] font-mono text-neutral-600 bg-neutral-800/50 px-1.5 py-0.5 rounded">
            {src.replace(":", ": ")}
          </span>
        ))}
      </div>
    </div>
  );
}
