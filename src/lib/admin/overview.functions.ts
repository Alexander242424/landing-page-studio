import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session.server";
import {
  analyticsEventsPath,
  chatEventsPath,
} from "@/lib/admin/paths.server";
import type { AnalyticsEventRow } from "@/lib/analytics/types";
import type { ChatEventRow } from "@/lib/chatPersistence.functions";

export type AdminDayPoint = {
  date: string;
  label: string;
  visitors: number;
  online: number;
  chats: number;
  orders: number;
};

export type AdminOverview = {
  rangeDays: number;
  visitors: number;
  online: number;
  chats: number;
  orders: number;
  series: AdminDayPoint[];
};

async function readJsonl<T>(path: string, limit: number): Promise<T[]> {
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

function utcDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  const d = new Date(`${key}T12:00:00.000Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function buildDayKeys(days: number): string[] {
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

function isOrderEvent(row: ChatEventRow): boolean {
  return (
    row.event_type === "lead_complete" ||
    row.event_type === "newsletter_complete" ||
    (row.event_type === "intent_open" && row.intent === "cal")
  );
}

function isChatSessionEvent(row: ChatEventRow): boolean {
  return (
    row.event_type === "user_message" ||
    row.event_type === "assistant_message" ||
    row.event_type === "session_start" ||
    row.event_type === "chat_open" ||
    row.intent != null
  );
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => {
    if (input == null || input === undefined) return { days: 30 as const };
    return z
      .object({ days: z.number().int().min(7).max(90).default(30) })
      .parse(input);
  })
  .handler(async ({ data }): Promise<AdminOverview> => {
    await requireAdmin();
    const rangeDays = data.days ?? 30;
    const dayKeys = buildDayKeys(rangeDays);
    const rangeStart = `${dayKeys[0]}T00:00:00.000Z`;
    const rangeStartMs = new Date(rangeStart).getTime();
    const onlineCutoff = Date.now() - 5 * 60 * 1000;

    const [analytics, chat] = await Promise.all([
      readJsonl<AnalyticsEventRow>(analyticsEventsPath(), 20_000),
      readJsonl<ChatEventRow>(chatEventsPath(), 20_000),
    ]);

    const visitorsByDay = new Map<string, Set<string>>();
    const onlineByDay = new Map<string, Set<string>>();
    const onlineNow = new Set<string>();

    for (const key of dayKeys) {
      visitorsByDay.set(key, new Set());
      onlineByDay.set(key, new Set());
    }

    for (const row of analytics) {
      const t = new Date(row.timestamp).getTime();
      if (Number.isNaN(t) || t < rangeStartMs) continue;
      const key = utcDayKey(row.timestamp);
      if (!visitorsByDay.has(key)) continue;

      if (row.name === "page_view") {
        visitorsByDay.get(key)!.add(row.sessionId);
      }
      if (
        row.name === "page_view" ||
        row.name === "page_heartbeat" ||
        row.name === "page_leave"
      ) {
        onlineByDay.get(key)!.add(row.sessionId);
        if (t >= onlineCutoff) onlineNow.add(row.sessionId);
      }
    }

    const chatsByDay = new Map<string, Set<string>>();
    const ordersByDay = new Map<string, number>();
    const chatSessions = new Set<string>();
    let ordersTotal = 0;

    for (const key of dayKeys) {
      chatsByDay.set(key, new Set());
      ordersByDay.set(key, 0);
    }

    for (const row of chat) {
      const t = new Date(row.created_at).getTime();
      if (Number.isNaN(t) || t < rangeStartMs) continue;
      const key = utcDayKey(row.created_at);
      if (!chatsByDay.has(key)) continue;

      if (isChatSessionEvent(row)) {
        chatsByDay.get(key)!.add(row.session_id);
        chatSessions.add(row.session_id);
      }
      if (isOrderEvent(row)) {
        ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
        ordersTotal += 1;
      }
    }

    const visitorsTotal = new Set<string>();
    for (const set of visitorsByDay.values()) {
      for (const id of set) visitorsTotal.add(id);
    }

    const series: AdminDayPoint[] = dayKeys.map((key) => ({
      date: key,
      label: dayLabel(key),
      visitors: visitorsByDay.get(key)?.size ?? 0,
      online: onlineByDay.get(key)?.size ?? 0,
      chats: chatsByDay.get(key)?.size ?? 0,
      orders: ordersByDay.get(key) ?? 0,
    }));

    return {
      rangeDays,
      visitors: visitorsTotal.size,
      online: onlineNow.size,
      chats: chatSessions.size,
      orders: ordersTotal,
      series,
    };
  });
