export type AnalyticsEventName =
  | "page_view"
  | "page_heartbeat"
  | "page_leave"
  | "cta_click"
  | "chat_open"
  | "lead_submit"
  | "custom";

export type AnalyticsEventInput = {
  name: AnalyticsEventName | string;
  path: string;
  referrer?: string | null;
  sessionId: string;
  timestamp: string;
  userAgent?: string | null;
  /** Seconds spent on page (heartbeat / leave) */
  durationSec?: number | null;
  meta?: Record<string, unknown>;
};

export type AnalyticsEventRow = AnalyticsEventInput & {
  id: string;
  receivedAt: string;
};
