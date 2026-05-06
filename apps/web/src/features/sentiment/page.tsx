"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ConsensusPoint {
  id: string;
  summary: string;
  sentiment: string;
  pain_points: string[];
  desires: string[];
  source_quote: string;
  source_url: string;
  intensity_score: number;
}

interface AnalysisResult {
  project_id: string;
  niche_name: string;
  consensus_points: ConsensusPoint[];
  overall_sentiment: string;
  sentiment_distribution: Record<string, number>;
  total_posts_analyzed: number;
  status: string;
}

const SENTIMENT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: "正面", color: "#34C759", bg: "#E8FBEE" },
  negative: { label: "负面", color: "#FF453A", bg: "#FFEFEC" },
  neutral: { label: "中性", color: "#8E8E93", bg: "#F2F2F7" },
};

export default function SentimentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!projectId) { setError("缺少项目 ID"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/sentiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json() as AnalysisResult & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "分析失败");
    } catch { setError("无法连接到后端服务"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (projectId && !result && !loading) handleAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="layout-single">
      {/* Page Header */}
      <div className="mb-xl">
        <button onClick={() => router.back()} className="btn-ghost mb-md" style={{ fontSize: "var(--text-sm)" }}>
          ← 返回
        </button>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-xs)" }}>
          第2阶段：情感与共识分析
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--c-text-secondary)" }}>
          提取玩家痛点、诉求和共识点
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card card-body-lg text-center mb-xl">
          <div className="flex justify-center mb-md">
            <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>正在分析玩家情感...</p>
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
          {/* Overview Card */}
          <div className="card card-body mb-xl flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{result.niche_name || "品类分析"}</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-tertiary)", marginTop: 2 }}>
                分析了 {result.total_posts_analyzed} 条帖子 · {result.consensus_points.length} 个共识点
              </p>
            </div>
            <span className="badge badge-success" style={{
              background: (SENTIMENT_MAP[result.overall_sentiment]?.bg || "#f5f5f5"),
              color: SENTIMENT_MAP[result.overall_sentiment]?.color || "#666",
            }}>
              整体{SENTIMENT_MAP[result.overall_sentiment]?.label || "中性"}
            </span>
          </div>

          {/* Consensus Points */}
          <div className="space-y-lg mb-xl">
            {result.consensus_points.map((point) => {
              const sent = SENTIMENT_MAP[point.sentiment] || SENTIMENT_MAP.neutral;
              return (
                <div key={point.id} className="card" style={{ overflow: "hidden" }}>
                  {/* Top accent bar */}
                  <div style={{ height: 3, background: sent.color }} />
                  <div className="card-body space-y-md">
                    {/* Title + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600, lineHeight: "var(--lh-tight)" }}>
                        {point.summary}
                      </h3>
                      <span className="tag" style={{ background: sent.bg, color: sent.color, flexShrink: 0, marginTop: 2 }}>
                        {sent.label}
                      </span>
                    </div>

                    {/* Pain points */}
                    {point.pain_points.length > 0 && (
                      <div className="pl-3" style={{ borderLeft: "2px solid #FFCDD2" }}>
                        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#D32F2F", marginBottom: "var(--space-xs)" }}>玩家痛点</p>
                        {point.pain_points.map((pp) => (
                          <p key={pp} style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", lineHeight: "var(--lh-normal)", marginBottom: "var(--space-xs)" }}>{pp}</p>
                        ))}
                      </div>
                    )}

                    {/* Desires */}
                    {point.desires.length > 0 && (
                      <div className="pl-3" style={{ borderLeft: "2px solid #BBDEFB" }}>
                        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#1976D2", marginBottom: "var(--space-xs)" }}>玩家诉求</p>
                        {point.desires.map((d) => (
                          <p key={d} style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", lineHeight: "var(--lh-normal)", marginBottom: "var(--space-xs)" }}>{d}</p>
                        ))}
                      </div>
                    )}

                    {/* Quote */}
                    {point.source_quote && (
                      <blockquote style={{
                        padding: "var(--space-md) var(--space-lg)",
                        background: "var(--c-bg)",
                        borderRadius: 8,
                        borderLeft: "3px solid var(--c-border)",
                      }}>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", fontStyle: "italic", lineHeight: "var(--lh-relaxed)" }}>
                          &ldquo;{point.source_quote}&rdquo;
                        </p>
                        {point.source_url && (
                          <a href={point.source_url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: "var(--text-xs)", color: "var(--c-blue)", textDecoration: "none", marginTop: "var(--space-xs)", display: "inline-block" }}>
                            查看原文 →
                          </a>
                        )}
                      </blockquote>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Step CTA */}
          <div className="text-center">
            <button onClick={() => router.push(`/phase/3?project_id=${projectId}`)} className="btn-primary btn-lg">
              进入第3阶段：需求结构化 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
