"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NicheCandidate {
  id: string;
  niche_name: string;
  category: string;
  confidence_score: number;
  source_count: number;
  sources: string[];
  keywords_found: string[];
  search_volume_proxy: string;
}

const SOURCE_OPTIONS = [
  { key: "reddit", label: "Reddit", color: "#FF4500" },
  { key: "taptap", label: "TapTap", color: "#00D4AA" },
  { key: "xiaohongshu", label: "小红书", color: "#FF2442" },
  { key: "bilibili", label: "B站", color: "#00A1D6" },
];

export default function DiscoveryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState<string[]>(["reddit"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NicheCandidate[] | null>(null);
  const [error, setError] = useState("");

  const toggleSource = (key: string) => {
    setSources((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const res = await fetch("/api/v1/discovery/niches/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, sources }),
      });
      const data = await res.json() as { niches?: NicheCandidate[]; detail?: string };
      if (data.niches) setResults(data.niches);
      else setError((data as { detail?: string }).detail || "搜索失败");
    } catch { setError("无法连接到后端服务"); }
    finally { setLoading(false); }
  };

  return (
    <div className="layout-single">
      {/* Page Header */}
      <div className="mb-xl">
        <button onClick={() => router.push("/")} className="btn-ghost mb-md" style={{ fontSize: "var(--text-sm)" }}>
          ← 返回首页
        </button>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-xs)" }}>
          第1阶段：品类发现
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--c-text-secondary)" }}>
          从玩家社区挖掘未被满足的细分游戏需求
        </p>
      </div>

      {/* Search Card */}
      <div className="card card-body-lg mb-xl">
        {/* Search Input */}
        <div className="input-group mb-lg">
          <span className="input-group-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="输入游戏关键词，如「合作生存」「开放世界建造」..."
            className="input"
            style={{ paddingRight: 130 }}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn-primary"
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
          >
            {loading ? "搜索中..." : "开始搜索"}
          </button>
        </div>

        {/* Source Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)", fontWeight: 600 }}>数据源：</span>
          {SOURCE_OPTIONS.map((src) => (
            <button
              key={src.key}
              onClick={() => toggleSource(src.key)}
              className="tag"
              style={{
                cursor: "pointer",
                background: sources.includes(src.key) ? src.color : undefined,
                color: sources.includes(src.key) ? "#fff" : undefined,
                border: sources.includes(src.key) ? "none" : undefined,
                opacity: sources.includes(src.key) ? 1 : 0.7,
                transition: "all 150ms ease",
                padding: sources.includes(src.key) ? "6px 14px" : undefined,
              }}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card card-body-lg text-center mb-xl">
          <div className="flex justify-center mb-md">
            <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>正在搜索各平台玩家讨论...</p>
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
      {results && results.length > 0 && (
        <>
          <div className="section-header mb-lg">
            <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>
              发现 <strong>{results.length}</strong> 个潜力品类
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)" }}>点击卡片进入下一步</p>
          </div>

          <div className="space-y-lg">
            {results.map((niche, idx) => (
              <div
                key={niche.id}
                onClick={() => router.push(`/phase/2?project_id=${niche.id}`)}
                className="card"
                style={{ cursor: "pointer" }}
              >
                <div className="card-body flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{
                      background: idx === 0 ? "#FFF3E0" : idx === 1 ? "#E3F2FD" : idx === 2 ? "#F3E5F5" : "#F5F5F5",
                      color: idx === 0 ? "#FF9800" : idx === 1 ? "#2196F3" : idx === 2 ? "#9C27B0" : "#757575",
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--c-text)", marginBottom: 2 }}>
                      {niche.niche_name}
                    </h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)" }}>
                      {niche.category} · 置信度 {(niche.confidence_score * 100).toFixed(0)}%
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {niche.sources.map((s) => {
                        const src = SOURCE_OPTIONS.find((o) => o.key === s);
                        return (
                          <span key={s} className="tag tag-outline" style={{ fontSize: "10px", padding: "2px 8px", borderColor: (src?.color || "#ddd") + "40", color: src?.color || "#888" }}>
                            {src?.label || s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-tertiary)" strokeWidth={2} className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {results && results.length === 0 && !loading && (
        <div className="card card-body-lg text-center">
          <p style={{ fontSize: "var(--text-base)", color: "var(--c-text-secondary)" }}>未找到相关品类</p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-tertiary)", marginTop: "var(--space-sm)" }}>
            尝试更换关键词或选择更多数据源
          </p>
        </div>
      )}
    </div>
  );
}
