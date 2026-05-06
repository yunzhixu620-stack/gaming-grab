/**
 * API client — handles both dev (proxy) and production (direct) modes.
 *
 * Dev mode: Next.js rewrites /api/* → localhost:8000
 * Prod mode (GitHub Pages): fetches NEXT_PUBLIC_API_URL directly
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "";

/** Build full API URL */
export function apiUrl(path: string): string {
  // If API_BASE is set, use direct URL; otherwise use relative path (dev proxy)
  if (API_BASE) {
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path; // Relative → handled by Next.js rewrite in dev
}

/** Typed fetch wrapper */
export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as { detail?: string }).detail || `API error: ${res.status}`);
  }

  return res.json();
}
