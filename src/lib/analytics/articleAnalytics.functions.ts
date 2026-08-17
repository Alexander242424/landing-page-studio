import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session.server";
import {
  restHeaders,
  supabaseConfig,
} from "@/lib/articleCatalog.functions";

export type ArticleAnalyticsRange = 7 | 30 | 90;

export type ArticleKpis = {
  views: number;
  uniqueSessions: number;
  avgDurationSec: number;
  avgScrollPct: number;
};

export type ArticleRankRow = {
  slug: string;
  title: string;
  views: number;
  uniqueSessions: number;
};

export type ArticleDayPoint = {
  date: string;
  label: string;
  views: number;
  uniqueSessions: number;
};

export type ReferrerRow = {
  key: string;
  sessions: number;
};

export type DeviceSplit = {
  device: string;
  sessions: number;
};

export type RecentReadSession = {
  sessionId: string;
  articleSlug: string;
  device: string | null;
  referrer: string | null;
  country: string | null;
  durationMs: number | null;
  scrollPct: number | null;
  at: string;
};

export type ChatFollowRow = {
  slug: string;
  summarize: number;
  letsTalk: number;
};

export type ArticleAnalyticsDashboard = {
  rangeDays: ArticleAnalyticsRange;
  source: "supabase" | "empty";
  kpis: ArticleKpis;
  topArticles: ArticleRankRow[];
  series: ArticleDayPoint[];
  referrers: ReferrerRow[];
  utmSources: ReferrerRow[];
  devices: DeviceSplit[];
  recent: RecentReadSession[];
  chatFollow: ChatFollowRow[];
};

type EventRow = {
  created_at: string;
  path: string;
  article_slug: string | null;
  event: string;
  session_id: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device: string | null;
  scroll_pct: number | null;
  duration_ms: number | null;
  country: string | null;
};

type DailyRow = {
  day: string;
  article_slug: string | null;
  views: number | string | null;
  unique_sessions: number | string | null;
  avg_duration_ms: number | string | null;
  avg_scroll_pct: number | string | null;
};

