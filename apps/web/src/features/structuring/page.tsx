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
  "P0": { label: "核心功能", color: "#FF4D4F", bg: "#FFF2F0", desc: "必须有" },
  "P1": { label: "重要功能", color: "#FA8C16", bg: "#FFF7E6", desc: "应该有" },
  "P2": { label: "锦上添花", color: "#1890FF", bg: "#E6F7FF", desc: "可以有" },
  "P3": { label: "延伸目标", color: "#722ED1", bg: "#F9F0FF", desc: "未来考虑" },
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
    <div className="mi-scroll-area mi-safe-bottom">
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="mi-header-title">第3阶段：需求结构化</h1>
        </div>
        <p className="mi-header-subtitle ml-9">将玩家共识转化为优先级排序的功能清单</p>
      </header>

      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* 加载状态 */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">正在构建功能清单...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* 结果 */}
        {result && result.status === "ok" && (
          <>
            {/* 概览卡片 */}
            <div className="mi-card p-4">
              <h2 className="font-semibold text-[15px] text-gray-900 mb-2">{result.niche_name || "功能清单"}</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_PRIORITIES.map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  const count = result.summary?.[p] || 0;
                  return (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                        filterPriority === p ? "ring-2 ring-offset-1" : ""
                      }`}
                      style={{ background: cfg.bg, color: cfg.color, ...(filterPriority === p ? { ringColor: cfg.color } : {}) }}
                    >
                      {cfg.label} ({count})
                    </button>
                  );
                })}
                {filterPriority && (
                  <button onClick={() => setFilterPriority(null)} className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    显示全部
                  </button>
                )}
              </div>
            </div>

            {/* 功能列表 */}
            {filteredFeatures.length > 0 ? filteredFeatures.map((feature) => {
              const cfg = PRIORITY_CONFIG[feature.priority] || PRIORITY_CONFIG.P2;
              return (
                <div key={feature.id} className="mi-card overflow-hidden">
                  {/* 左侧色条 */}
                  <div className="flex">
                    <div className="w-1.5 flex-shrink-0" style={{ background: cfg.color }} />
                    <div className="p-4 flex-1 min-w-0">
                      {/* 标题行 */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[14px] text-gray-900 leading-snug">{feature.title}</h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                          style={{ background: cfg.color, color: "#fff" }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {/* 描述 */}
                      <p className="text-[12px] text-gray-600 leading-relaxed mb-2">{feature.description}</p>

                      {/* 元信息行 */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{feature.category}</span>
                        <span className="text-[11px] text-gray-400">工作量：{feature.effort_estimate || "待评估"}</span>
                      </div>

                      {/* 强度条 */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">玩家呼声</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (feature.intensity_score || 0) * 20)}%`,
                              background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: cfg.color }}>
                          {(feature.intensity_score || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="mi-card p-8 text-center">
                <p className="text-[13px] text-gray-500">该优先级下暂无功能</p>
              </div>
            )}

            {/* 下一步按钮 */}
            <button
              onClick={() => router.push(`/phase/4?project_id=${projectId}`)}
              className="w-full mi-btn mi-btn-primary py-3 text-[14px]"
            >
              进入第4阶段：资产生成 →
            </button>
          </>
        )}
      </main>
    </div>
  );
}
