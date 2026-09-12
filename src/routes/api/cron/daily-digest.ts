import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { runDailyAnalyticsDigest } from "@/lib/analytics/dailyDigest";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function bearerFrom(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
}

/** Token stored in the DB so the in-database scheduler can authenticate
 *  without duplicating CRON_SECRET into migration SQL. */
async function dbCronToken(): Promise<string | null> {
  const url = readEnv("SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/digest_cron_token?select=token&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ token?: string }>;
    return rows[0]?.token ?? null;
  } catch {
    return null;
  }
}

async function authorized(request: Request): Promise<boolean> {
  const bearer = bearerFrom(request);
  const query = new URL(request.url).searchParams.get("secret") ?? "";
  const presented = bearer || query;
  if (!presented) return false;
  const secret = readEnv("CRON_SECRET");
  if (secret && presented === secret) return true;
  const dbToken = await dbCronToken();
  return !!dbToken && presented === dbToken;
}

async function handle({ request }: { request: Request }) {
  if (!(await authorized(request))) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const result = await runDailyAnalyticsDigest({
    source: "http",
    force,
  });
  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/cron/daily-digest")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