type TotalRow = {
  article_slug: string | null;
  views: number | string | null;
};

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function dayLabel(key: string): string {
  const d = new Date(`${key}T12:00:00.000Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function hostFromReferrer(referrer: string | null): string {
  if (!referrer) return "(direct)";
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "") || "(direct)";
  } catch {
    return referrer.slice(0, 48) || "(direct)";
  }
}

async function restGet<T>(path: string): Promise<T[] | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  try {
    const response = await fetch(`${cfg.url}${path}`, {
      method: "GET",
      headers: restHeaders(cfg),
    });
    if (!response.ok) return null;
    const json: unknown = await response.json();
    return Array.isArray(json) ? (json as T[]) : null;
  } catch {
    return null;
  }
}

function utcDayKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
    );
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function emptyDashboard(
  rangeDays: ArticleAnalyticsRange,
): ArticleAnalyticsDashboard {
  return {
    rangeDays,
    source: "empty",
    kpis: { views: 0, uniqueSessions: 0, avgDurationSec: 0, avgScrollPct: 0 },
    topArticles: [],
    series: utcDayKeys(rangeDays).map((date) => ({
      date,
      label: dayLabel(date),
      views: 0,
      uniqueSessions: 0,
    })),
    referrers: [],
    utmSources: [],
    devices: [],
    recent: [],
    chatFollow: [],
  };
}

export const getArticleViewCounts = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    const rows = await restGet<TotalRow>(
      "/rest/v1/article_analytics_totals?select=article_slug,views",
    );
    const viewsBySlug: Record<string, number> = {};
    if (!rows) return { viewsBySlug, source: "empty" as const };
    for (const row of rows) {
      if (!row.article_slug) continue;
      viewsBySlug[row.article_slug] = num(row.views);
    }
    return { viewsBySlug, source: "supabase" as const };
  },
);

const RangeInput = z.object({
  days: z.union([z.literal(7), z.literal(30), z.literal(90)]),
});

export const getArticleAnalyticsDashboard = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => RangeInput.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const since = new Date(
      Date.now() - data.days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [daily, events, chat] = await Promise.all([
      restGet<DailyRow>(
        `/rest/v1/article_analytics_daily?select=*&day=gte.${since.slice(0, 10)}&order=day.asc`,
      ),
      restGet<EventRow>(
        `/rest/v1/analytics_events?select=created_at,path,article_slug,event,session_id,referrer,utm_source,utm_medium,utm_campaign,device,scroll_pct,duration_ms,country&created_at=gte.${encodeURIComponent(since)}&article_slug=not.is.null&order=created_at.desc&limit=4000`,
      ),
      restGet<{
        event_type: string;
        metadata: Record<string, unknown> | null;
        created_at: string;
      }>(
        `/rest/v1/chat_events?select=event_type,metadata,created_at&created_at=gte.${encodeURIComponent(since)}&event_type=eq.chip_click&order=created_at.desc&limit=500`,
      ),
    ]);

    if (!events && !daily) {
      return emptyDashboard(data.days);
    }

    const rows = events ?? [];
    const viewRows = rows.filter((row) => row.event === "view");
    const durationRows = rows.filter(
      (row) =>
        (row.event === "heartbeat" || row.event === "hide") &&
        typeof row.duration_ms === "number",
    );
    const scrollBySession = new Map<string, number>();
    for (const row of rows) {
      if (row.scroll_pct == null || !row.article_slug) continue;
      const key = `${row.session_id}:${row.article_slug}`;
      const prev = scrollBySession.get(key) ?? 0;
      if (row.scroll_pct > prev) scrollBySession.set(key, row.scroll_pct);
    }

    const uniqueSessions = new Set(
      viewRows.map((row) => row.session_id),
    ).size;
    const avgDurationMs =
      durationRows.length > 0
        ? durationRows.reduce((sum, row) => sum + (row.duration_ms ?? 0), 0) /
          durationRows.length
        : 0;
    const scrollValues = [...scrollBySession.values()];
    const avgScrollPct =
      scrollValues.length > 0
        ? scrollValues.reduce((sum, n) => sum + n, 0) / scrollValues.length
        : 0;

    const bySlug = new Map<
      string,
      { views: number; sessions: Set<string> }
    >();
    for (const row of viewRows) {
      const slug = row.article_slug;
      if (!slug) continue;
      let entry = bySlug.get(slug);
      if (!entry) {
        entry = { views: 0, sessions: new Set() };
        bySlug.set(slug, entry);
      }
      entry.views += 1;
      entry.sessions.add(row.session_id);
    }

    const topArticles: ArticleRankRow[] = [...bySlug.entries()]
      .map(([slug, entry]) => ({
        slug,
        title: slug,
        views: entry.views,
        uniqueSessions: entry.sessions.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 12);

    const dayKeys = utcDayKeys(data.days);
    const viewsByDay = new Map<string, { views: number; sessions: Set<string> }>();
    for (const key of dayKeys) {
      viewsByDay.set(key, { views: 0, sessions: new Set() });
    }
    for (const row of viewRows) {
      const key = row.created_at.slice(0, 10);
      const bucket = viewsByDay.get(key);
      if (!bucket) continue;
      bucket.views += 1;
      bucket.sessions.add(row.session_id);
    }

    if (daily?.length) {
      for (const row of daily) {
        const key = String(row.day).slice(0, 10);
        const bucket = viewsByDay.get(key);
        if (!bucket) continue;
        bucket.views = Math.max(bucket.views, num(row.views));
      }
    }

    const series: ArticleDayPoint[] = dayKeys.map((date) => {
      const bucket = viewsByDay.get(date)!;
      return {
        date,
        label: dayLabel(date),
        views: bucket.views,
        uniqueSessions: bucket.sessions.size,
      };
    });

    function rankSessions(
      keyFn: (row: EventRow) => string | null,
    ): ReferrerRow[] {
      const map = new Map<string, Set<string>>();
      for (const row of viewRows) {
        const key = keyFn(row);
        if (!key) continue;
        let set = map.get(key);
        if (!set) {
          set = new Set();
          map.set(key, set);
        }
        set.add(row.session_id);
      }
      return [...map.entries()]
        .map(([key, sessions]) => ({ key, sessions: sessions.size }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);
    }

    const referrers = rankSessions((row) => hostFromReferrer(row.referrer));
    const utmSources = rankSessions((row) => row.utm_source);
    const devices: DeviceSplit[] = rankSessions((row) => row.device).map(
      (row) => ({ device: row.key, sessions: row.sessions }),
    );

    const latestBySession = new Map<string, EventRow>();
    for (const row of rows) {
      if (!row.article_slug) continue;
      const key = `${row.session_id}:${row.article_slug}`;
      const prev = latestBySession.get(key);
      if (!prev || row.created_at > prev.created_at) {
        latestBySession.set(key, row);
      }
    }
    const hideBySession = new Map<string, EventRow>();
    for (const row of rows) {
      if (row.event !== "hide" || !row.article_slug) continue;
      const key = `${row.session_id}:${row.article_slug}`;
      const prev = hideBySession.get(key);
      if (!prev || (row.duration_ms ?? 0) > (prev.duration_ms ?? 0)) {
        hideBySession.set(key, row);
      }
    }

    const recent: RecentReadSession[] = [...latestBySession.values()]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 40)
      .map((row) => {
        const key = `${row.session_id}:${row.article_slug}`;
        const hide = hideBySession.get(key);
        return {
          sessionId: row.session_id.slice(0, 8),
          articleSlug: row.article_slug ?? "",
          device: row.device,
          referrer: hostFromReferrer(row.referrer),
          country: row.country,
          durationMs: hide?.duration_ms ?? row.duration_ms,
          scrollPct:
            scrollBySession.get(key) ?? hide?.scroll_pct ?? row.scroll_pct,
          at: row.created_at,
        };
      });

    const chatFollowMap = new Map<
      string,
      { summarize: number; letsTalk: number }
    >();
    for (const row of chat ?? []) {
      const meta = row.metadata ?? {};
      const path = typeof meta["path"] === "string" ? meta["path"] : "";
      const match = path.match(/^\/resources\/([^/?#]+)/);
      const slug = match?.[1];
      if (!slug) continue;
      const tip = typeof meta["tip"] === "string" ? meta["tip"] : "";
      let entry = chatFollowMap.get(slug);
      if (!entry) {
        entry = { summarize: 0, letsTalk: 0 };
        chatFollowMap.set(slug, entry);
      }
      if (/summarize/i.test(tip)) entry.summarize += 1;
      if (/let'?s talk/i.test(tip)) entry.letsTalk += 1;
    }
    const chatFollow: ChatFollowRow[] = [...chatFollowMap.entries()]
      .map(([slug, counts]) => ({ slug, ...counts }))
      .filter((row) => row.summarize > 0 || row.letsTalk > 0)
      .sort((a, b) => b.summarize + b.letsTalk - (a.summarize + a.letsTalk))
      .slice(0, 8);

    return {
      rangeDays: data.days,
      source: "supabase" as const,
      kpis: {
        views: viewRows.length,
        uniqueSessions,
        avgDurationSec: Math.round(avgDurationMs / 1000),
        avgScrollPct: Math.round(avgScrollPct),
      },
      topArticles,
      series,
      referrers,
      utmSources,
      devices,
      recent,
      chatFollow,
    } satisfies ArticleAnalyticsDashboard;
  });
