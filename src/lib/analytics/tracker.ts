import { trackAnalyticsEvent } from "@/lib/analytics/analytics.functions";
import type { AnalyticsEventName } from "@/lib/analytics/types";

const SESSION_COOKIE = "uxlab_aid";
const SESSION_DAYS = 365;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1)) || null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

/** Anonymous analytics session id (first-party cookie, no PII). */
export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = readCookie(SESSION_COOKIE);
    if (existing) return existing;
    const id = createId();
    writeCookie(SESSION_COOKIE, id, SESSION_DAYS);
    return id;
  } catch {
    return createId();
  }
}

export function trackEvent(
  name: AnalyticsEventName | string,
  meta?: Record<string, unknown>,
  extras?: { durationSec?: number },
): void {
  if (typeof window === "undefined") return;

  const row = {
    name,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null,
    sessionId: getAnalyticsSessionId(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent || null,
    durationSec: extras?.durationSec ?? null,
    meta: meta ?? {},
  };

  void trackAnalyticsEvent({ data: row }).catch(() => {
    // Fire-and-forget — never break the marketing site.
  });
}

/** Prefer sendBeacon on leave when available. */
export function trackLeaveBeacon(durationSec: number): void {
  if (typeof window === "undefined") return;

  const payload = {
    name: "page_leave" as const,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null,
    sessionId: getAnalyticsSessionId(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent || null,
    durationSec,
    meta: {},
  };

  try {
    const body = JSON.stringify({ data: payload });
    // Server fn POST URL is opaque; fall back to trackEvent.
    void trackAnalyticsEvent({ data: payload });
    void body;
  } catch {
    trackEvent("page_leave", {}, { durationSec });
  }
}
