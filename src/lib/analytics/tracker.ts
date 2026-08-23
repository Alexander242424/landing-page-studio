import { trackAnalyticsEvent } from "@/lib/analytics/analytics.functions";
import type {
  AnalyticsDevice,
  AnalyticsEventName,
  AnalyticsEventInput,
} from "@/lib/analytics/types";

const SESSION_COOKIE = "uxlab_aid";
const SESSION_DAYS = 365;
const ATTR_COOKIE = "uxlab_src";
const ATTR_DAYS = 90;

export type FirstTouch = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
};

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

export function detectDevice(): AnalyticsDevice {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function utmParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(name);
  return value?.trim() || null;
}

function readFirstTouch(): FirstTouch | null {
  const raw = readCookie(ATTR_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FirstTouch;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      source: parsed.source ?? null,
      medium: parsed.medium ?? null,
      campaign: parsed.campaign ?? null,
      referrer: parsed.referrer ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * First-touch source: landing UTM + referrer, kept for 90 days so later
 * page views still report where the person originally came from.
 * A later UTM click overwrites (campaign wins).
 */
export function getFirstTouch(): FirstTouch {
  if (typeof window === "undefined") {
    return { source: null, medium: null, campaign: null, referrer: null };
  }

  const incoming: FirstTouch = {
    source: utmParam("utm_source"),
    medium: utmParam("utm_medium"),
    campaign: utmParam("utm_campaign"),
    referrer: document.referrer || null,
  };
  const existing = readFirstTouch();

  if (incoming.source) {
    writeCookie(ATTR_COOKIE, JSON.stringify(incoming), ATTR_DAYS);
    return incoming;
  }

  if (existing && (existing.source || existing.referrer)) {
    return existing;
  }

  writeCookie(ATTR_COOKIE, JSON.stringify(incoming), ATTR_DAYS);
  return incoming;
}

function clientLocale(): string | null {
  if (typeof navigator === "undefined") return null;
  return navigator.language || navigator.languages?.[0] || null;
}

function clientTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function buildTrackPayload(
  name: AnalyticsEventName | string,
  extras?: { durationSec?: number; meta?: Record<string, unknown> },
): AnalyticsEventInput {
  const touch = getFirstTouch();
  return {
    name,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: touch.referrer || document.referrer || null,
    sessionId: getAnalyticsSessionId(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent || null,
    durationSec: extras?.durationSec ?? null,
    utmSource: touch.source,
    utmMedium: touch.medium,
    utmCampaign: touch.campaign,
    locale: clientLocale(),
    timezone: clientTimezone(),
    device: detectDevice(),
    meta: extras?.meta ?? {},
  };
}

export function trackEvent(
  name: AnalyticsEventName | string,
  meta?: Record<string, unknown>,
  extras?: { durationSec?: number },
): void {
  if (typeof window === "undefined") return;

  const row = buildTrackPayload(name, {
    durationSec: extras?.durationSec,
    meta,
  });

  void trackAnalyticsEvent({ data: row }).catch(() => {
    // Fire-and-forget — never break the marketing site.
  });
}

/** Prefer sendBeacon on leave when available. */
export function trackLeaveBeacon(durationSec: number): void {
  if (typeof window === "undefined") return;

  const payload = buildTrackPayload("page_leave", { durationSec });

  try {
    void trackAnalyticsEvent({ data: payload });
  } catch {
    trackEvent("page_leave", {}, { durationSec });
  }
}
