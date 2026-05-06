"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";

  const [customName, setCustomName] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedAssets | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!projectId) {
      setError("Need a project_id from Phase 3");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/assets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          custom_name: customName,
          custom_genre: customGenre,
        }),
      });
      const data: GeneratedAssets = await res.json();
      if (data.status === "ok") {
        setResult(data);
      } else {
        setError(data.detail || "Generation failed");
      }
    } catch (e) {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mb-1">
            <a href="/" className="hover:text-indigo-400">Home</a>
            <span>→</span>
            <a href="/phase/1" className="hover:text-indigo-400">Phase 1</a>
            <span>→</span>
            <a href={`/phase/2?project_id=${projectId}`} className="hover:text-indigo-400">Phase 2</a>
            <span>→</span>
            <a href={`/phase/3?project_id=${projectId}`} className="hover:text-indigo-400">Phase 3</a>
            <span>→</span>
            <span className="text-neutral-400">Phase 4</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Phase 4: Asset Generation
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Generate ready-to-use marketing assets from your Feature Backlog
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Game name (optional, auto-generated)"
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3
                       text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500
                       focus:outline-none transition-colors"
          />
          <input
            type="text"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Genre hint (optional)"
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3
                       text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500
                       focus:outline-none transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !projectId}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800
                       disabled:text-neutral-600 rounded-lg font-medium transition-colors"
          >
            {loading ? "Generating..." : "Generate Assets"}
          </button>
        </div>

        {projectId && (
          <p className="text-xs text-neutral-600">
            Project ID: <code className="bg-neutral-900 px-1.5 py-0.5 rounded">{projectId}</code>
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            <p className="mt-3 text-sm">Generating marketing assets...</p>
          </div>
        )}

        {/* Results */}
        {result && result.status === "ok" && (
          <div className="space-y-5">
            {/* Elevator Pitch */}
            <AssetCard
              title="Elevator Pitch"
              subtitle="One-sentence hook for investors / press"
              content={result.elevator_pitch}
              label="pitch"
              copied={copied}
              onCopy={copyToClipboard}
            />

            {/* Steam Short Description */}
            <AssetCard
              title="Steam Short Description"
              subtitle="SEO-optimized with player language"
              content={result.steam_short_desc}
              label="steam-desc"
              copied={copied}
              onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Devlog Topic */}
            <AssetCard
              title="Devlog Topic"
              subtitle="Reddit-resonant research angle"
              content={result.devlog_topic}
              label="devlog"
              copied={copied}
              onCopy={copyToClipboard}
              isMarkdown
            />

            {/* Steam Tags */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm text-neutral-200">Steam Tag Suggestions</h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {result.tag_count} tags derived from features + player emotions
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(result.tag_suggestions.join(", "), "tags")
                  }
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded transition-colors"
                >
                  {copied === "tags" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tag_suggestions.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-indigo-950/30 text-indigo-400/80 px-2.5 py-1 rounded-full border border-indigo-900/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Done CTA */}
            <div className="pt-4 border-t border-neutral-800 text-center space-y-3">
              <p className="text-sm text-neutral-500">
                All 4 phases complete! Your game concept is backed by real player demand.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="/"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors"
                >
                  Start New Project →
                </a>
                <a
                  href={`/phase/1`}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                >
                  ← Back to Phase 1
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Reusable Asset Card Component ──────────────────────

function AssetCard({
  title,
  subtitle,
  content,
  label,
  copied,
  onCopy,
  isMarkdown = false,
}: {
  title: string;
  subtitle: string;
  content: string;
  label: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
  isMarkdown?: boolean;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-sm text-neutral-200">{title}</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => onCopy(content, label)}
          className={`text-xs px-3 py-1.5 rounded transition-colors ${
            copied === label
              ? "bg-green-900/40 text-green-400"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          {copied === label ? "Copied!" : "Copy"}
        </button>
      </div>

      {isMarkdown ? (
        <pre className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono bg-neutral-950/50 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
          {content}
        </pre>
      ) : (
        <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/50 rounded-lg p-4 italic">
          &ldquo;{content}&rdquo;
        </p>
      )}
    </div>
  );
}
