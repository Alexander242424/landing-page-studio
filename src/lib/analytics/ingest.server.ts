import { z } from "zod";
import { resolveRequestGeo } from "@/lib/analytics/geo.server";

export const AnalyticsIngestInput = z.object({
  path: z.string().min(1).max(2048),
  articleSlug: z.string().max(180).nullable().optional(),
  event: z.enum(["view", "heartbeat", "scroll", "hide"]),
  sessionId: z.string().min(8).max(128),
  referrer: z.string().max(2048).nullable().optional(),
  utmSource: z.string().max(120).nullable().optional(),
  utmMedium: z.string().max(120).nullable().optional(),
  utmCampaign: z.string().max(120).nullable().optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).nullable().optional(),
  viewportW: z.number().int().nonnegative().max(10000).nullable().optional(),
  scrollPct: z.number().int().min(0).max(100).nullable().optional(),
  durationMs: z.number().int().nonnegative().max(86_400_000).nullable().optional(),
});

export type AnalyticsIngestInput = z.infer<typeof AnalyticsIngestInput>;

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env["SUPABASE_URL"]?.replace(/\/$/, "");
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return null;
  return { url, key };
}

function articleSlugFromPath(path: string, explicit?: string | null): string | null {
  if (explicit?.trim()) return explicit.trim();
  const match = path.match(/^\/resources\/([^/?#]+)/);
  const slug = match?.[1]?.trim() ?? "";
  if (!slug || slug === "index") return null;
  return slug;
}

/**
 * Persist one analytics event. Country is resolved from request headers
 * (never from a client IP field). Returns false if Supabase is unset.
 */
export async function ingestAnalyticsEvent(
  data: AnalyticsIngestInput,
  headers?: { get(name: string): string | null | undefined },
): Promise<{ ok: boolean; store: "supabase" | "none" }> {
  const cfg = supabaseConfig();
  if (!cfg) return { ok: false, store: "none" };

  let country: string | null = null;
  let countryCode: string | null = null;
  if (headers) {
    try {
      const geo = await resolveRequestGeo(headers);
      country =
        geo.country && geo.country !== "Local" ? geo.country : null;
      countryCode = geo.countryCode;
    } catch (error) {
      console.warn("[analytics] geo resolve failed", error);
    }
  }

  const row = {
    path: data.path,
    article_slug: articleSlugFromPath(data.path, data.articleSlug),
    event: data.event,
    session_id: data.sessionId,
    referrer: data.referrer || null,
    utm_source: data.utmSource || null,
    utm_medium: data.utmMedium || null,
    utm_campaign: data.utmCampaign || null,
    device: data.device || null,
    viewport_w: data.viewportW ?? null,
    scroll_pct: data.scrollPct ?? null,
    duration_ms: data.durationMs ?? null,
    country,
    country_code: countryCode,
  };

  try {
    const response = await fetch(`${cfg.url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `[analytics] insert failed (${response.status}): ${body}`,
      );
      return { ok: false, store: "none" };
    }
    return { ok: true, store: "supabase" };
  } catch (error) {
    console.warn("[analytics] insert error", error);
    return { ok: false, store: "none" };
  }
}
