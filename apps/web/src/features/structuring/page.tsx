"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  source_consensus_ids: string[];
  effort_estimate: string;
  intensity_score: number;
}

interface BacklogResult {
  project_id: string;
  niche_name: string;
  features: FeatureItem[];
  summary: Record<string, number>;
  status: string;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  "P0": { label: "核心功能", color: "#FF453A", bg: "#FFEFEC", desc: "必须有" },
  "P1": { label: "重要功能", color: "#FF9F0A", bg: "#FFF6E5", desc: "应该有" },
  "P2": { label: "锦上添花", color: "#007AFF", bg: "#EEF5FF", desc: "可以有" },
  "P3": { label: "延伸目标", color: "#AF52DE", bg: "#F5EEFA", desc: "未来考虑" },
};

const ALL_PRIORITIES = ["P0", "P1", "P2", "P3"];

export default function StructuringPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklogResult | null>(null);
  const [error, setError] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const handleStructure = async () => {
    if (!projectId) { setError("缺少项目 ID"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/structuring/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json() as BacklogResult & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "结构化失败");
    } catch { setError("无法连接到后端服务"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (projectId && !result && !loading) handleStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFeatures = result?.features?.filter((f) =>
    !filterPriority || f.priority === filterPriority
  ) || [];

  return (
    <div className="layout-single">
      {/* Page Header */}
      <div className="mb-xl">
        <button onClick={() => router.back()} className="btn-ghost mb-md" style={{ fontSize: "var(--text-sm)" }}>
          ← 返回
        </button>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-xs)" }}>
          第3阶段：需求结构化
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--c-text-secondary)" }}>
          将玩家共识转化为优先级排序的功能清单
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card card-body-lg text-center mb-xl">
          <div className="flex justify-center mb-md">
            <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>正在构建功能清单...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card mb-xl" style={{ borderColor: "var(--c-error)", background: "var(--c-error-light)" }}>
          <div className="card-body flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-error)" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--c-error)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && result.status === "ok" && (
        <>
          {/* Summary Card with Priority Filters */}
          <div className="card card-body mb-xl">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-lg)" }}>
              {result.niche_name || "功能清单"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {ALL_PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const count = result.summary?.[p] || 0;
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                    className="tag"
                    style={{
                      cursor: "pointer",
                      background: filterPriority === p ? cfg.color : cfg.bg,
                      color: filterPriority === p ? "#fff" : cfg.color,
                      fontWeight: 600,
                      padding: "6px 14px",
                      transition: "all 150ms ease",
                      boxShadow: filterPriority === p ? `0 2px 8px ${cfg.color}40` : undefined,
                    }}
                  >
                    {cfg.label} ({count})
                  </button>
                );
              })}
              {filterPriority && (
                <button onClick={() => setFilterPriority(null)} className="tag tag-gray" style={{ cursor: "pointer" }}>
                  显示全部
                </button>
              )}
            </div>
          </div>

          {/* Feature List */}
          {filteredFeatures.length > 0 ? (
            <div className="space-y-lg mb-xl">
              {filteredFeatures.map((feature) => {
                const cfg = PRIORITY_CONFIG[feature.priority] || PRIORITY_CONFIG.P2;
                return (
                  <div key={feature.id} className="card" style={{ overflow: "hidden" }}>
                    <div className="flex">
                      {/* Left accent bar */}
                      <div style={{ width: 4, background: cfg.color, flexShrink: 0 }} />
                      <div className="card-body w-full">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-md">
                          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, lineHeight: "var(--lh-tight)" }}>
                            {feature.title}
                          </h3>
                          <span className="tag flex-shrink-0" style={{
                            background: cfg.color, color: "#fff",
                            fontWeight: 600, fontSize: "11px", padding: "4px 12px",
                          }}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", lineHeight: "var(--lh-normal)", marginBottom: "var(--space-md)" }}>
                          {feature.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="tag tag-outline">{feature.category}</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)" }}>
                            工作量：{feature.effort_estimate || "待评估"}
                          </span>
                        </div>

                        {/* Intensity bar */}
                        <div className="mt-md flex items-center gap-3">
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)", whiteSpace: "nowrap" }}>玩家呼声</span>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--c-border-light)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (feature.intensity_score || 0) * 100)}%`,
                                background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                                borderRadius: 9999,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: cfg.color, minWidth: 28, textAlign: "right" }}>
                            {(feature.intensity_score || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card card-body-lg text-center mb-xl">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>该优先级下暂无功能</p>
            </div>
          )}

          {/* Next Step CTA */}
          <div className="text-center">
            <button onClick={() => router.push(`/phase/4?project_id=${projectId}`)} className="btn-primary btn-lg">
              进入第4阶段：资产生成 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
