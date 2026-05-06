"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Bottom Navigation (米游社风格) ──────────────────

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/phase/1", icon: SearchIcon, label: "Discover" },
  null, // FAB slot
  { href: "/phase/3", icon: ListIcon, label: "Backlog" },
  { href: "/phase/4", icon: AssetIcon, label: "Assets" },
];

export function MiBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mi-bottom-nav">
      {NAV_ITEMS.map((item, i) => {
        if (!item) {
          return (
            <div key="fab" className="mi-nav-fab-slot">
              <Link href="/phase/2" className="mi-fab">
                <PlusIcon />
              </Link>
            </div>
          );
        }

        const isActive = pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mi-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon"><item.icon active={isActive} /></span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Tab Bar Component ───────────────────────────────

interface MiTabBarProps {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function MiTabBar({ tabs, activeId, onChange }: MiTabBarProps) {
  return (
    <div className="mi-tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`mi-tab ${activeId === tab.id ? "active" : ""}`}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Header Component ───────────────────────────────

interface MiHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  height?: "normal" | "tall";
  overlap?: boolean;
}

export function MiHeader({
  title,
  subtitle,
  children,
  height = "normal",
  overlap = false,
}: MiHeaderProps) {
  return (
    <header
      className={`mi-header ${height === "tall" ? "pb-24" : ""} ${overlap ? "mi-header-overlap" : ""}`}
    >
      <h1 className="mi-header-title">{title}</h1>
      {subtitle && <p className="mi-header-subtitle">{subtitle}</p>}
      {children}
    </header>
  );
}

// ── SVG Icons (inline, minimal) ─────────────────────

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function AssetIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export { HomeIcon, SearchIcon, PlusIcon, ListIcon, AssetIcon };
