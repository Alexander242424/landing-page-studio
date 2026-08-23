import {
  detectDevice,
  getAnalyticsSessionId,
  getFirstTouch,
} from "@/lib/analytics/tracker";

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
  locale: string | null;
  timezone: string | null;
  device: "mobile" | "tablet" | "desktop";
  viewportW: number;
  scrollPct: number;
  durationMs: number | null;
};

export { detectDevice } from "@/lib/analytics/tracker";

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
  const touch = getFirstTouch();
  return {
    path: `${window.location.pathname}${window.location.search}`,
    articleSlug: slug,
    event,
    sessionId: getAnalyticsSessionId(),
    referrer: touch.referrer || document.referrer || null,
    utmSource: touch.source,
    utmMedium: touch.medium,
    utmCampaign: touch.campaign,
    locale: navigator.language || navigator.languages?.[0] || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
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
