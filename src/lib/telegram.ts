/**
 * Telegram Bot notifications for chat starts + new leads.
 * Requires TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (or TELEGRAM_CHAT_IDS comma-separated).
 */

type TelegramChatEvent = {
  session_id: string;
  event_type: string;
  intent?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function shortSession(sessionId: string) {
  return sessionId.length > 10 ? `${sessionId.slice(0, 8)}…` : sessionId;
}

function metaLines(metadata: Record<string, unknown> | undefined) {
  if (!metadata || typeof metadata !== "object") return [];
  const lines: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (value == null || value === "") continue;
    if (typeof value === "object") continue;
    lines.push(`• <b>${escapeHtml(key)}</b>: ${escapeHtml(String(value))}`);
  }
  return lines;
}

export function shouldNotifyTelegram(row: TelegramChatEvent): boolean {
  return (
    row.event_type === "intent_open" ||
    row.event_type === "lead_complete" ||
    row.event_type === "newsletter_complete"
  );
}

export function formatTelegramMessage(row: TelegramChatEvent): string {
  const when = new Date(row.created_at).toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const session = shortSession(row.session_id);
  const intent = row.intent ? escapeHtml(row.intent) : "general";
  const extras = metaLines(row.metadata as Record<string, unknown> | undefined);

  if (row.event_type === "intent_open") {
    return [
      `💬 <b>Chat started</b>`,
      `Intent: <b>${intent}</b>`,
      `Session: <code>${escapeHtml(session)}</code>`,
      `When: ${escapeHtml(when)}`,
      ...extras,
    ].join("\n");
  }

  if (
    row.event_type === "lead_complete" ||
    row.event_type === "newsletter_complete"
  ) {
    const kind =
      row.event_type === "newsletter_complete" ? "Newsletter" : "Lead";
    return [
      `🎯 <b>New ${kind}</b>`,
      `Intent: <b>${intent}</b>`,
      `Session: <code>${escapeHtml(session)}</code>`,
      `When: ${escapeHtml(when)}`,
      ...extras,
    ].join("\n");
  }

  return [
    `ℹ️ <b>Chat event</b> (${escapeHtml(row.event_type)})`,
    `Intent: <b>${intent}</b>`,
    `Session: <code>${escapeHtml(session)}</code>`,
  ].join("\n");
}

function chatIds(): string[] {
  const multi = process.env["TELEGRAM_CHAT_IDS"]?.trim();
  if (multi) {
    return multi
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  const single = process.env["TELEGRAM_CHAT_ID"]?.trim();
  return single ? [single] : [];
}

/** Send a Telegram message. No-op if env is missing. */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
  const ids = chatIds();
  if (!token || ids.length === 0) return false;

  let anyOk = false;
  for (const chatId of ids) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        },
      );
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(
          `[telegram] sendMessage failed (${response.status}): ${body}`,
        );
        continue;
      }
      anyOk = true;
    } catch (error) {
      console.error("[telegram] sendMessage error", error);
    }
  }
  return anyOk;
}

/** Fire-and-forget notify for chat_events worth alerting on. */
export async function notifyTelegramForChatEvent(
  row: TelegramChatEvent,
): Promise<void> {
  if (!shouldNotifyTelegram(row)) return;
  const text = formatTelegramMessage(row);
  await sendTelegramMessage(text);
}
