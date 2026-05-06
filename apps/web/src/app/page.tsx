"use client";

import Link from "next/link";

const PHASES = [
  {
    id: 1,
    title: "品类发现",
    subtitle: "从玩家讨论中挖掘未被满足的细分游戏品类",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: "#4DA6FF",
    bg: "#E8F4FF",
    route: "/phase/1",
    status: "就绪",
    desc: "Google 自动补全 · Reddit 公开 API · TapTap · 小红书 · B站",
  },
  {
    id: 2,
    title: "情感分析",
    subtitle: "从真实玩家发言中提取痛点、诉求和共识",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    color: "#FF6B9D",
    bg: "#FFF0F5",
    route: "/phase/2",
    status: "就绪",
    desc: "VADER 情感评分 · 共识点提取 · 玩家原话引用",
  },
  {
    id: 3,
    title: "需求结构化",
    subtitle: "将玩家情感转化为优先级排序的功能清单",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    color: "#52C41A",
    bg: "#F0FFF4",
    route: "/phase/3",
    status: "就绪",
    desc: "P0 核心功能 → P3 延伸目标 · 按强度信号自动排序",
  },
  {
    id: 4,
    title: "资产生成",
    subtitle: "导出可直接用于 Steam 和社交媒体的营销素材",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: "#FAAD14",
    bg: "#FFFBE6",
    route: "/phase/4",
    status: "就绪",
    desc: "一句话推介 · Steam 描述 · 开发日志选题 · Steam 标签",
  },
];

export default function HomePage() {
  return (
    <div className="mi-scroll-area mi-safe-bottom">
      {/* 移动端渐变头部 */}
      <header className="mi-header md:hidden pb-16">
        <h1 className="mi-header-title">游戏产品经理智能体</h1>
        <p className="mi-header-subtitle">数据驱动的游戏概念发现平台</p>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: "4 个阶段", sub: "全部完成" },
            { label: "5 大数据源", sub: "Reddit+国内" },
            { label: "情感引擎", sub: "VADER" },
            { label: "优先级", sub: "P0-P3" },
          ].map((stat) => (
            <div key={stat.label} className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white font-semibold text-xs">{stat.label}</p>
              <p className="text-white/60 text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </header>

      {/* PC 端页面头部 */}
      <div className="hidden md:block mi-page-header">
        <div>
          <h1 className="mi-page-title">游戏产品经理智能体</h1>
          <p className="mi-page-subtitle">从社交论坛挖掘未满足的细分游戏需求 → 结构化游戏设计文档</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            所有系统运行正常
          </span>
        </div>
      </div>

      {/* 内容区 */}
      <main className="space-y-6 pb-8">
        {/* 阶段卡片 */}
        <div className="mi-grid-2">
          {PHASES.map((phase) => (
            <Link key={phase.id} href={phase.route}>
              <div className="mi-card hover:shadow-lg transition-all duration-200 group h-full">
                <div className="p-5 flex gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: phase.bg, color: phase.color }}
                  >
                    {phase.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[15px] text-gray-900">
                        第{phase.id}阶段：{phase.title}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: phase.bg, color: phase.color }}
                      >
                        {phase.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed mt-0.5">{phase.subtitle}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 truncate">{phase.desc}</p>
                  </div>
                  <div className="self-center text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 流程图 */}
        <div className="mi-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">工作流程</p>
          <div className="flex items-center justify-between gap-2">
            {[
              { step: "搜索发现", icon: "🔍", color: "blue" },
              { step: "情感分析", icon: "💓", color: "pink" },
              { step: "需求结构化", icon: "📋", color: "green" },
              { step: "资产导出", icon: "📄", color: "amber" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center text-base`}>{item.icon}</div>
                  <span className="text-[11px] text-gray-600 mt-1.5 text-center font-medium leading-tight">{item.step}</span>
                </div>
                {i < 3 && <div className={`w-8 h-0.5 bg-${item.color}-200 rounded-full -mx-1 mt-[-12px]`} />}
              </div>
            ))}
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[12px] text-gray-400">基于 Reddit API · VADER 情感分析 · FastAPI + Next.js</p>
          <a href="https://github.com/yunzhixu620-stack/gaming-grab" target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-400 hover:text-blue-300 mt-1 inline-block">
            GitHub → yunzhixu620-stack/gaming-grab
          </a>
        </div>
      </main>
    </div>
  );
}
