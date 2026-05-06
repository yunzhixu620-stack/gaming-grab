"use client";

import Link from "next/link";

const PHASES = [
  {
    id: 1,
    title: "品类发现",
    subtitle: "从玩家社区挖掘未被满足的细分游戏需求",
    desc: "Google 自动补全 · Reddit 公开 API · TapTap · 小红书 · B站",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: "#4DA6FF",
    bg: "#EEF5FF",
    route: "/phase/1",
  },
  {
    id: 2,
    title: "情感分析",
    subtitle: "从真实玩家发言中提取痛点、诉求和共识",
    desc: "VADER 情感评分 · 共识点提取 · 玩家原话引用",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    color: "#FF6B9D",
    bg: "#FFF0F5",
    route: "/phase/2",
  },
  {
    id: 3,
    title: "需求结构化",
    subtitle: "将玩家情感转化为优先级排序的功能清单",
    desc: "P0 核心功能 → P3 延伸目标 · 按强度信号自动排序",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    color: "#52C41A",
    bg: "#F0FFF4",
    route: "/phase/3",
  },
  {
    id: 4,
    title: "资产生成",
    subtitle: "导出可直接用于 Steam 和社交媒体的营销素材",
    desc: "一句话推介 · Steam 描述 · 开发日志选题 · Steam 标签",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: "#E8B930",
    bg: "#FFF8E6",
    route: "/phase/4",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="mb-2xl">
        <div className="card card-body-lg text-center" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%)", color: "#fff", border: "none" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-sm)" }}>
            游戏产品经理智能体
          </h1>
          <p style={{ fontSize: "var(--text-md)", color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto var(--space-lg)", lineHeight: "var(--lh-relaxed)" }}>
            从社交论坛挖掘未满足的细分游戏需求，转化为结构化的游戏设计文档
          </p>

          {/* Quick stats */}
          <div className="flex justify-center gap-3 flex-wrap mt-xl">
            {[
              { label: "4 个阶段", value: "完整流程" },
              { label: "5 大数据源", value: "Reddit + 国内平台" },
              { label: "VADER 引擎", value: "情感分析" },
              { label: "P0-P3 分级", value: "优先级排序" },
            ].map((stat) => (
              <div key={stat.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
              >
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>{stat.label}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.55)" }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase Cards Grid */}
      <section className="mb-2xl">
        <div className="section-header mb-lg">
          <div>
            <h2 className="section-title">工作流程</h2>
            <p className="section-subtitle">按顺序执行每个阶段，数据自动流转</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-xl" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {PHASES.map((phase) => (
            <Link key={phase.id} href={phase.route}>
              <div className="card h-full" style={{ cursor: "pointer" }}>
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: phase.bg, color: phase.color }}
                    >
                      {phase.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--c-text)" }}>
                          第{phase.id}阶段：{phase.title}
                        </h3>
                        <span className="tag tag-gold">就绪</span>
                      </div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-secondary)", lineHeight: "var(--lh-normal)" }}>
                        {phase.subtitle}
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)", marginTop: "var(--space-sm)" }}>
                        {phase.desc}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-lg pt-lg" style={{ borderTop: "1px solid var(--c-border-light)" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)" }}>点击进入</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-tertiary)" strokeWidth={2}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pipeline Flow */}
      <section className="mb-2xl">
        <div className="card card-body">
          <p className="section-title mb-lg">数据流转</p>
          <div className="flex items-center justify-between gap-2">
            {[
              { step: "搜索发现", sub: "关键词扩展 + 多源采集", emoji: "🔍", c: "#4DA6FF" },
              { step: "情感分析", sub: "VADER评分 + 共识提取", emoji: "💓", c: "#FF6B9D" },
              { step: "需求结构化", sub: "P0-P3优先级排序", emoji: "📋", c: "#52C41A" },
              { step: "资产导出", sub: "Steam营销素材生成", emoji: "📄", c: "#E8B930" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-3 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2"
                    style={{ background: item.c + "15", boxShadow: `0 2px 8px ${item.c}25` }}
                  >{item.emoji}</div>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>{item.step}</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--c-text-tertiary)", textAlign: "center", marginTop: "2px" }}>{item.sub}</p>
                </div>
                {i < 3 && (
                  <div style={{ width: 32, height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${item.c}, transparent)`, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pb-2xl">
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-tertiary)" }}>
          基于 Reddit API · VADER 情感分析 · FastAPI + Next.js
        </p>
        <a href="https://github.com/yunzhixu620-stack/gaming-grab" target="_blank" rel="noopener noreferrer"
          className="btn-ghost mt-sm" style={{ fontSize: "var(--text-xs)" }}>
          GitHub → yunzhixu620-stack/gaming-grab
        </a>
      </footer>
    </div>
  );
}
