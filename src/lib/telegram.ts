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

const MESSAGE_MAX_CHARS = 400;

/** Useful lead/contact keys — everything else is noise for Telegram. */
const CONTACT_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  company: "Company",
  goal: "Goal",
  url: "URL",
  domain: "Domain",
  website: "Website",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Europe/Warsaw",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncate(value: string, max = MESSAGE_MAX_CHARS) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function headlineFor(row: TelegramChatEvent): string {
  const intent = row.intent ?? "general";

  if (row.event_type === "newsletter_complete") {
    return "📧 Newsletter signup";
  }

  if (row.event_type === "lead_complete") {
    if (intent === "cro") return "🔍 CRO audit lead";
    if (intent === "contact") return "🎯 New lead";
    return "🎯 New lead";
  }

  if (row.event_type === "intent_open") {
    switch (intent) {
      case "contact":
        return "🎯 Contact chat started";
      case "newsletter":
        return "📧 Newsletter chat started";
      case "cro":
        return "🔍 CRO audit started";
      case "cal":
        return "📅 Booking started";
      case "pricing":
        return "💬 Pricing chat started";
      default:
        return "💬 Chat started";
    }
  }

  return `ℹ️ ${escapeHtml(row.event_type)}`;
}

function contactLines(metadata: Record<string, unknown> | undefined): string[] {
  if (!metadata || typeof metadata !== "object") return [];

  const hasUrl =
    typeof metadata.url === "string" && metadata.url.trim().length > 0;

  const lines: string[] = [];
  for (const [key, label] of Object.entries(CONTACT_FIELD_LABELS)) {
    // Prefer full URL over bare domain when both exist.
    if (key === "domain" && hasUrl) continue;
    const raw = metadata[key];
    if (raw == null || raw === "") continue;
    if (typeof raw === "object") continue;
    const value = String(raw).trim();
    if (!value) continue;
    lines.push(`<b>${label}:</b> ${escapeHtml(value)}`);
  }
  return lines;
}

function messageBlock(content: string | null | undefined): string | null {
  if (!content?.trim()) return null;
  return `“${escapeHtml(truncate(content))}”`;
}

export function shouldNotifyTelegram(row: TelegramChatEvent): boolean {
  return (
    row.event_type === "intent_open" ||
    row.event_type === "lead_complete" ||
    row.event_type === "newsletter_complete"
  );
}

export function formatTelegramMessage(row: TelegramChatEvent): string {
  const lines: string[] = [`<b>${headlineFor(row)}</b>`];

  const message = messageBlock(row.content);
  if (message) {
    lines.push("", message);
  }

  const contacts = contactLines(
    row.metadata as Record<string, unknown> | undefined,
  );
  if (contacts.length > 0) {
    lines.push("", ...contacts);
  }

  lines.push("", escapeHtml(formatWhen(row.created_at)));

  return lines.join("\n");
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
