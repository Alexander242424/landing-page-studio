import { logChatEvent as logChatEventFn } from "@/lib/chatPersistence.functions";

const SESSION_KEY = "uxlab:chat-session-id";
const LOCAL_QUEUE_KEY = "uxlab:chat-events-queue";

export type ChatEventType =
  | "intent_open"
  | "chip_click"
  | "user_message"
  | "assistant_message"
  | "pricing_action"
  | "cro_action"
  | "lead_complete"
  | "newsletter_complete"
  | "chat_close";

export type ChatIntent =
  | "contact"
  | "newsletter"
  | "pricing"
  | "cro"
  | "cal"
  | "general"
  | "chip";

export type ChatEventInput = {
  eventType: ChatEventType;
  intent?: ChatIntent | null;
  role?: "user" | "assistant" | null;
  content?: string | null;
  metadata?: Record<string, unknown>;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable per-tab session id for correlating chat events. */
export function getChatSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = createId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return createId();
  }
}

function pushLocalQueue(row: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY);
    const prev = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = Array.isArray(prev) ? [...prev, row].slice(-500) : [row];
    localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — ignore local mirror.
  }
}

/**
 * Fire-and-forget chat analytics + transcript logging.
 * Always mirrors to localStorage; posts to Supabase via server fn when configured.
 */
export function logChatEvent(input: ChatEventInput): void {
  const sessionId = getChatSessionId();
  const row = {
    id: createId(),
    session_id: sessionId,
    event_type: input.eventType,
    intent: input.intent ?? null,
    role: input.role ?? null,
    content: input.content ?? null,
    metadata: input.metadata ?? {},
    created_at: new Date().toISOString(),
  };

  pushLocalQueue(row);

  void logChatEventFn({ data: row }).catch((error) => {
    console.warn("[chatPersistence] failed to persist event", error);
  });
}
