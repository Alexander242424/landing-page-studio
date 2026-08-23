import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { runDailyAnalyticsDigest } from "@/lib/analytics/dailyDigest";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function authorized(request: Request): boolean {
  const secret = readEnv("CRON_SECRET");
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const query = new URL(request.url).searchParams.get("secret") ?? "";
  return bearer === secret || query === secret;
}

async function handle({ request }: { request: Request }) {
  if (!authorized(request)) {
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
