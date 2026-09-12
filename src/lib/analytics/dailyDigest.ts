import { analyticsEventsPath, chatEventsPath } from "@/lib/admin/paths.server";
import { supabaseConfig } from "@/lib/analytics/ingest.server";
import { classifySource } from "@/lib/analytics/source";
import type { AnalyticsEventRow } from "@/lib/analytics/types";
import type { ChatEventRow } from "@/lib/chatPersistence.functions";
import { sendTelegramMessage } from "@/lib/telegram";

const WARSAW = "Europe/Warsaw";
const DIGEST_HOUR = 20;

type PageHit = {
  sessionId: string;
  path: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  country: string | null;
  countryCode: string | null;
  device: string | null;
  at: string;
};

type ChatHit = {
  sessionId: string;
  eventType: string;
  intent: string | null;
  at: string;
};

export type DailyDigestReport = {
  day: string;
  people: number;
  pageViews: number;
  uniquePages: number;
  pagesPerPerson: number;
  avgDurationSec: number;
  countries: Array<{ label: string; count: number }>;
  referrers: Array<{ label: string; count: number }>;
  devices: Array<{ label: string; count: number }>;
  pages: Array<{ path: string; views: number }>;
  chat: {
    opened: number;
    userMessages: number;
    aiReplies: number;
    leads: number;
    newsletter: number;
    intents: Array<{ label: string; count: number }>;
  };
};

function warsawParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: WARSAW,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function warsawDayKey(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: WARSAW });
}

function warsawMidnightUtc(now = new Date()): Date {
  const day = warsawDayKey(now);
  for (let hour = 0; hour < 36; hour += 1) {
    const probe = new Date(Date.parse(`${day}T00:00:00.000Z`) - hour * 3_600_000);
    const local = probe.toLocaleString("sv-SE", { timeZone: WARSAW });
    if (local.startsWith(`${day} 00:00`)) return probe;
  }
  return new Date(`${day}T00:00:00.000Z`);
}

export function isWarsawDigestHour(now = new Date()): boolean {
  const parts = warsawParts(now);
  return parts.hour === DIGEST_HOUR && parts.minute < 15;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function rank(map: Map<string, number>, limit = 6) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

async function readJsonl<T>(path: string, limit = 20_000): Promise<T[]> {
  if (typeof process === "undefined" || !process.versions?.node) return [];
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(path, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const slice = lines.length > limit ? lines.slice(-limit) : lines;
    const rows: T[] = [];
    for (const line of slice) {
      try {
        rows.push(JSON.parse(line) as T);
      } catch {
        // skip
      }
    }
    return rows;
  } catch {
    return [];
  }
}

async function supabaseGet<T>(path: string): Promise<T[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.warn(`[digest] supabase GET ${path} failed (${response.status}): ${body}`);
    return [];
  }
  return (await response.json()) as T[];
}

async function claimDigestDay(day: string): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return true;
  try {
    const response = await fetch(`${cfg.url}/rest/v1/analytics_digest_log`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=ignore-duplicates",
      },
      body: JSON.stringify({ day }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(`[digest] claim day failed (${response.status}): ${body}`);
      return true;
    }
    const rows = (await response.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  } catch (error) {
    console.warn("[digest] claim day error", error);
    return true;
  }
}

/** Undo claim when Telegram send fails so the next cron can retry. */
async function releaseDigestDay(day: string): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg) return;
  try {
    await fetch(
      `${cfg.url}/rest/v1/analytics_digest_log?day=eq.${encodeURIComponent(day)}`,
      {
        method: "DELETE",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
      },
    );
  } catch (error) {
    console.warn("[digest] release day error", error);
  }
}

