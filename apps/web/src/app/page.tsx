"use client";

import Link from "next/link";

const PHASES = [
  {
    id: 1,
    title: "Niche Discovery",
    subtitle: "Find underserved game categories",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: "#4DA6FF",
    bg: "#E8F4FF",
    route: "/phase/1",
    status: "ready",
    desc: "Google Autocomplete + Reddit + TapTap + XHS + BiliBili",
  },
  {
    id: 2,
    title: "Sentiment Analysis",
    subtitle: "Extract player pain points & desires",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    color: "#FF6B9D",
    bg: "#FFF0F5",
    route: "/phase/2",
    status: "ready",
    desc: "VADER sentiment + consensus extraction from Reddit threads",
  },
  {
    id: 3,
    title: "Data Structuring",
    subtitle: "Build prioritized Feature Backlog",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    color: "#52C41A",
    bg: "#F0FFF4",
    route: "/phase/3",
    status: "ready",
    desc: "P0 Must-Have → P3 Stretch Goals, auto-prioritized by intensity",
  },
  {
    id: 4,
    title: "Asset Generation",
    subtitle: "Export marketing-ready materials",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: "#FAAD14",
    bg: "#FFFBE6",
    route: "/phase/4",
    status: "ready",
    desc: "Elevator Pitch · Steam Description · Devlog Topic · Tags",
  },
];

export default function HomePage() {
  return (
    <div className="mi-scroll-area mi-safe-bottom">
      {/* ── Gradient Header ─────────────────────── */}
      <header className="mi-header pb-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide">
              Gaming PM Agent
            </h1>
            <p className="text-white/70 text-xs mt-1">
              Data-driven game concept discovery
            </p>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-white/90 font-medium">All Systems Online</span>
          </div>
        </div>

        {/* Quick stats row (like 米游社 tool icons) */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: "4 Phases", sub: "Complete" },
            { label: "5 Sources", sub: "Reddit+CN" },
            { label: "VADER", sub: "Sentiment" },
            { label: "P0-P3", sub: "Priority" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-shrink-0 bg-white/12 backdrop-blur-sm rounded-lg px-3 py-2"
            >
              <p className="text-white font-semibold text-xs">{stat.label}</p>
              <p className="text-white/60 text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Content Area (overlaps header) ───────── */}
      <main className="px-4 -mt-10 relative z-10 space-y-4 pb-8">
        {/* Phase Cards */}
        {PHASES.map((phase, i) => (
          <Link key={phase.id} href={phase.route}>
            <div className="mi-card active:scale-[0.98] transition-transform">
              <div className="p-4 flex gap-3.5">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: phase.bg, color: phase.color }}
                >
                  {phase.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-gray-900">
                      P{phase.id}: {phase.title}
                    </span>
                    <span
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: phase.bg, color: phase.color }}
                    >
                      READY
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
                    {phase.subtitle}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 truncate">
                    {phase.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className="self-center text-gray-300 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Pipeline Flow Diagram */}
        <div className="mi-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pipeline</p>
          <div className="flex items-center justify-between gap-1">
            {["Search", "Analyze", "Structure", "Export"].map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 text-center leading-tight">{step}</span>
                </div>
                {i < 3 && (
                  <div className="w-4 h-0.5 bg-blue-200 -mx-1 mt-[-10px]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] text-gray-400">
            Powered by Reddit API · VADER Sentiment · FastAPI + Next.js
          </p>
          <a
            href="https://github.com/yunzhixu620-stack/gaming-grab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-400 hover:text-blue-300 mt-1 inline-block"
          >
            GitHub →
          </a>
        </div>
      </main>
    </div>
  );
}
