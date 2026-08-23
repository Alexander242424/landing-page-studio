import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session.server";
import {
  analyticsDir,
  analyticsEventsPath,
} from "@/lib/admin/paths.server";
import type { AnalyticsEventRow } from "@/lib/analytics/types";

const TrackInput = z.object({
  name: z.string().min(1).max(64),
  path: z.string().min(1).max(2048),
  referrer: z.string().max(2048).nullable().optional(),
  sessionId: z.string().min(1).max(128),
  timestamp: z.string().min(1).max(64),
  userAgent: z.string().max(512).nullable().optional(),
  durationSec: z.number().nonnegative().nullable().optional(),
  meta: z.record(z.unknown()).optional(),
});

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function appendAnalytics(row: AnalyticsEventRow): Promise<boolean> {
  if (typeof process === "undefined" || !process.versions?.node) return false;
  try {
    const { mkdir, appendFile } = await import("node:fs/promises");
    await mkdir(analyticsDir(), { recursive: true });
    await appendFile(
      analyticsEventsPath(),
      `${JSON.stringify(row)}\n`,
      "utf8",
    );
    return true;
  } catch (error) {
    console.warn("[analytics] append failed", error);
    return false;
  }
}

async function readAnalyticsLines(limit = 5000): Promise<AnalyticsEventRow[]> {
  if (typeof process === "undefined" || !process.versions?.node) return [];
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(analyticsEventsPath(), "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const slice = lines.length > limit ? lines.slice(-limit) : lines;
    const rows: AnalyticsEventRow[] = [];
    for (const line of slice) {
      try {
        rows.push(JSON.parse(line) as AnalyticsEventRow);
      } catch {
        // skip bad line
      }
    }
    return rows;
  } catch {
    return [];
  }
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function rankBySessions(
  rows: AnalyticsEventRow[],
  keyFn: (r: AnalyticsEventRow) => string | null,
): Array<{ key: string; sessions: number }> {
  const sessionsByKey = new Map<string, Set<string>>();
  for (const r of rows) {
    const key = keyFn(r);
    if (!key) continue;
    let set = sessionsByKey.get(key);
    if (!set) {
      set = new Set();
      sessionsByKey.set(key, set);
    }
    set.add(r.sessionId);
  }
  return [...sessionsByKey.entries()]
    .map(([key, sessions]) => ({ key, sessions: sessions.size }))
    .sort((a, b) => b.sessions - a.sessions);
}

function formatGeoLabel(geo: {
  city?: string | null;
  country?: string | null;
}): string {
  const city = geo.city?.trim() || null;
  const country = geo.country?.trim() || null;
  if (city && country && city !== country) return `${city}, ${country}`;
  return city || country || "—";
}

export const trackAnalyticsEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TrackInput.parse(input))
  .handler(async ({ data }) => {
    let geo = {
      country: null as string | null,
      countryCode: null as string | null,
      city: null as string | null,
    };
    try {
      const { getRequestHeaders } = await import(
        "@tanstack/react-start/server"
      );
      const { resolveRequestGeo } = await import(
        "@/lib/analytics/geo.server"
      );
      geo = await resolveRequestGeo(getRequestHeaders());
    } catch (error) {
      console.warn("[analytics] geo resolve failed", error);
    }

    const row: AnalyticsEventRow = {
      id: createId(),
      receivedAt: new Date().toISOString(),
      name: data.name,
      path: data.path,
      referrer: data.referrer ?? null,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      userAgent: data.userAgent ?? null,
      durationSec: data.durationSec ?? null,
      meta: data.meta ?? {},
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
    };
    const ok = await appendAnalytics(row);

    const remoteEvent =
      data.name === "page_view"
        ? "view"
        : data.name === "page_heartbeat"
          ? "heartbeat"
          : data.name === "page_leave"
            ? "hide"
            : null;
    if (remoteEvent) {
      try {
        const { getRequestHeaders } = await import(
          "@tanstack/react-start/server"
        );
        const { ingestAnalyticsEvent } = await import(
          "@/lib/analytics/ingest.server"
        );
        await ingestAnalyticsEvent(
          {
            path: data.path,
            event: remoteEvent,
            sessionId: data.sessionId,
            referrer: data.referrer ?? null,
            durationMs:
              typeof data.durationSec === "number"
                ? Math.round(data.durationSec * 1000)
                : null,
          },
          getRequestHeaders(),
        );
      } catch (error) {
        console.warn("[analytics] supabase dual-write failed", error);
      }
    }

    return { ok };
  });

export const getAnalyticsDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    const rows = await readAnalyticsLines();
    const dayStart = startOfUtcDay().getTime();

    const today = rows.filter(
      (r) => new Date(r.timestamp).getTime() >= dayStart,
    );
    const sessionsToday = new Set(today.map((r) => r.sessionId)).size;
    const pageViewsToday = today.filter((r) => r.name === "page_view").length;

    const pathCounts = new Map<string, number>();
    for (const r of today) {
      if (r.name !== "page_view") continue;
      pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
    }
    const topPaths = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, views]) => ({ path, views }));

    const topCountries = rankBySessions(today, (r) => {
      if (!r.country || r.country === "Local") return null;
      return r.country;
    })
      .slice(0, 8)
      .map(({ key, sessions }) => {
        const sample = today.find((r) => r.country === key);
        return {
          country: key,
          countryCode: sample?.countryCode ?? null,
          sessions,
        };
      });

    const topCities = rankBySessions(today, (r) => {
      if (!r.city || r.city === "Local") return null;
      const country = r.country && r.country !== "Local" ? r.country : null;
      return country ? `${r.city}|||${country}` : r.city;
    })
      .slice(0, 8)
      .map(({ key, sessions }) => {
        const [city, country] = key.split("|||");
        return {
          city: city || key,
          country: country || null,
          sessions,
        };
      });

    const recent = [...rows]
      .reverse()
      .slice(0, 40)
      .map((r) => ({
        id: r.id,
        name: r.name,
        path: r.path,
        sessionId: r.sessionId.slice(0, 8),
        timestamp: r.timestamp,
        durationSec: r.durationSec ?? null,
        country: r.country ?? null,
        countryCode: r.countryCode ?? null,
        city: r.city ?? null,
        location: formatGeoLabel({ city: r.city, country: r.country }),
      }));

    const durations = today
      .filter(
        (r) =>
          (r.name === "page_leave" || r.name === "page_heartbeat") &&
          typeof r.durationSec === "number",
      )
      .map((r) => r.durationSec as number);
    const avgDurationSec =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    return {
      sessionsToday,
      pageViewsToday,
      avgDurationSec,
      topPaths,
      topCountries,
      topCities,
      recent,
      totalEvents: rows.length,
    };
  },
);