async function loadPageHits(sinceIso: string): Promise<PageHit[]> {
  const hits: PageHit[] = [];
  const local = await readJsonl<AnalyticsEventRow>(analyticsEventsPath());
  for (const row of local) {
    const at = row.timestamp || row.receivedAt;
    if (!at || at < sinceIso) continue;
    if (row.name !== "page_view") continue;
    hits.push({
      sessionId: row.sessionId,
      path: row.path.split("?")[0] || "/",
      referrer: row.referrer ?? null,
      utmSource: row.utmSource ?? null,
      utmMedium: row.utmMedium ?? null,
      country: row.country && row.country !== "Local" ? row.country : null,
      countryCode: row.countryCode ?? null,
      device: row.device ?? null,
      at,
    });
  }

  type RemoteRow = {
    created_at: string;
    path: string;
    event: string;
    session_id: string;
    referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    country: string | null;
    country_code: string | null;
    device: string | null;
  };
  const remote = await supabaseGet<RemoteRow>(
    `analytics_events?select=created_at,path,event,session_id,referrer,utm_source,utm_medium,country,country_code,device&event=eq.view&created_at=gte.${encodeURIComponent(sinceIso)}&order=created_at.asc&limit=8000`,
  );
  const seen = new Set(hits.map((h) => `${h.sessionId}|${h.path}|${h.at}`));
  for (const row of remote) {
    const key = `${row.session_id}|${row.path}|${row.created_at}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({
      sessionId: row.session_id,
      path: (row.path || "/").split("?")[0] || "/",
      referrer: row.referrer,
      utmSource: row.utm_source,
      utmMedium: row.utm_medium,
      country: row.country,
      countryCode: row.country_code,
      device: row.device,
      at: row.created_at,
    });
  }
  return hits;
}

async function loadSessionDurations(sinceIso: string): Promise<Map<string, number>> {
  const maxBySession = new Map<string, number>();

  const remember = (sessionId: string, seconds: number) => {
    if (!sessionId || !Number.isFinite(seconds) || seconds <= 0) return;
    const prev = maxBySession.get(sessionId) ?? 0;
    if (seconds > prev) maxBySession.set(sessionId, seconds);
  };

  const local = await readJsonl<AnalyticsEventRow>(analyticsEventsPath());
  for (const row of local) {
    const at = row.timestamp || row.receivedAt;
    if (!at || at < sinceIso) continue;
    if (row.name !== "page_leave" && row.name !== "page_heartbeat") continue;
    if (typeof row.durationSec === "number") remember(row.sessionId, row.durationSec);
  }

  type RemoteRow = { session_id: string; duration_ms: number | null };
  const remote = await supabaseGet<RemoteRow>(
    `analytics_events?select=session_id,duration_ms&event=in.(heartbeat,hide)&duration_ms=not.is.null&created_at=gte.${encodeURIComponent(sinceIso)}&limit=8000`,
  );
  for (const row of remote) {
    if (typeof row.duration_ms === "number") {
      remember(row.session_id, Math.round(row.duration_ms / 1000));
    }
  }
  return maxBySession;
}

async function loadChatHits(sinceIso: string): Promise<ChatHit[]> {
  const hits: ChatHit[] = [];
  const local = await readJsonl<ChatEventRow>(chatEventsPath());
  for (const row of local) {
    if (!row.created_at || row.created_at < sinceIso) continue;
    hits.push({
      sessionId: row.session_id,
      eventType: row.event_type,
      intent: row.intent ?? null,
      at: row.created_at,
    });
  }

  type RemoteRow = {
    created_at: string;
    session_id: string;
    event_type: string;
    intent: string | null;
  };
  const remote = await supabaseGet<RemoteRow>(
    `chat_events?select=created_at,session_id,event_type,intent&created_at=gte.${encodeURIComponent(sinceIso)}&order=created_at.asc&limit=8000`,
  );
  const seen = new Set(hits.map((h) => `${h.sessionId}|${h.eventType}|${h.at}`));
  for (const row of remote) {
    const key = `${row.session_id}|${row.event_type}|${row.created_at}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({
      sessionId: row.session_id,
      eventType: row.event_type,
      intent: row.intent,
      at: row.created_at,
    });
  }
  return hits;
}

function firstHitBySession(pages: PageHit[]): Map<string, PageHit> {
  const first = new Map<string, PageHit>();
  const sorted = [...pages].sort((a, b) => a.at.localeCompare(b.at));
  for (const hit of sorted) {
    if (!first.has(hit.sessionId)) first.set(hit.sessionId, hit);
  }
  return first;
}

