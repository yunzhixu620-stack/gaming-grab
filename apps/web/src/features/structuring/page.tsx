"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FeatureItem {
  id: string;
  raw_complaint: string;
  intensity: number;
  game_mechanism: string;
  priority: "P0" | "P1" | "P2" | "P3";
  source_consensus_id: string;
  notes: string;
}

interface BacklogResult {
  project_id: string;
  backlog: FeatureItem[];
  summary: string;
  generated_at: string;
  feature_count: number;
  p0_count: number;
  p1_count: number;
  p2_count: number;
  p3_count: number;
  status: string;
}

const PRIORITY_CONFIG = {
  P0: { label: "Must-Have", bg: "bg-red-50", text: "text-red-500", border: "border-l-red-400", dot: "bg-red-400" },
  P1: { label: "Should-Have", bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-400", dot: "bg-amber-400" },
  P2: { label: "Nice-to-Have", bg: "bg-blue-50", text: "text-blue-500", border: "border-l-blue-400", dot: "bg-blue-400" },
  P3: { label: "Stretch Goal", bg: "bg-gray-50", text: "text-gray-400", border: "border-l-gray-300", dot: "bg-gray-300" },
};

export default function StructuringPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklogResult | null>(null);
  const [error, setError] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const handleStructure = async () => {
    if (!projectId) { setError("Need a project_id"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/structuring/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json() as BacklogResult & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "Structuring failed");
    } catch { setError("Failed to connect to API"); }
    finally { setLoading(false); }
  };

  // Auto-run if has projectId
  useEffect(() => {
    if (projectId && !result && !loading) handleStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBacklog = result?.backlog
    ?.filter((f) => filterPriority === "all" || f.priority === filterPriority)
    .sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
    }) || [];

  return (
    <div className="mi-scroll-area mi-safe-bottom">
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-bold">Phase 3: Structure</h1>
        </div>
        <p className="text-white/60 text-[12px] ml-9">Feature Backlog with P0-P3 priorities</p>
      </header>

      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* Loading */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">Building Feature Backlog...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* Results */}
        {result && result.feature_count > 0 && (
          <>
            {/* Summary Card */}
            <div className="mi-card p-4">
              <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{result.summary}</p>
              <div className="flex gap-2 flex-wrap">
                {[["P0", result.p0_count, "red"], ["P1", result.p1_count, "amber"], ["P2", result.p2_count, "blue"], ["P3", result.p3_count, "gray"]].map(([p, c, color]) => (
                  <span key={p} className={`text-[11px] px-2.5 py-1 rounded-full bg-${color}-50 text-${color}-500 font-medium`}>
                    {p}: {c}
                  </span>
                ))}
                <span className="text-[11px] text-gray-400 ml-auto">{result.feature_count} total</span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "all", label: "All" },
                { id: "P0", label: `P0 (${result.p0_count})` },
                { id: "P1", label: `P1 (${result.p1_count})` },
                { id: "P2", label: `P2 (${result.p2_count})` },
                { id: "P3", label: `P3 (${result.p3_count})` },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setFilterPriority(tab.id)}
                  className={`text-[12px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    filterPriority === tab.id ? "bg-blue-500 text-white font-medium" : "bg-gray-100 text-gray-500"
                  }`}
                >{tab.label}</button>
              ))}
            </div>

            {/* Feature Cards */}
            {filteredBacklog.map((feat, i) => {
              const pc = PRIORITY_CONFIG[feat.priority];
              return (
                <div key={feat.id} className={`mi-card border-l-4 ${pc.border}`}>
                  <div className="p-4 space-y-2">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md ${pc.bg} ${pc.text} flex items-center justify-center text-[11px] font-bold`}>
                          {i + 1}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                          {pc.label}
                        </span>
                      </div>
                      {/* Intensity bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            feat.intensity > 0.7 ? "bg-red-400" :
                            feat.intensity > 0.4 ? "bg-amber-400" : "bg-blue-400"
                          }`} style={{ width: `${Math.round(feat.intensity * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono w-7 text-right">{feat.intensity.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Mechanism (main content) */}
                    <p className="text-[14px] text-gray-800 leading-relaxed font-medium">
                      {feat.game_mechanism}
                    </p>

                    {/* Notes */}
                    {feat.notes && feat.notes !== "Standard feature request" && (
                      <p className="text-[11px] text-gray-400 line-clamp-2">{feat.notes}</p>
                    )}

                    {/* Source ref */}
                    <p className="text-[10px] text-gray-300 font-mono">from {feat.source_consensus_id}</p>
                  </div>
                </div>
              );
            })}

            {/* Next CTA */}
            <button
              onClick={() => router.push(`/phase/4?project_id=${result.project_id}`)}
              className="w-full mi-btn mi-btn-primary py-3.5 shadow-md shadow-blue-200"
            >
              Generate Assets → Phase 4
            </button>
          </>
        )}
      </main>
    </div>
  );
}
