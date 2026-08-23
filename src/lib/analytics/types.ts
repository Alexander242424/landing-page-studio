export type AnalyticsEventName =
  | "page_view"
  | "page_heartbeat"
  | "page_leave"
  | "cta_click"
  | "chat_open"
  | "lead_submit"
  | "custom";

export type AnalyticsDevice = "mobile" | "tablet" | "desktop";

export type AnalyticsEventInput = {
  name: AnalyticsEventName | string;
  path: string;
  referrer?: string | null;
  sessionId: string;
  timestamp: string;
  userAgent?: string | null;
  /** Seconds spent on page (heartbeat / leave) */
  durationSec?: number | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  locale?: string | null;
  timezone?: string | null;
  device?: AnalyticsDevice | null;
  meta?: Record<string, unknown>;
};

export type AnalyticsEventRow = AnalyticsEventInput & {
  id: string;
  receivedAt: string;
  /** Resolved server-side from request IP / edge headers */
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
};