function countryLabel(hit: PageHit): string {
  const country = hit.country?.trim();
  if (!country || country === "Local" || country === "Unknown") return "Unknown";
  const flag = flagEmoji(hit.countryCode);
  return flag ? `${flag} ${country}` : country;
}

function flagEmoji(code?: string | null): string {
  const value = code?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(value) || value === "XX") return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    ...[...value].map((char) => A + char.charCodeAt(0) - 65),
  );
}

export async function buildDailyDigest(now = new Date()): Promise<DailyDigestReport> {
  const since = warsawMidnightUtc(now).toISOString();
  const [pages, chats, durations] = await Promise.all([
    loadPageHits(since),
    loadChatHits(since),
    loadSessionDurations(since),
  ]);

  const people = new Set<string>();
  const countries = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  const pathViews = new Map<string, number>();
  const countrySessions = new Map<string, Set<string>>();
  const referrerSessions = new Map<string, Set<string>>();
  const deviceSessions = new Map<string, Set<string>>();

  for (const hit of pages) {
    people.add(hit.sessionId);
    pathViews.set(hit.path, (pathViews.get(hit.path) ?? 0) + 1);
  }

  for (const hit of firstHitBySession(pages).values()) {
    const country = countryLabel(hit);
    let countrySet = countrySessions.get(country);
    if (!countrySet) {
      countrySet = new Set();
      countrySessions.set(country, countrySet);
    }
    countrySet.add(hit.sessionId);

    const source = classifySource({
      utmSource: hit.utmSource,
      utmMedium: hit.utmMedium,
      referrer: hit.referrer,
    });
    let refSet = referrerSessions.get(source);
    if (!refSet) {
      refSet = new Set();
      referrerSessions.set(source, refSet);
    }
    refSet.add(hit.sessionId);

    const device = hit.device?.trim() || "unknown";
    let deviceSet = deviceSessions.get(device);
    if (!deviceSet) {
      deviceSet = new Set();
      deviceSessions.set(device, deviceSet);
    }
    deviceSet.add(hit.sessionId);
  }

  for (const [label, set] of countrySessions) countries.set(label, set.size);
  for (const [label, set] of referrerSessions) referrers.set(label, set.size);
  for (const [label, set] of deviceSessions) devices.set(label, set.size);

  const durationValues = [...durations.values()];
  const avgDurationSec =
    durationValues.length > 0
      ? Math.round(
          durationValues.reduce((sum, n) => sum + n, 0) / durationValues.length,
        )
      : 0;

  const opened = new Set<string>();
  const intents = new Map<string, number>();
  let userMessages = 0;
  let aiReplies = 0;
  let leads = 0;
  let newsletter = 0;

  for (const hit of chats) {
    if (hit.eventType === "intent_open" || hit.eventType === "chat_open") {
      opened.add(hit.sessionId);
      const intent = hit.intent?.trim() || "general";
      intents.set(intent, (intents.get(intent) ?? 0) + 1);
    }
    if (hit.eventType === "user_message") userMessages += 1;
    if (hit.eventType === "assistant_message") aiReplies += 1;
    if (hit.eventType === "lead_complete") leads += 1;
    if (hit.eventType === "newsletter_complete") newsletter += 1;
  }

  const visitorCount = people.size;
  return {
    day: warsawDayKey(now),
    people: visitorCount,
    pageViews: pages.length,
    uniquePages: pathViews.size,
    pagesPerPerson: visitorCount > 0 ? pages.length / visitorCount : 0,
    avgDurationSec,
    countries: rank(countries),
    referrers: rank(referrers),
    devices: rank(devices, 4),
    pages: [...pathViews.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([path, views]) => ({ path, views })),
    chat: {
      opened: opened.size,
      userMessages,
      aiReplies,
      leads,
      newsletter,
      intents: rank(intents, 8).map(({ label, count }) => ({ label, count })),
    },
  };
}

