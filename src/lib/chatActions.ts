/** Context-aware in-chat CTA strips for the Ask bar. */

export type ChatActionId = "book" | "project" | "explore" | "cro";

export type ChatAction = {
  id: ChatActionId;
  label: string;
};

export type ChatActionIntent =
  | "pricing"
  | "cro"
  | "cro_done"
  | "general"
  | "buying"
  | "browsing"
  | "broad";

export type ResolveChatActionsInput = {
  intent: ChatActionIntent;
  /** Count of user messages in the thread (including the latest). */
  messageCount: number;
  userText?: string;
  /** Latest assistant reply — long structured answers get pills. */
  replyText?: string;
  /** True if a CTA strip was already shown in this general thread. */
  recentlyShown?: boolean;
  /** True if Cal / lead / CRO capture already started or completed. */
  commercialStarted?: boolean;
};

const BOOK: ChatAction = { id: "book", label: "Book a call" };
const PROJECT: ChatAction = {
  id: "project",
  label: "Tell me about a project",
};
const CRO_START: ChatAction = { id: "cro", label: "Start CRO audit" };

/** Soft buying signals beyond dedicated pricing / CRO / cal routers. */
export function isBuyingIntent(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return /\b(timeline|retainer|can you help|hire( you)?|work with (you|uxlab)|start (a |the )?project|need (help|an? (audit|partner))|when can|availability|quote|proposal|get started|ready to (start|begin)|scope (a|the)|engagement)\b/i.test(
    t,
  );
}

/** User is explicitly not in buying mode. */
export function isBrowsingIntent(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return /\b(just (browsing|looking|curious|exploring)|only looking|not (ready|looking to (buy|hire|commit))|maybe later|no thanks|don'?t (want|need) (a )?call)\b/i.test(
    t,
  );
}

/** Broad / expansive asks that warrant a next-step offer after the answer. */
export function isBroadQuery(text: string) {
  const t = text.trim();
  if (!t) return false;
  if (t.length >= 160) return true;
  return /\b(what do you think|strategy|entire site|whole (site|product|funnel)|full (audit|review|site)|overview|how (would|do|should) you|multi[- ]?topic|everything|across (the )?(site|product)|where (should|do) (we|i) start)\b/i.test(
    t,
  );
}

/** A long / structured assistant reply should offer next-step pills. */
export function isSubstantialReply(text: string) {
  const t = text.trim();
  if (!t) return false;
  if (t.length >= 260) return true;
  const lines = t.split(/\n+/).filter((line) => line.trim().length > 0);
  if (lines.length >= 4 && t.length >= 160) return true;
  const headings = t.match(/\*\*[^*]+\*\*/g)?.length ?? 0;
  if (headings >= 2 && t.length >= 140) return true;
  return false;
}

/** Conversion interest that didn’t already enter the CRO audit router. */
export function isSoftCroInterest(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return /\b(conversion rate|improve conversion|funnel (health|issues|leak)|landing pages? (feel|look|perform)|bounce rate|drop[- ]?offs?)\b/i.test(
    t,
  );
}

/**
 * Pick a short, context-logical CTA set — or none.
 * Prefers conversion when intent is commercial; stays quiet on short Q&A.
 */
export function resolveChatActions({
  intent,
  messageCount,
  userText = "",
  replyText = "",
  recentlyShown = false,
  commercialStarted = false,
}: ResolveChatActionsInput): ChatAction[] {
  // Scripted commercial moments always get their strip.
  if (intent === "pricing") {
    // Conversion-first after ballpark — no soft exit ramp.
    return [BOOK, PROJECT];
  }

  if (intent === "cro_done") {
    return [BOOK, PROJECT];
  }

  if (commercialStarted) return [];

  if (intent === "browsing" || isBrowsingIntent(userText)) {
    return [];
  }

  const longReply = isSubstantialReply(replyText);

  // Short follow-ups stay quiet after the first strip; long answers get pills again.
  if (recentlyShown && !longReply) return [];

  if (intent === "cro") {
    return [BOOK, CRO_START];
  }

  if (intent === "buying" || isBuyingIntent(userText)) {
    return [BOOK, PROJECT];
  }

  if (longReply || intent === "broad" || isBroadQuery(userText)) {
    return [BOOK, PROJECT];
  }

  // ~3 exchanges in a general thread.
  if (intent === "general" && messageCount >= 3) {
    return [BOOK, PROJECT];
  }

  // Short factual Q&A: no buttons.
  return [];
}

/** Map free-text (post-router) to a general-thread action intent. */
export function resolveGeneralActionIntent(
  userText: string,
): ChatActionIntent {
  if (isBrowsingIntent(userText)) return "browsing";
  if (isSoftCroInterest(userText)) return "cro";
  if (isBuyingIntent(userText)) return "buying";
  if (isBroadQuery(userText)) return "broad";
  return "general";
}
