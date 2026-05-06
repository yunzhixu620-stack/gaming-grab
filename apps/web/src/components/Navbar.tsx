"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/phase/1", label: "品类发现" },
  { href: "/phase/2", label: "情感分析" },
  { href: "/phase/3", label: "需求结构化" },
  { href: "/phase/4", label: "资产生成" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          游戏<span>PM</span>智能体
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navbar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side spacer */}
        <div className="navbar-spacer" />

        {/* Status indicator */}
        <div className="desktop-only items-center gap-sm">
          <span className="badge badge-success">
            <span className="badge-dot" />
            运行中
          </span>
        </div>
      </div>
    </nav>
  );
}
