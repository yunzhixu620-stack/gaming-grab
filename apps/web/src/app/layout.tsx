import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "游戏产品经理智能体 | 数据驱动游戏发现",
  description: "从社交论坛挖掘未满足的细分游戏需求，生成结构化游戏设计文档",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {/* Top Navigation Bar — always visible */}
        <Navbar />

        {/* Main Content Area */}
        <main className="main-content" style={{ paddingBottom: "70px" /* space for bottom nav */ }}>
          <div className="page-wrapper">
            {children}
          </div>
        </main>

        {/* Bottom Navigation — mobile only (< 768px) */}
        <nav
          id="bottom-nav"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
            background: "#FFFFFF",
            borderTop: "1px solid #E5E6EB",
            display: "flex", justifyContent: "space-around", alignItems: "center",
            height: 64, padding: "0 var(--space-sm)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
          }}
        >
          {/* Hide on desktop */}
          <style>{`@media (min-width: 768px) { #bottom-nav { display: none !important; } }`}</style>

          {[
            { href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "首页" },
            { href: "/phase/1", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", label: "发现" },
            { href: "/phase/2", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "分析" },
            { href: "/phase/3", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", label: "结构" },
            { href: "/phase/4", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "资产" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flex: 1, height: "100%", textDecoration: "none", color: "var(--c-text-tertiary)",
                fontSize: "10px", gap: 3, transition: "color 0.15s",
                paddingTop: 6,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </body>
    </html>
  );
}
