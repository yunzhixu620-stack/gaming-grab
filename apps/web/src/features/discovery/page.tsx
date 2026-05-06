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
    } catch {
      setError("无法连接到后端服务");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mi-scroll-area mi-safe-bottom">
      {/* 渐变头部 */}
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/")} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="mi-header-title">第1阶段：品类发现</h1>
        </div>
        <p className="mi-header-subtitle ml-9">从玩家社区挖掘未被满足的细分游戏需求</p>
      </header>

      {/* 搜索区域 */}
      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        <div className="mi-card p-4 space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2} strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="输入游戏关键词，如「合作生存」「开放世界建造」..."
              className="w-full pl-10 pr-12 py-3 bg-gray-50 rounded-xl text-[14px] text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-blue-300 focus:bg-white outline-none transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-[13px] font-medium text-white transition-all disabled:opacity-40"
              style={{ background: loading ? "#ccc" : "linear-gradient(135deg, #1a6dbd, #3d9be6)" }}
            >
              {loading ? "搜索中..." : "搜索"}
            </button>
          </div>

          {/* 数据源选择 */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="text-[11px] text-gray-400 self-center mr-1">数据源：</span>
            {SOURCE_OPTIONS.map((src) => (
              <button
                key={src.key}
                onClick={() => toggleSource(src.key)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                  sources.includes(src.key)
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={sources.includes(src.key) ? { background: src.color } : {}}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">正在搜索各平台玩家讨论...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* 搜索结果 */}
        {results && results.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-[13px] text-gray-500">
                发现 <strong>{results.length}</strong> 个潜力品类
              </p>
              <p className="text-[11px] text-gray-400">点击卡片进入下一步</p>
            </div>

            {results.map((niche, idx) => (
              <div
                key={niche.id}
                onClick={() => router.push(`/phase/2?project_id=${niche.id}`)}
                className="mi-card hover:shadow-md cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="p-4 flex items-start gap-3.5">
                  {/* 排名 */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                    style={{
                      background: idx === 0 ? "#FFF3E0" : idx === 1 ? "#E3F2FD" : idx === 2 ? "#F3E5F5" : "#F5F5F5",
                      color: idx === 0 ? "#FF9800" : idx === 1 ? "#2196F3" : idx === 2 ? "#9C27B0" : "#757575",
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[15px] text-gray-900 truncate">{niche.niche_name}</h3>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate">{niche.category} · 置信度 {(niche.confidence_score * 100).toFixed(0)}%</p>

                    {/* 来源标签 */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {niche.sources.map((s) => {
                        const src = SOURCE_OPTIONS.find((o) => o.key === s);
                        return (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: (src?.color || "#eee") + "20", color: src?.color || "#666" }}>
                            {src?.label || s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 箭头 */}
                  <div className="self-center text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 无结果提示 */}
        {results && results.length === 0 && (
          <div className="mi-card p-8 text-center">
            <p className="text-[14px] text-gray-500">未找到相关品类</p>
            <p className="text-[12px] text-gray-400 mt-1">尝试更换关键词或选择更多数据源</p>
          </div>
        )}
      </main>
    </div>
  );
}
