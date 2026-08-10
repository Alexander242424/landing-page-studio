/** Decoupled bridge: header / tips → ask chat lead flow. */

export const OPEN_LEAD_CHAT_EVENT = "uxlab:open-lead-chat";

export function openLeadChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_CHAT_EVENT));
}
