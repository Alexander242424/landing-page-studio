import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session.server";
import { chatEventsPath } from "@/lib/admin/paths.server";
import type { ChatEventRow } from "@/lib/chatPersistence.functions";

async function readChatEvents(limit = 8000): Promise<ChatEventRow[]> {
  if (typeof process === "undefined" || !process.versions?.node) return [];
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(chatEventsPath(), "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const slice = lines.length > limit ? lines.slice(-limit) : lines;
    const rows: ChatEventRow[] = [];
    for (const line of slice) {
      try {
        rows.push(JSON.parse(line) as ChatEventRow);
      } catch {
        // skip
      }
    }
    return rows;
  } catch {
    return [];
  }
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonRecord = Record<string, JsonValue>;

export type OrderLead = {
  id: string;
  sessionId: string;
  type: "contact" | "cro_audit" | "newsletter" | "booking" | "other";
  email: string | null;
  summary: string;
  metadata: JsonRecord;
  createdAt: string;
};

export type ConversationSummary = {
  sessionId: string;
  messageCount: number;
  lastAt: string;
  firstAt: string;
  intents: string[];
  preview: string;
  hasLead: boolean;
};

function orderTypeFromEvent(row: ChatEventRow): OrderLead["type"] {
  if (row.event_type === "newsletter_complete") return "newsletter";
  if (row.intent === "cro" || row.metadata?.["flow"] === "cro_audit") {
    return "cro_audit";
  }
  if (row.intent === "contact") return "contact";
  if (row.intent === "cal") return "booking";
  return "other";
}

function summarizeLead(row: ChatEventRow): string {
  const meta = row.metadata ?? {};
  const email =
    (typeof meta["email"] === "string" && meta["email"]) || null;
  const company =
    typeof meta["company"] === "string" ? meta["company"] : null;
  const goal = typeof meta["goal"] === "string" ? meta["goal"] : null;
  const url = typeof meta["url"] === "string" ? meta["url"] : null;
  const name = typeof meta["name"] === "string" ? meta["name"] : null;
  const parts = [
    row.intent ?? row.event_type,
    email,
    company,
    goal,
    name,
    url,
  ].filter(Boolean);
  return parts.join(" · ");
}

export const listAdminOrders = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    const events = await readChatEvents();
    const leads: OrderLead[] = [];

    for (const row of events) {
      if (
        row.event_type !== "lead_complete" &&
        row.event_type !== "newsletter_complete"
      ) {
        continue;
      }
      const meta = (row.metadata ?? {}) as JsonRecord;
      const email =
        typeof meta["email"] === "string" ? (meta["email"] as string) : null;
      leads.push({
        id: row.id,
        sessionId: row.session_id,
        type: orderTypeFromEvent(row),
        email,
        summary: summarizeLead(row),
        metadata: meta,
        createdAt: row.created_at,
      });
    }

    for (const row of events) {
      if (row.event_type !== "intent_open" || row.intent !== "cal") continue;
      leads.push({
        id: row.id,
        sessionId: row.session_id,
        type: "booking",
        email: null,
        summary: "Cal booking opened",
        metadata: row.metadata ?? {},
        createdAt: row.created_at,
      });
    }

    leads.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { orders: leads.slice(0, 200) };
  },
);

export const listAdminConversations = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireAdmin();
  const events = await readChatEvents();
  const bySession = new Map<string, ChatEventRow[]>();

  for (const row of events) {
    const list = bySession.get(row.session_id) ?? [];
    list.push(row);
    bySession.set(row.session_id, list);
  }

  const conversations: ConversationSummary[] = [];
  for (const [sessionId, rows] of bySession) {
    rows.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const messages = rows.filter(
      (r) =>
        r.event_type === "user_message" ||
        r.event_type === "assistant_message",
    );
    const intents = [
      ...new Set(
        rows.map((r) => r.intent).filter((v): v is string => Boolean(v)),
      ),
    ];
    const hasLead = rows.some(
      (r) =>
        r.event_type === "lead_complete" ||
        r.event_type === "newsletter_complete",
    );
    const lastMsg = [...messages].reverse()[0] ?? rows[rows.length - 1];
    const preview =
      (typeof lastMsg?.content === "string" && lastMsg.content.slice(0, 120)) ||
      lastMsg?.event_type ||
      "—";

    conversations.push({
      sessionId,
      messageCount: messages.length,
      firstAt: rows[0]?.created_at ?? "",
      lastAt: rows[rows.length - 1]?.created_at ?? "",
      intents,
      preview,
      hasLead,
    });
  }

  conversations.sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  return { conversations: conversations.slice(0, 150) };
});

export const getAdminConversation = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ sessionId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const events = await readChatEvents();
    const rows = events
      .filter((r) => r.session_id === data.sessionId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

    return {
      sessionId: data.sessionId,
      events: rows.map((r) => ({
        id: r.id,
        eventType: r.event_type,
        intent: r.intent ?? null,
        role: r.role ?? null,
        content: r.content ?? null,
        metadata: r.metadata ?? {},
        createdAt: r.created_at,
      })),
    };
  });

export const getAdminOverviewCounts = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireAdmin();
  const events = await readChatEvents();
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const t = dayStart.getTime();

  const today = events.filter((e) => new Date(e.created_at).getTime() >= t);
  const activeChats = new Set(today.map((e) => e.session_id)).size;
  const newLeads = today.filter(
    (e) =>
      e.event_type === "lead_complete" ||
      e.event_type === "newsletter_complete",
  ).length;

  return { activeChats, newLeads, chatEventsToday: today.length };
});
