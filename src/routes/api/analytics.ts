import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  AnalyticsIngestInput,
  ingestAnalyticsEvent,
} from "@/lib/analytics/ingest.server";

async function handlePost({ request }: { request: Request }) {
  try {
    const json: unknown = await request.json();
    const parsed = AnalyticsIngestInput.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await ingestAnalyticsEvent(parsed.data, request.headers);
    if (result.ok) {
      return new Response(null, { status: 204 });
    }
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      POST: handlePost,
    },
  },
});
