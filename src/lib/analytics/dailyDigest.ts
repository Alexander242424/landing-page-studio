import { analyticsEventsPath, chatEventsPath } from "@/lib/admin/paths.server";
import { supabaseConfig } from "@/lib/analytics/ingest.server";
import type { AnalyticsEventRow } from "@/lib/analytics/types";
import type { ChatEventRow } from "@/lib/chatPersistence.functions";
import { sendTelegramMessage } from "@/lib/telegram";

const WARSAW = "Europe/Warsaw";
const DIGEST_HOUR = 20;
const SITE_HOSTS = new Set(["uxlab.digital", "www.uxlab.digital", "localhost"]);

type PageHit = {
  sessionId: string;
  path: string;
  referrer: string | null;
  country: string | null;
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
  countries: Array<{ label: string; count: number }>;
  referrers: Array<{ label: string; count: number }>;
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

function hostFromReferrer(raw: string | null | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) return "Direct";
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (SITE_HOSTS.has(host) || host.endsWith(".localhost")) return "Direct";
    return host || "Direct";
  } catch {
    return "Direct";
  }
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
      referrer: row.referrer,
      country: row.country && row.country !== "Local" ? row.country : null,
      at,
    });
  }

  type RemoteRow = {
    created_at: string;
    path: string;
    event: string;
    session_id: string;
    referrer: string | null;
    country: string | null;
  };
  const remote = await supabaseGet<RemoteRow>(
    `analytics_events?select=created_at,path,event,session_id,referrer,country&event=eq.view&created_at=gte.${encodeURIComponent(sinceIso)}&order=created_at.asc&limit=8000`,
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
      country: row.country,
      at: row.created_at,
    });
  }
  return hits;
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

export async function buildDailyDigest(now = new Date()): Promise<DailyDigestReport> {
  const since = warsawMidnightUtc(now).toISOString();
  const [pages, chats] = await Promise.all([
    loadPageHits(since),
    loadChatHits(since),
  ]);

  const people = new Set<string>();
  const countries = new Map<string, number>();
  const referrers = new Map<string, number>();
  const pathViews = new Map<string, number>();
  const countrySessions = new Map<string, Set<string>>();
  const referrerSessions = new Map<string, Set<string>>();

  for (const hit of pages) {
    people.add(hit.sessionId);
    pathViews.set(hit.path, (pathViews.get(hit.path) ?? 0) + 1);
    const country = hit.country?.trim() || "Unknown";
    let countrySet = countrySessions.get(country);
    if (!countrySet) {
      countrySet = new Set();
      countrySessions.set(country, countrySet);
    }
    countrySet.add(hit.sessionId);
    const ref = hostFromReferrer(hit.referrer);
    let refSet = referrerSessions.get(ref);
    if (!refSet) {
      refSet = new Set();
      referrerSessions.set(ref, refSet);
    }
    refSet.add(hit.sessionId);
  }

  for (const [label, set] of countrySessions) countries.set(label, set.size);
  for (const [label, set] of referrerSessions) referrers.set(label, set.size);

  const opened = new Set<string>();
  const intents = new Map<string, number>();
  let userMessages = 0;
  let aiReplies = 0;
  let leads = 0;
  let newsletter = 0;

  for (const hit of chats) {
    people.add(hit.sessionId);
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

  return {
    day: warsawDayKey(now),
    people: people.size,
    pageViews: pages.length,
    uniquePages: pathViews.size,
    countries: rank(countries),
    referrers: rank(referrers),
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

export function formatDailyDigest(report: DailyDigestReport): string {
  const dateLabel = new Date(`${report.day}T12:00:00.000Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
  const pageLines = report.pages.length
    ? report.pages
        .map((row) => `• ${escapeHtml(row.path)} — ${row.views}`)
        .join("\n")
    : "• none yet";
  const intentLine = report.chat.intents.length
    ? report.chat.intents
        .map((row) => `${escapeHtml(row.label)} ${row.count}`)
        .join(" · ")
    : "none";

  return [
    `<b>📊 Daily analytics — ${escapeHtml(dateLabel)}</b>`,
    `midnight–${DIGEST_HOUR}:00 Warsaw`,
    "",
    `<b>People:</b> ${report.people}`,
    `<b>Page views:</b> ${report.pageViews}`,
    `<b>Pages opened:</b> ${report.uniquePages}`,
    "",
    "<b>Where</b>",
    listLines(report.countries, "• unknown"),
    "",
    "<b>Referrers</b>",
    listLines(report.referrers, "• Direct"),
    "",
    "<b>Pages</b>",
    pageLines,
    "",
    "<b>AI chat</b>",
    `• Chats opened: ${report.chat.opened}`,
    `• User messages: ${report.chat.userMessages}`,
    `• AI replies: ${report.chat.aiReplies}`,
    `• Leads: ${report.chat.leads}`,
    `• Newsletter: ${report.chat.newsletter}`,
    `• Intents: ${intentLine}`,
  ].join("\n");
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
    return { ok: false, sent: false, reason: "telegram_failed", day };
  }
  console.info(`[digest] sent daily analytics for ${day}`);
  return { ok: true, sent: true, day };
}
