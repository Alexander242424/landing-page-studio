/** Decoupled bridge: header / footer / tips → ask chat flows. */

export const OPEN_LEAD_CHAT_EVENT = "uxlab:open-lead-chat";
export const OPEN_NEWSLETTER_CHAT_EVENT = "uxlab:open-newsletter-chat";
export const OPEN_CRO_AUDIT_EVENT = "uxlab:open-cro-audit";

export type AskChatOpenIntent = "contact" | "newsletter";

/** Optional service context when opening contact / lead chat from Solutions. */
export type AskChatServiceContext = {
  title: string;
  slug: string;
  description?: string;
};

export type LeadCapturePrefill = {
  email: string;
  name?: string;
};

export type OpenLeadChatDetail = {
  service?: AskChatServiceContext;
  /** Homepage / inline form — skips the email step when valid. */
  prefill?: LeadCapturePrefill;
  source?: string;
};

export function openLeadChat(detail?: OpenLeadChatDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenLeadChatDetail>(OPEN_LEAD_CHAT_EVENT, {
      detail: detail ?? {},
    }),
  );
}

export function openNewsletterChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_NEWSLETTER_CHAT_EVENT));
}

/** Footer / Solutions / hero “Let’s talk” → contact / lead capture in the ask bar. */
export function openContactChat(detail?: OpenLeadChatDetail) {
  openLeadChat(detail);
}

/** Hero “Free CRO audit” → scripted CRO Audit chat flow. */
export function openCroAuditChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CRO_AUDIT_EVENT));
}

/** Scripted lead intro — generic or service-personalized. */
export function leadIntroForService(service?: AskChatServiceContext | null) {
  if (!service?.title) {
    return "Great — let’s connect you with an expert. What’s the best email to reach you?";
  }
  return `Great — let’s talk about ${service.title}. What’s the best email to reach you?`;
}

/** Prefill / seeded goal when the user came from a specific Solutions card. */
export function leadGoalForService(service: AskChatServiceContext) {
  return `Interested in ${service.title}`;
}

export function leadCompanyPromptForService(service: AskChatServiceContext) {
  return `Thanks — noted you’re looking at ${service.title}. Which company are you with?`;
}

export function askPlaceholderForService(service: AskChatServiceContext) {
  return `Ask about ${service.title}…`;
}

/** Extra system grounding so Gemini stays on the selected service after lead capture. */
export function serviceSystemContext(service: AskChatServiceContext) {
  const description = service.description?.trim();
  return [
    `Session context: the visitor opened chat from the “${service.title}” Solutions card (slug: ${service.slug}).`,
    description
      ? `Service summary: ${description}`
      : null,
    "Prefer answers and next steps that relate to this service unless they clearly change topic.",
  ]
    .filter(Boolean)
    .join(" ");
}
