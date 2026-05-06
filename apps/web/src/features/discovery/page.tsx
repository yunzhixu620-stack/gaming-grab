"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  sources_used?: string[];
  candidates: NicheCandidate[];
  generated_at: string;
  candidate_count: number;
  status: string;
}

const SOURCE_OPTIONS = [
  { id: "reddit", label: "Reddit" },
  { id: "taptap", label: "TapTap" },
  { id: "xiaohongshu", label: "XHS" },
  { id: "bilibili", label: "BiliBili" },
];

export default function DiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<string[]>(["reddit"]);

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
      const data = await res.json() as SearchResult & { detail?: string };
      if (data.status === "ok") {
        setResult(data);
      } else {
        setError((data as { detail?: string }).detail || "Search failed");
      }
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  // Auto-navigate to Phase 2 when a niche is selected
  const handleSelectNiche = (niche: NicheCandidate) => {
    const pid = result?.project_id || "";
    router.push(`/phase/2?project_id=${pid}&niche_slug=${niche.slug}&niche_name=${niche.name}`);
  };

  return (
    <div className="mi-scroll-area mi-safe-bottom">
      {/* ── Header ─────────────────────────────── */}
      <header className="mi-header pb-20">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.push("/")} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-bold">Phase 1: Discover</h1>
        </div>

        {/* Search Box */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='e.g. "co-op games", "chill farming sim"'
            className="w-full bg-white/95 backdrop-blur-sm rounded-full pl-11 pr-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none shadow-lg shadow-black/5"
          />
        </div>

        {/* Source Pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggleSource(opt.id)}
              className={`flex-shrink-0 text-[12px] px-3 py-1.5 rounded-full transition-all ${
                sources.includes(opt.id)
                  ? "bg-white text-blue-500 font-medium shadow-sm"
                  : "bg-white/15 text-white/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ─────────────────────────────── */}
      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* Search Button */}
        {!result && !loading && (
          <button
            onClick={handleSearch}
            className="w-full mi-btn mi-btn-primary py-3.5 text-[15px] shadow-md shadow-blue-200"
          >
            Discover Niches
          </button>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mi-card p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">Searching across platforms...</p>
            <p className="text-[11px] text-gray-400 mt-1">{sources.join(" + ")}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* Results Header */}
        {result && result.candidate_count > 0 && (
          <div className="flex items-center justify-between pt-1 pb-1">
            <div>
              <p className="text-[13px] font-semibold text-gray-900">
                {result.candidate_count} niches found
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                &ldquo;{result.query}&rdquo; · {result.sources_used?.join(", ") || "reddit"}
              </p>
            </div>
            <button
              onClick={() => { setResult(null); setError(""); }}
              className="text-[12px] text-blue-500"
            >
              Clear
            </button>
          </div>
        )}

        {/* Niche Cards */}
        {result?.candidates.map((niche, i) => (
          <div
            key={niche.slug}
            onClick={() => handleSelectNiche(niche)}
            className="mi-card active:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="p-4 flex gap-3">
              {/* Rank */}
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 text-[13px] font-bold">
                {i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px] text-gray-900 truncate">
                  {niche.name}
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {niche.positioning}
                </p>
                {niche.core_compromise && (
                  <p className="text-[11px] text-orange-400/80 mt-1 truncate">
                    Avoids: {niche.core_compromise}
                  </p>
                )}

                {/* Source tags */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {(niche.sources || []).map((src) => (
                    <span key={src} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {src.replace(/:\d+_.*/, "")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="self-center text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Next step CTA */}
        {result && result.candidate_count > 0 && (
          <div className="pt-2 pb-2">
            <p className="text-[12px] text-gray-400 text-center mb-3">
              Select a niche → Analyze player sentiment
            </p>
            <button
              onClick={() => router.push(`/phase/2?project_id=${result.project_id}`)}
              className="w-full mi-btn mi-btn-secondary"
            >
              Continue to Phase 2 →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
