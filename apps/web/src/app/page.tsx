"use client";

import Link from "next/link";

const PHASES = [
  {
    id: 1, title: "品类发现", subtitle: "从玩家社区挖掘未被满足的细分游戏需求",
    desc: "Reddit 公开数据已接入 · 国内平台仍为实验采集与回退数据",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    color: "#4DA6FF", bg: "#F0F7FF", route: "/phase/1",
  },
  {
    id: 2, title: "情感分析", subtitle: "从真实玩家发言中提取痛点、诉求和共识",
    desc: "VADER 情感评分 · 共识点提取 · 玩家原话引用",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    color: "#FF6B9D", bg: "#FFF0F5", route: "/phase/2",
  },
  {
    id: 3, title: "需求结构化", subtitle: "将玩家情感转化为优先级排序的功能清单",
    desc: "P0 核心功能 → P3 延伸目标 · 按强度信号自动排序",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    color: "#52C41A", bg: "#F0FFF4", route: "/phase/3",
  },
  {
    id: 4, title: "资产生成", subtitle: "导出可直接用于 Steam 和社交媒体的营销素材",
    desc: "一句话推介 · Steam 描述 · 开发日志选题 · Steam 标签",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    color: "#E8B930", bg: "#FFFBE6", route: "/phase/4",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section (miHoYo mobile blue gradient) ── */}
      <section className="mb-2xl">
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #3D9BE6 0%, #4DA6FF 40%, #5BB8FF 70%, #6BC5FF 100%)",
            border: "none",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Decorative background pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="#fff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>

          <div className="card-body-lg text-center" style={{ position: "relative", color: "#fff" }}>
            <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "var(--space-sm)" }}>
              游戏产品经理智能体
            </h1>
            <p style={{ fontSize: "var(--text-md)", color: "rgba(255,255,255,0.88)", maxWidth: 500, margin: "0 auto var(--space-lg)", lineHeight: "var(--lh-relaxed)" }}>
              从社交论坛挖掘未满足的细分游戏需求，转化为结构化的游戏设计文档
            </p>

            {/* Stats pills */}
            <div className="flex justify-center gap-3 flex-wrap mt-xl">
              {[
                { label: "MVP", value: "4 阶段流程" },
                { label: "真实数据", value: "Reddit 已接入" },
                { label: "VADER 引擎", value: "情感分析" },
                { label: "P0-P3 分级", value: "优先级排序" },
              ].map((stat) => (
                <div key={stat.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                >
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>{stat.label}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.7)" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-2xl">
        <div className="card card-body" style={{ borderColor: "#E8B930", background: "#FFFBE6" }}>
          <div className="flex items-start gap-3">
            <span className="tag tag-gold" style={{ flexShrink: 0 }}>MVP 边界</span>
            <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", lineHeight: "var(--lh-relaxed)" }}>
              在线页面依赖独立 FastAPI 服务。Reddit 为当前主要真实社区数据源；TapTap、小红书和 B 站采集仍处于实验阶段，服务不可用时产生的回退内容不代表真实市场结论。进入各阶段后，页面会明确显示连接失败，不会把失败结果标记为完成。
            </p>
          </div>
        </div>
      </section>

      {/* ── Phase Cards (miyosh feed-style) ── */}
      <section className="mb-2xl">
        <div className="section-header mb-lg">
          <div>
            <h2 className="section-title">工作流程</h2>
            <p className="section-subtitle">按顺序执行每个阶段，数据自动流转</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-lg)" }}>
          {PHASES.map((phase) => (
            <Link key={phase.id} href={phase.route}>
              <div className="card h-full" style={{ cursor: "pointer" }}>
                <div className="card-body">
                  {/* Top row: Icon + Title + Badge */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: phase.bg, color: phase.color }}
                    >
                      {phase.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--c-text)" }}>
                          第{phase.id}阶段：{phase.title}
                        </h3>
                        <span className="tag tag-gold" style={{ fontSize: "10px", padding: "2px 8px" }}>MVP</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", lineHeight: "var(--lh-normal)" }}>
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description + Meta */}
                  <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "var(--space-md)" }}>
                    {phase.desc}
                  </p>

                  {/* Footer: CTA */}
                  <div
                    className="flex items-center justify-between pt-3 mt-auto"
                    style={{ borderTop: "1px solid var(--c-border-light)" }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--c-text-tertiary)" }}>点击进入</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-tertiary)" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Data Pipeline Flow ── */}
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
              <div key={item.step} className="flex items-center gap-2.5 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-2"
                    style={{ background: item.c + "12", boxShadow: `0 2px 10px ${item.c}20` }}
                  >{item.emoji}</div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>{item.step}</p>
                  <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", textAlign: "center", marginTop: 2 }}>{item.sub}</p>
                </div>
                {i < 3 && (
                  <div style={{ width: 28, height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${item.c}, transparent)`, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center pb-2xl">
        <p style={{ fontSize: "13px", color: "var(--c-text-tertiary)" }}>
          基于 Reddit API · VADER 情感分析 · FastAPI + Next.js
        </p>
        <a href="https://github.com/yunzhixu620-stack/gaming-grab" target="_blank" rel="noopener noreferrer"
          className="btn-ghost mt-sm" style={{ fontSize: "12px" }}>
          GitHub → yunzhixu620-stack/gaming-grab
        </a>
      </footer>
    </div>
  );
}
