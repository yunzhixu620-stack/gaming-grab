import type { Metadata } from "next";
import "./globals.css";
import MiBottomNav from "@/components/MiLayout";
import { HomeIcon, SearchIcon, PlusIcon, ListIcon, AssetIcon } from "@/components/MiLayout";

export const metadata: Metadata = {
  title: "游戏产品经理智能体 | 数据驱动游戏发现",
  description: "从社交论坛挖掘未满足的细分游戏需求，生成结构化游戏设计文档",
};

const SIDEBAR_LINKS = [
  { href: "/", icon: HomeIcon, label: "首页", section: "main" },
  { href: "/phase/1", icon: SearchIcon, label: "第1阶段：品类发现", section: "pipeline" },
  { href: "/phase/2", icon: PlusIcon, label: "第2阶段：情感分析", section: "pipeline" },
  { href: "/phase/3", icon: ListIcon, label: "第3阶段：需求结构化", section: "pipeline" },
  { href: "/phase/4", icon: AssetIcon, label: "第4阶段：资产生成", section: "pipeline" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <div className="mi-layout">
          {/* PC 端侧边栏 */}
          <aside className="mi-sidebar">
            <div className="mi-sidebar-header">
              <h1>游戏产品经理智能体</h1>
              <p>数据驱动的概念发现</p>
            </div>

            <nav className="mi-nav-section">
              <div className="mi-nav-label">主导航</div>
              {SIDEBAR_LINKS.filter((l) => l.section === "main").map((link) => (
                <SidebarLink key={link.href} {...link} />
              ))}

              <div className="mi-nav-label">工作流程</div>
              {SIDEBAR_LINKS.filter((l) => l.section === "pipeline").map((link) => (
                <SidebarLink key={link.href} {...link} />
              ))}
            </nav>

            <div className="mi-sidebar-footer">
              <a
                href="https://github.com/yunzhixu620-stack/gaming-grab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gray-400 hover:text-blue-400 transition-colors"
              >
                GitHub → yunzhixu620-stack
              </a>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="mi-content">{children}</main>

          {/* 移动端底部导航 */}
          <MiBottomNav />
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.FC<{ active?: boolean }>; label: string }) {
  return (
    <a href={href} className="mi-nav-link">
      <span className="nav-icon"><Icon /></span>
      <span className="nav-label">{label}</span>
    </a>
  );
}
