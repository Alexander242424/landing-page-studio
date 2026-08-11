/** Decoupled bridge: header / footer / tips → ask chat flows. */

export const OPEN_LEAD_CHAT_EVENT = "uxlab:open-lead-chat";
export const OPEN_NEWSLETTER_CHAT_EVENT = "uxlab:open-newsletter-chat";

export type AskChatOpenIntent = "contact" | "newsletter";

export function openLeadChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_CHAT_EVENT));
}

export function openNewsletterChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_NEWSLETTER_CHAT_EVENT));
}

/** Footer “Get in touch” → contact / lead capture in the ask bar. */
export function openContactChat() {
  openLeadChat();
}