function listLines(rows: Array<{ label: string; count: number }>, empty: string) {
  if (!rows.length) return empty;
  return rows.map((row) => `• ${escapeHtml(row.label)} — ${row.count}`).join("\n");
}

function formatDuration(sec: number): string {
  if (sec <= 0) return "—";
  if (sec < 60) return `${sec}s`;
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function deviceLine(devices: Array<{ label: string; count: number }>): string | null {
  const labels: Record<string, string> = {
    mobile: "mobile",
    tablet: "tablet",
    desktop: "desktop",
  };
  const parts = devices
    .filter((row) => row.label !== "unknown")
    .map((row) => `${row.count} ${labels[row.label] ?? row.label}`);
  return parts.length ? parts.join(" · ") : null;
}

function chatBlock(report: DailyDigestReport): string[] {
  const { chat, people } = report;
  const hasActivity =
    chat.opened + chat.userMessages + chat.leads + chat.newsletter > 0;
  if (!hasActivity) {
    return ["<b>AI chat</b>", "No chats today"];
  }
  const leadRate =
    people > 0 && chat.leads > 0
      ? ` (${Math.round((chat.leads / people) * 100)}% of visitors)`
      : "";
  const intentLine = chat.intents.length
    ? chat.intents.map((row) => `${escapeHtml(row.label)} ${row.count}`).join(" · ")
    : null;
  const lines = [
    "<b>AI chat</b>",
    `• ${chat.opened} opened · ${chat.userMessages} messages · ${chat.aiReplies} replies`,
    `• ${chat.leads} lead${chat.leads === 1 ? "" : "s"}${leadRate}`,
  ];
  if (chat.newsletter > 0) lines.push(`• ${chat.newsletter} newsletter`);
  if (intentLine) lines.push(`• Intents: ${intentLine}`);
  return lines;
}

export function formatDailyDigest(report: DailyDigestReport): string {
  const dateLabel = new Date(`${report.day}T12:00:00.000Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
  const pagesEach =
    report.people > 0 ? report.pagesPerPerson.toFixed(1) : "0";
  const devices = deviceLine(report.devices);
  const pageLines = report.pages.length
    ? report.pages
        .map((row) => `• ${escapeHtml(row.path)} — ${row.views}`)
        .join("\n")
    : "• none yet";

  return [
    `<b>📊 UXLAB — ${escapeHtml(dateLabel)}</b>`,
    `00:00–${DIGEST_HOUR}:00 Warsaw`,
    "",
    "<b>Traffic</b>",
    `${report.people} visitors · ${report.pageViews} page views`,
    `${pagesEach} pages / visitor · avg time ${formatDuration(report.avgDurationSec)}`,
    devices,
    "",
    "<b>Countries</b>",
    listLines(report.countries, "• none yet"),
    "",
    "<b>Sources</b>",
    listLines(report.referrers, "• Direct"),
    "",
    "<b>Pages</b>",
    pageLines,
    "",
    ...chatBlock(report),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function runDailyAnalyticsDigest(options?: {
  source?: "cron" | "http";
  force?: boolean;
  now?: Date;
}): Promise<{ ok: boolean; sent: boolean; reason?: string; day?: string }> {
  const now = options?.now ?? new Date();
  const source = options?.source ?? "http";
  const day = warsawDayKey(now);

  if (!options?.force && source === "cron" && !isWarsawDigestHour(now)) {
    return { ok: true, sent: false, reason: "not_digest_hour", day };
  }

  if (!options?.force) {
    const claimed = await claimDigestDay(day);
    if (!claimed) {
      return { ok: true, sent: false, reason: "already_sent", day };
    }
  }

  const report = await buildDailyDigest(now);
  const sent = await sendTelegramMessage(formatDailyDigest(report));
  if (!sent) {
    if (!options?.force) {
      await releaseDigestDay(day);
    }
    return { ok: false, sent: false, reason: "telegram_failed", day };
  }
  console.info(`[digest] sent daily analytics for ${day}`);
  return { ok: true, sent: true, day };
}
