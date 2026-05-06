"use client";

import { usePathname, useRouter } from "next/navigation";

/* ── SVG Icons ── */
export function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function SearchIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function PlusIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function AssetIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "首页", match: "/" },
  { href: "/phase/1", icon: SearchIcon, label: "发现", match: "/phase/1" },
  { href: "/phase/4", icon: AssetIcon, label: "资产", match: "/phase/4" },
  { href: "/phase/3", icon: ListIcon, label: "需求", match: "/phase/3" },
];

export default function MiBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on homepage
  if (pathname === "/") return null;

  return (
    <nav className="mi-bottom-nav">
      {/* FAB button */}
      <button
        onClick={() => router.push("/phase/2")}
        className="relative -mt-5 w-[52px] h-[52px] rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center"
        aria-label="分析"
        style={{ boxShadow: "0 4px 15px rgba(77,166,255,0.45)" }}
      >
        <PlusIcon />
      </button>

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.match || pathname.startsWith(item.match + "/");
        return (
          <a key={item.href} href={item.href} className={`mi-nav-item ${isActive ? "active" : ""}`}>
            <item.icon active={isActive} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
