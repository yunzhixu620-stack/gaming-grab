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
        {/* Top Navigation Bar (miyoushe PC style) */}
        <Navbar />

        {/* Main Content Area */}
        <main className="main-content">
          <div className="page-wrapper">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
