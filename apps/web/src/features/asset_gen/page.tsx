"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface GeneratedAssets {
  project_id: string;
  elevator_pitch: string;
  steam_short_desc: string;
  devlog_topic: string;
  tag_suggestions: string[];
  generated_at: string;
  tag_count: number;
  status: string;
}

export default function AssetGenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [customName, setCustomName] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedAssets | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!projectId) { setError("缺少项目 ID"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/asset-gen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, custom_name: customName, custom_genre: customGenre }),
      });
      const data = await res.json() as GeneratedAssets & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "生成失败");
    } catch { setError("无法连接到后端服务"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (projectId && !result && !loading) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(null), 2000); });
  };

  return (
    <div className="layout-single">
      {/* Page Header */}
      <div className="mb-xl">
        <button onClick={() => router.back()} className="btn-ghost mb-md" style={{ fontSize: "var(--text-sm)" }}>
          ← 返回
        </button>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-xs)" }}>
          第4阶段：营销资产生成
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--c-text-secondary)" }}>
          生成可直接用于 Steam 和社交媒体的营销素材
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card card-body-lg text-center mb-xl">
          <div className="flex justify-center mb-md">
            <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>正在生成营销资产...</p>
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
          {/* Asset Cards */}
          <div className="space-y-lg mb-xl">
            {/* Elevator Pitch */}
            <AssetCard
              title="一句话推介"
              subtitle="用于投资人 / 媒体的核心卖点"
              content={result.elevator_pitch}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
              label="pitch"
              copied={copied} onCopy={copyToClipboard}
            />

            {/* Steam Description */}
            <AssetCard
              title="Steam 简短描述"
              subtitle="SEO 优化，使用玩家语言"
              content={result.steam_short_desc}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>}
              label="steam-desc"
              copied={copied} onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Devlog Topic */}
            <AssetCard
              title="开发日志选题"
              subtitle="社区共鸣的研究角度"
              content={result.devlog_topic}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
              label="devlog"
              copied={copied} onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Steam Tags */}
            <div className="card card-body">
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-secondary)" strokeWidth={1.8}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Steam 标签</span>
                </div>
                <button onClick={() => copyToClipboard(result.tag_suggestions.join(", "), "tags")}
                  className={`btn ${copied === "tags" ? "btn-primary" : "btn-secondary"} btn-sm`}>
                  {copied === "tags" ? "已复制！" : "一键复制"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tag_suggestions.map((tag) => (
                  <span key={tag} className="tag tag-blue">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Card */}
          <div className="card card-body-lg text-center" style={{ background: "linear-gradient(135deg, #F0FFF4 0%, #EEF5FF 100%)", borderColor: "#34C75930" }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-lg flex items-center justify-center" style={{ background: "#E8FBEE" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-xs)" }}>全部 4 个阶段已完成！</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--space-xl)" }}>
              你的游戏概念已基于真实玩家需求完成验证。
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/")} className="btn-primary">新建项目</button>
              <button onClick={() => router.push("/phase/1")} className="btn-secondary">重新开始</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Reusable Asset Card ───────────────────────────── */

function AssetCard({
  title, subtitle, content, icon, label, copied, onCopy, isMarkdown = false,
}: {
  title: string; subtitle: string; content: string; icon: React.ReactNode;
  label: string; copied: string | null; onCopy: (t: string, l: string) => void; isMarkdown?: boolean;
}) {
  return (
    <div className="card">
      <div className="card-body">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--c-blue-light)", color: "var(--c-blue)" }}>
              {icon}
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>{title}</h3>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)" }}>{subtitle}</p>
            </div>
          </div>

          {/* Copy button */}
          <button onClick={() => onCopy(content, label)}
            className={`btn btn-sm ${copied === label ? "btn-primary" : "btn-secondary"}`}>
            {copied === label ? "已复制！" : "复制"}
          </button>
        </div>

        {/* Content */}
        {isMarkdown ? (
          <pre style={{
            fontSize: "var(--text-sm)",
            color: "var(--c-text-secondary)",
            whiteSpace: "pre-wrap",
            lineHeight: "var(--lh-relaxed)",
            fontFamily: "var(--font-mono)",
            background: "var(--c-bg)",
            borderRadius: 10,
            padding: "var(--space-lg)",
            maxHeight: 280,
            overflowY: "auto",
          }}>{content}</pre>
        ) : (
          <p style={{
            fontSize: "var(--text-sm)",
            color: "var(--c-text-secondary)",
            lineHeight: "var(--lh-relaxed)",
            fontStyle: "italic",
            background: "var(--c-bg)",
            borderRadius: 10,
            padding: "var(--space-lg)",
          }}>&ldquo;{content}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
