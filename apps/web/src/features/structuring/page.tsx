"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Types
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
  P0: { label: "P0 Must-Have", color: "bg-red-950/30 text-red-400 border-red-900/50" },
  P1: { label: "P1 Should-Have", color: "bg-amber-950/30 text-amber-400 border-amber-900/50" },
  P2: { label: "P2 Nice-to-Have", color: "bg-blue-950/30 text-blue-400 border-blue-900/50" },
  P3: { label: "P3 Stretch Goal", color: "bg-neutral-800/50 text-neutral-500 border-neutral-700/50" },
};

export default function StructuringPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklogResult | null>(null);
  const [error, setError] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "intensity">("priority");

  const handleStructure = async () => {
    if (!projectId) {
      setError("Need a project_id from Phase 2");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/structuring/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data: BacklogResult = await res.json();
      if (data.status === "ok") {
        setResult(data);
      } else {
        setError(data.detail || "Structuring failed");
      }
    } catch (e) {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  // Filter + sort
  const filteredBacklog = result
    ? result.backlog
        .filter((f) => filterPriority === "all" || f.priority === filterPriority)
        .sort((a, b) => {
          if (sortBy === "priority") {
            const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
            return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
          }
          return b.intensity - a.intensity;
        })
    : [];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mb-1">
            <a href="/" className="hover:text-indigo-400">Home</a>
            <span>→</span>
            <a href="/phase/1" className="hover:text-indigo-400">Phase 1</a>
            <span>→</span>
            <a href={`/phase/2?project_id=${projectId}`} className="hover:text-indigo-400">Phase 2</a>
            <span>→</span>
            <span className="text-neutral-400">Phase 3</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Phase 3: Data Structuring
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Transform player pain points into a prioritized Feature Backlog (P0–P3)
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleStructure}
            disabled={loading || !projectId}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800
                       disabled:text-neutral-600 rounded-lg font-medium transition-colors"
          >
            {loading ? "Structuring..." : "Generate Feature Backlog"}
          </button>

          {/* Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm
                       text-neutral-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="P0">P0 Must-Have</option>
            <option value="P1">P1 Should-Have</option>
            <option value="P2">P2 Nice-to-Have</option>
            <option value="P3">P3 Stretch Goals</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "priority" | "intensity")}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm
                       text-neutral-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="priority">Sort by Priority</option>
            <option value="intensity">Sort by Intensity</option>
          </select>

          {projectId && (
            <span className="text-xs text-neutral-600 font-mono ml-auto">
              Project: <code className="bg-neutral-900 px-1.5 py-0.5 rounded">{projectId}</code>
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            <p className="mt-3 text-sm">Analyzing consensus → Generating features...</p>
          </div>
        )}

        {/* Results */}
        {result && result.feature_count > 0 && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <p className="text-sm text-neutral-300 mb-3">{result.summary}</p>
              <div className="flex gap-3 flex-wrap text-xs font-mono">
                <span className="px-2 py-1 bg-red-950/30 text-red-400 rounded">
                  P0: {result.p0_count}
                </span>
                <span className="px-2 py-1 bg-amber-950/30 text-amber-400 rounded">
                  P1: {result.p1_count}
                </span>
                <span className="px-2 py-1 bg-blue-950/30 text-blue-400 rounded">
                  P2: {result.p2_count}
                </span>
                <span className="px-2 py-1 bg-neutral-800 text-neutral-500 rounded">
                  P3: {result.p3_count}
                </span>
                <span className="text-neutral-600 ml-auto">
                  Total: {result.feature_count} features
                </span>
              </div>
            </div>

            {/* Feature Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs font-mono text-neutral-500 uppercase">
                    <th className="pb-2 pr-3 w-16">#</th>
                    <th className="pb-2 pr-3 w-20">Priority</th>
                    <th className="pb-2 pr-3 w-20">Intensity</th>
                    <th className="pb-2 pr-3">Game Mechanism</th>
                    <th className="pb-2 pr-3 w-28">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBacklog.map((feat, i) => {
                    const pcfg = PRIORITY_CONFIG[feat.priority];
                    return (
                      <tr key={feat.id} className={`border-b border-neutral-800/50 hover:bg-neutral-900/30`}>
                        <td className="py-3 pr-3 text-neutral-600 font-mono text-xs">{i + 1}</td>
                        <td className="py-3 pr-3">
                          <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded ${pcfg?.color}`}>
                            {feat.priority}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="w-16 bg-neutral-800 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                feat.intensity > 0.7 ? "bg-red-500" :
                                feat.intensity > 0.4 ? "bg-amber-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.round(feat.intensity * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-neutral-600 font-mono">{feat.intensity.toFixed(2)}</span>
                        </td>
                        <td className="py-3 pr-3 text-neutral-300 max-w-md">
                          {feat.game_mechanism}
                        </td>
                        <td className="py-3 pr-3 text-[10px] font-mono text-neutral-600">
                          {feat.source_consensus_id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Next Phase CTA */}
            <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-sm text-neutral-500">
                Review backlog → Continue to Phase 4: Asset Generation
              </span>
              <a
                href={`/phase/4?project_id=${result.project_id}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                Continue to Phase 4 →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
