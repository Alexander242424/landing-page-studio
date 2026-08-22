import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { notifyTelegramForChatEvent } from "@/lib/telegram";

const ChatEventRow = z.object({
  id: z.string().min(1),
  session_id: z.string().min(1),
  event_type: z.string().min(1),
  intent: z.string().nullable().optional(),
  role: z.enum(["user", "assistant"]).nullable().optional(),
  content: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().min(1),
});

export type ChatEventRow = z.infer<typeof ChatEventRow>;

async function insertSupabase(row: ChatEventRow): Promise<boolean> {
  const url = process.env["SUPABASE_URL"]?.replace(/\/$/, "");
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];

  if (!url || !key) return false;

  const response = await fetch(`${url}/rest/v1/chat_events`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      id: row.id,
      session_id: row.session_id,
      event_type: row.event_type,
      intent: row.intent ?? null,
      role: row.role ?? null,
      content: row.content ?? null,
      metadata: row.metadata ?? {},
      created_at: row.created_at,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Supabase chat_events insert failed (${response.status}): ${body}`,
    );
  }

  return true;
}

async function appendLocalDevFile(row: ChatEventRow): Promise<boolean> {
  // Node/dev only — Cloudflare workers have no durable FS.
  if (typeof process === "undefined" || !process.versions?.node) return false;

  try {
    const { mkdir, appendFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const dir = join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      join(dir, "chat-events.jsonl"),
      `${JSON.stringify(row)}\n`,
      "utf8",
    );
    return true;
  } catch (error) {
    console.warn("[chatPersistence] local file fallback failed", error);
    return false;
  }
}

/**
 * Persist one chat event.
 * Prefer Supabase (`SUPABASE_URL` + key). In local Node without Supabase,
 * append to `.data/chat-events.jsonl`.
 */
export const logChatEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatEventRow.parse(input))
  .handler(async ({ data }) => {
    // Await the send — a detached `void` fetch is cancelled on Cloudflare
    // when this handler returns (especially with no Supabase, store=client_only).
    try {
      await notifyTelegramForChatEvent(data);
    } catch (error) {
      console.error("[chatPersistence] Telegram notify failed", error);
    }

    try {
      const wroteRemote = await insertSupabase(data);
      if (wroteRemote) {
        return { ok: true as const, store: "supabase" as const };
      }
    } catch (error) {
      console.error("[chatPersistence] Supabase error", error);
    }

    const wroteLocal = await appendLocalDevFile(data);
    if (wroteLocal) {
      return { ok: true as const, store: "local_file" as const };
    }

    // Still acknowledge — client keeps a localStorage mirror.
    return { ok: true as const, store: "client_only" as const };
  });
