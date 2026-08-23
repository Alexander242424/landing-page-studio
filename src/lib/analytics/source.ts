const SITE_HOSTS = new Set([
  "uxlab.digital",
  "www.uxlab.digital",
  "localhost",
]);

function prettyLabel(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function hostFromReferrer(raw: string | null | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) return "Direct";
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (SITE_HOSTS.has(host) || host.endsWith(".localhost")) return "Direct";
    return host || "Direct";
  } catch {
    return "Direct";
  }
}

/**
 * Human traffic source: UTM first, then known referrers.
 * Preview hosts (Lovable etc.) are grouped so they don't look like real traffic.
 */
export function classifySource(opts: {
  utmSource?: string | null;
  utmMedium?: string | null;
  referrer?: string | null;
}): string {
  const utm = opts.utmSource?.trim();
  if (utm) {
    const medium = opts.utmMedium?.trim();
    const source = prettyLabel(utm);
    return medium ? `${source} / ${prettyLabel(medium)}` : source;
  }

  const host = hostFromReferrer(opts.referrer).toLowerCase();
  if (host === "direct") return "Direct";
  if (
    host === "google.com" ||
    host.endsWith(".google.com") ||
    host === "google.com.ua" ||
    host.startsWith("google.")
  ) {
    return "Google";
  }
  if (host === "bing.com" || host.endsWith(".bing.com")) return "Bing";
  if (host.includes("linkedin") || host === "lnkd.in") return "LinkedIn";
  if (host.includes("instagram")) return "Instagram";
  if (
    host.includes("facebook") ||
    host === "fb.com" ||
    host === "l.facebook.com" ||
    host === "m.facebook.com"
  ) {
    return "Facebook";
  }
  if (host === "t.co" || host.includes("twitter") || host === "x.com") {
    return "X / Twitter";
  }
  if (host.includes("youtube") || host === "youtu.be") return "YouTube";
  if (host.includes("tiktok")) return "TikTok";
  if (host.includes("reddit")) return "Reddit";
  if (host.includes("producthunt")) return "Product Hunt";
  if (
    host.includes("lovable") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovable.app")
  ) {
    return "Lovable preview";
  }
  if (host.endsWith(".vercel.app") || host.endsWith(".netlify.app")) {
    return "Preview";
  }
  return hostFromReferrer(opts.referrer);
}
