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
  positive: { label: "正面", color: "#52C41A", bg: "#F0FFF4" },
  negative: { label: "负面", color: "#FF4D4F", bg: "#FFF2F0" },
  neutral: { label: "中性", color: "#999999", bg: "#FAFAFA" },
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
    <div className="mi-scroll-area mi-safe-bottom">
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="mi-header-title">第2阶段：情感与共识</h1>
        </div>
        <p className="mi-header-subtitle ml-9">提取玩家痛点、诉求和共识点</p>
      </header>

      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* 加载状态 */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">正在分析玩家情感...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* 分析结果 */}
        {result && result.status === "ok" && (
          <>
            {/* 概览卡片 */}
            <div className="mi-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-[15px] text-gray-900">{result.niche_name || "品类分析"}</h2>
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: (SENTIMENT_MAP[result.overall_sentiment]?.bg || "#f5f5f5"),
                    color: SENTIMENT_MAP[result.overall_sentiment]?.color || "#666",
                  }}
                >
                  整体{SENTIMENT_MAP[result.overall_sentiment]?.label || "中性"}
                </span>
              </div>
              <p className="text-[12px] text-gray-400">分析了 {result.total_posts_analyzed} 条帖子 · {result.consensus_points.length} 个共识点</p>
            </div>

            {/* 共识点列表 */}
            {result.consensus_points.map((point) => {
              const sent = SENTIMENT_MAP[point.sentiment] || SENTIMENT_MAP.neutral;
              return (
                <div key={point.id} className="mi-card overflow-hidden">
                  {/* 顶部色条 */}
                  <div className="h-1" style={{ background: sent.color }} />
                  <div className="p-4 space-y-3">
                    {/* 标题 + 强度 */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[14px] text-gray-900 leading-snug">{point.summary}</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: sent.bg, color: sent.color }}>
                        {sent.label}
                      </span>
                    </div>

                    {/* 痛点 */}
                    {point.pain_points.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-400" /> 玩家痛点
                        </p>
                        {point.pain_points.map((pp) => (
                          <p key={pp} className="text-[12px] text-gray-600 pl-3 leading-relaxed">{pp}</p>
                        ))}
                      </div>
                    )}

                    {/* 诉求 */}
                    {point.desires.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-blue-500 font-medium flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-blue-400" /> 玩家诉求
                        </p>
                        {point.desires.map((d) => (
                          <p key={d} className="text-[12px] text-gray-600 pl-3 leading-relaxed">{d}</p>
                        ))}
                      </div>
                    )}

                    {/* 原文引用 */}
                    {point.source_quote && (
                      <blockquote className="border-l-2 border-gray-200 pl-3 py-1 bg-gray-50 rounded-r-lg">
                        <p className="text-[12px] text-gray-500 italic leading-relaxed">&ldquo;{point.source_quote}&rdquo;</p>
                        {point.source_url && (
                          <a href={point.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 inline-block break-all">
                            查看原文 →
                          </a>
                        )}
                      </blockquote>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 下一步按钮 */}
            <button
              onClick={() => router.push(`/phase/3?project_id=${projectId}`)}
              className="w-full mi-btn mi-btn-primary py-3 text-[14px]"
            >
              进入第3阶段：需求结构化 →
            </button>
          </>
        )}
      </main>
    </div>
  );
}
