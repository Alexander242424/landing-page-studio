import { getAnalyticsSessionId } from "@/lib/analytics/tracker";

export type ArticleAnalyticsEvent = "view" | "heartbeat" | "scroll" | "hide";

export type ArticleTrackPayload = {
  path: string;
  articleSlug: string;
  event: ArticleAnalyticsEvent;
  sessionId: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  device: "mobile" | "tablet" | "desktop";
  viewportW: number;
  scrollPct: number;
  durationMs: number | null;
};

function utmParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(name);
  return value?.trim() || null;
}

export function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function measureScrollPct(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return 100;
  const pct = Math.round((el.scrollTop / scrollable) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function buildArticleTrackPayload(
  slug: string,
  event: ArticleAnalyticsEvent,
  extras: { scrollPct: number; durationMs?: number | null },
): ArticleTrackPayload {
  return {
    path: `${window.location.pathname}${window.location.search}`,
    articleSlug: slug,
    event,
    sessionId: getAnalyticsSessionId(),
    referrer: document.referrer || null,
    utmSource: utmParam("utm_source"),
    utmMedium: utmParam("utm_medium"),
    utmCampaign: utmParam("utm_campaign"),
    device: detectDevice(),
    viewportW: window.innerWidth,
    scrollPct: extras.scrollPct,
    durationMs: extras.durationMs ?? null,
  };
}

/** Fire-and-forget. Uses sendBeacon on hide; fetch otherwise. Never throws. */
export function sendArticleAnalytics(payload: ArticleTrackPayload): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(payload);

  if (payload.event === "hide" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics", blob)) return;
    } catch {
      // Fall through to fetch.
    }
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Never break the article page.
  });
}
