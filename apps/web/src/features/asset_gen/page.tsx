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
    if (!projectId) { setError("Need a project_id"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/v1/asset-gen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, custom_name: customName, custom_genre: customGenre }),
      });
      const data = await res.json() as GeneratedAssets & { detail?: string };
      if (data.status === "ok") setResult(data);
      else setError((data as { detail?: string }).detail || "Generation failed");
    } catch { setError("Failed to connect to API"); }
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
    <div className="mi-scroll-area mi-safe-bottom">
      <header className="mi-header pb-16">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-white/80 p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-bold">Phase 4: Assets</h1>
        </div>
        <p className="text-white/60 text-[12px] ml-9">Marketing-ready game assets</p>
      </header>

      <main className="px-4 -mt-10 relative z-10 space-y-3 pb-8">
        {/* Loading */}
        {loading && (
          <div className="mi-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mb-3" />
            <p className="text-[13px] text-gray-500">Generating marketing assets...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-500 text-[13px]">{error}</div>
        )}

        {/* Results */}
        {result && result.status === "ok" && (
          <>
            {/* Elevator Pitch */}
            <AssetCard
              title="Elevator Pitch"
              subtitle="One-sentence hook for investors / press"
              content={result.elevator_pitch}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
              label="pitch"
              copied={copied} onCopy={copyToClipboard}
            />

            {/* Steam Description */}
            <AssetCard
              title="Steam Short Description"
              subtitle="SEO-optimized with player language"
              content={result.steam_short_desc}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              label="steam-desc"
              copied={copied} onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Devlog Topic */}
            <AssetCard
              title="Devlog Topic"
              subtitle="Reddit-resonant research angle"
              content={result.devlog_topic}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              label="devlog"
              copied={copied} onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Tags */}
            <div className="mi-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                  <span className="font-semibold text-[13px] text-gray-900">Steam Tags</span>
                </div>
                <button onClick={() => copyToClipboard(result.tag_suggestions.join(", "), "tags")}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${copied === "tags" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {copied === "tags" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.tag_suggestions.map((tag) => (
                  <span key={tag} className="text-[11px] bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Done */}
            <div className="mi-card p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-600">All 4 phases complete!</p>
              <p className="text-[11px] text-gray-400">Your concept is backed by real player demand.</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => router.push("/")} className="flex-1 mi-btn mi-btn-primary py-2.5 text-[13px]">
                  New Project
                </button>
                <button onClick={() => router.push("/phase/1")} className="flex-1 mi-btn mi-btn-secondary py-2.5 text-[13px]">
                  Start Over
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Reusable Asset Card ─────────────────────────────

function AssetCard({
  title, subtitle, content, icon, label, copied, onCopy, isMarkdown = false,
}: {
  title: string; subtitle: string; content: string; icon: React.ReactNode;
  label: string; copied: string | null; onCopy: (t: string, l: string) => void; isMarkdown?: boolean;
}) {
  return (
    <div className="mi-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-400">
            {icon}
            <div>
              <p className="font-semibold text-[13px] text-gray-900 leading-none">{title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button onClick={() => onCopy(content, label)}
            className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${copied === label ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >{copied === label ? "Copied!" : "Copy"}</button>
        </div>

        {isMarkdown ? (
          <pre className="text-[12px] text-gray-600 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto mt-2">
            {content}
          </pre>
        ) : (
          <p className="text-[13px] text-gray-700 leading-relaxed italic bg-gray-50 rounded-lg p-3 mt-2 line-clamp-4">
            &ldquo;{content}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
