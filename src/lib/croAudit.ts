/** Light URL normalize/validate + favicon helpers for the CRO Audit chat flow. */

export type CroAuditStep = "url" | "scanning" | "name" | "email" | "done";

export type CroAuditAnswers = {
  url: string;
  domain: string;
  name: string;
  email: string;
};

export const CRO_SCAN_DURATION_MS = 10_000;

export const CRO_SCAN_STEPS = [
  "Fetching page…",
  "Mapping funnel…",
  "Scoring UX…",
  "Finding friction…",
  "Prioritizing fixes…",
] as const;

export const CRO = {
  intro:
    "Let’s run a quick CRO Audit. Paste the URL of the page or product you want us to review.",
  urlRetry:
    "That doesn’t look like a valid URL. Try something like example.com or https://example.com/pricing.",
  afterScan:
    "Scan complete — we’ve mapped the first-pass signals. What’s your name?",
  namePrompt: "What’s your name?",
  emailPrompt: "Thanks. What’s the best email to send the audit report to?",
  emailRetry: "Please share a valid email so we can send the report.",
  done: (email: string) =>
    `Perfect. We’ll send your CRO audit report to ${email} within 24 hours.`,
} as const;

export const CRO_PLACEHOLDER: Record<CroAuditStep, string> = {
  url: "https://your-site.com…",
  scanning: "Scanning…",
  name: "Your name…",
  email: "Your email…",
  done: "Ask anything…",
};

/** Normalize input → absolute http(s) URL, or null if invalid. */
export function normalizeAuditUrl(raw: string): {
  href: string;
  domain: string;
} | null {
  let input = raw.trim();
  if (!input) return null;

  // Strip wrapping quotes / angle brackets people sometimes paste
  input = input.replace(/^['"<]+|['">]+$/g, "").trim();

  if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || host === "localhost") return null;
  // Basic hostname: needs a dot and a plausible TLD (or xn-- IDN)
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host)) {
    return null;
  }

  return { href: parsed.href, domain: host };
}

export function faviconUrlForDomain(domain: string, size = 64) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}
