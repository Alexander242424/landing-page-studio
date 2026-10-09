import { getToolDetails } from "@/lib/toolverseDetails";

export type ToolMetric = {
  value: string;
  label: string;
};

export type ToolChartSeries = {
  caption: string;
  /** Suffix shown after each bar value (e.g. " wks", "%"). */
  unit?: string;
  points: readonly { label: string; value: number }[];
};

export type ToolEntry = {
  slug: string;
  name: string;
  blurb: string;
  href: string;
  /** Optional mark for workflow “Tools used”. Falls back to the initial. */
  logoSrc?: string;
  /** UXLAB opinionated take (tool popup). */
  review?: string;
  bestFor?: string;
  watchouts?: readonly string[];
  useWhen?: string;
  metrics?: readonly ToolMetric[];
  chart?: ToolChartSeries;
};

export type ToolCategory = {
  id: string;
  title: string;
  tools: readonly ToolEntry[];
  /** Single-tool hero row: full-width cell, taller tile. */
  featured?: boolean;
};

export const TOOLVERSE_PATH = "/toolverse";

const TOOL_LOGO_PNG = new Set(["clarity"]);

const TOOL_LOGO_SLUGS: readonly string[] = [
  "boostra",
  "ahrefs",
  "amplitude",
  "appcues",
  "bigquery",
  "calendly",
  "clarity",
  "contentsquare",
  "customerio",
  "dovetail",
  "fullstory",
  "ga4",
  "growthbook",
  "gtm",
  "heap",
  "hotjar",
  "launchdarkly",
  "logrocket",
  "lookback",
  "looker-studio",
  "maze",
  "mixpanel",
  "mouseflow",
  "optimizely",
  "pendo",
  "plausible",
  "posthog",
  "rudderstack",
  "search-console",
  "segment",
  "semrush",
  "sentry",
  "similarweb",
  "speed-insights",
  "sprig",
  "statsig",
  "stripe",
  "typeform",
  "usertesting",
  "vwo",
  "zaraz",
];

export function toolLogoSrc(slug: string): string | undefined {
  if (!TOOL_LOGO_SLUGS.includes(slug)) return undefined;
  const ext = TOOL_LOGO_PNG.has(slug) ? "png" : "svg";
  return `/tools/${slug}.${ext}`;
}

function withLogo(tool: ToolEntry): ToolEntry {
  const logoSrc = tool.logoSrc ?? toolLogoSrc(tool.slug);
  return logoSrc ? { ...tool, logoSrc } : tool;
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  {
    id: "cro",
    title: "Conversion rate optimisation",
    featured: true,
    tools: [
      {
        slug: "boostra",
        name: "Boostra",
        blurb:
          "Turn conversion leaks into a short list of fixes you can ship and measure this sprint — signal, hypothesis, and the next experiment in one loop.",
        href: "https://getboostra.com",
      },
    ],
  },
  {
    id: "analytics",
    title: "Product analytics",
    tools: [
      {
        slug: "mixpanel",
        name: "Mixpanel",
        blurb:
          "Event analytics for funnels, retention, and activation — the layer we trust once signup, aha, and paywall events have real names.",
        href: "https://mixpanel.com",
      },
      {
        slug: "amplitude",
        name: "Amplitude",
        blurb:
          "Journeys, cohorts, and experiments on product data — built for teams that share one analytics grammar across squads.",
        href: "https://amplitude.com",
      },
      {
        slug: "posthog",
        name: "PostHog",
        blurb:
          "Product analytics, flags, and session replay in one stack — the fastest way for a small team to test, watch, and read the funnel the same day.",
        href: "https://posthog.com",
      },
      {
        slug: "heap",
        name: "Heap",
        blurb:
          "Autocapture when you need history without a full event spec — useful for backfilling questions, dangerous if it becomes the source of truth.",
        href: "https://www.heap.io",
      },
      {
        slug: "ga4",
        name: "GA4",
        blurb:
          "Acquisition and web analytics — channel, landing page, and campaign truth. Not a product warehouse and not a substitute for named funnel events.",
        href: "https://analytics.google.com",
      },
    ],
  },
  {
    id: "replay",
    title: "Session replay & heatmaps",
    tools: [
      {
        slug: "fullstory",
        name: "FullStory",
        blurb:
          "Session proof tied to the same events as analytics — watch the exact step where a named funnel drops, not a random recording.",
        href: "https://www.fullstory.com",
      },
      {
        slug: "hotjar",
        name: "Hotjar",
        blurb:
          "Heatmaps, recordings, and on-site surveys — the first place we look when a page gets traffic and almost nobody scrolls, clicks, or finishes.",
        href: "https://www.hotjar.com",
      },
      {
        slug: "clarity",
        name: "Microsoft Clarity",
        blurb:
          "Free recordings and rage-click maps for leak hunting — start here before you pay for a replay suite, especially on marketing sites.",
        href: "https://clarity.microsoft.com",
      },
      {
        slug: "contentsquare",
        name: "Contentsquare",
        blurb:
          "Enterprise journey analytics and experience scoring — zone-level friction, frustration, and revenue impact when a single heatmap is not enough.",
        href: "https://contentsquare.com",
      },
      {
        slug: "mouseflow",
        name: "Mouseflow",
        blurb:
          "Funnels plus form analytics on the same recording — field-level drop-off, refill, and hesitation on checkout and lead forms.",
        href: "https://mouseflow.com",
      },
    ],
  },
  {
    id: "testing",
    title: "A/B testing & flags",
    tools: [
      {
        slug: "optimizely",
        name: "Optimizely",
        blurb:
          "Web and feature experiments on live traffic — the suite we reach for when a program already has traffic, an analyst, and a backlog of page-level tests.",
        href: "https://www.optimizely.com",
      },
      {
        slug: "vwo",
        name: "VWO",
        blurb:
          "Testing, insights, and personalization in one CRO suite — heatmaps, recordings, and experiments without standing up five vendors.",
        href: "https://vwo.com",
      },
      {
        slug: "statsig",
        name: "Statsig",
        blurb:
          "Flags and experiments with warehouse-native stats — ship product tests and read them against the metrics you already trust in the warehouse.",
        href: "https://www.statsig.com",
      },
      {
        slug: "launchdarkly",
        name: "LaunchDarkly",
        blurb:
          "Feature flags for shipping tests without a full rebuild — progressive delivery, targeting, and kill switches when the experiment lives in code.",
        href: "https://launchdarkly.com",
      },
      {
        slug: "growthbook",
        name: "GrowthBook",
        blurb:
          "Open-source experimentation on your own data — flags and stats you can run on warehouse metrics instead of a black-box testing UI.",
        href: "https://www.growthbook.io",
      },
    ],
  },
  {
    id: "tracking",
    title: "Tracking & CDP",
    tools: [
      {
        slug: "gtm",
        name: "Google Tag Manager",
        blurb:
          "Tag layer for pixels, events, and consent-aware firing — the control plane between the site and every analytics or ad vendor.",
        href: "https://tagmanager.google.com",
      },
      {
        slug: "segment",
        name: "Segment",
        blurb:
          "Collect once, route events to analytics and ads — one taxonomy, many destinations, as long as someone owns the tracking plan.",
        href: "https://segment.com",
      },
      {
        slug: "rudderstack",
        name: "RudderStack",
        blurb:
          "Warehouse-first pipelines for product and marketing data — collect once and land events where SQL, experiments, and reverse ETL already live.",
        href: "https://www.rudderstack.com",
      },
      {
        slug: "zaraz",
        name: "Cloudflare Zaraz",
        blurb:
          "Server-side tags with less client bloat — keep pixels and analytics firing without turning every landing page into a script pile.",
        href: "https://developers.cloudflare.com/zaraz/",
      },
    ],
  },
  {
    id: "traffic",
    title: "Traffic & attribution",
    tools: [
      {
        slug: "search-console",
        name: "Search Console",
        blurb:
          "Queries and pages that already send you demand — the ground truth for which URLs deserve a CRO pass before you write more content.",
        href: "https://search.google.com/search-console",
      },
      {
        slug: "ahrefs",
        name: "Ahrefs",
        blurb:
          "Organic demand, competitors, and content gaps — where rivals already rank, and which of your pages are worth fixing instead of publishing more.",
        href: "https://ahrefs.com",
      },
      {
        slug: "similarweb",
        name: "Similarweb",
        blurb:
          "Channel mix and referral quality before you spend more — directional market sizing when leadership asks how big a competitor’s paid or organic pond is.",
        href: "https://www.similarweb.com",
      },
      {
        slug: "semrush",
        name: "Semrush",
        blurb:
          "Keywords, ads, and competitive traffic maps — intent, SERP features, and paid overlap so CRO work starts on pages that can actually convert.",
        href: "https://www.semrush.com",
      },
      {
        slug: "plausible",
        name: "Plausible",
        blurb:
          "Lightweight privacy-first traffic without the noise — pageviews, sources, and goals when GA4 is more dashboard than decision.",
        href: "https://plausible.io",
      },
    ],
  },
  {
    id: "users",
    title: "User research",
    tools: [
      {
        slug: "maze",
        name: "Maze",
        blurb:
          "Unmoderated tests on live flows and prototypes — path success, misclicks, and time-on-task before you ship a redesign to everyone.",
        href: "https://maze.co",
      },
      {
        slug: "dovetail",
        name: "Dovetail",
        blurb:
          "Tag interviews and clips next to the hypothesis — a research library the CRO backlog can cite, not a folder of transcripts nobody reopens.",
        href: "https://dovetail.com",
      },
      {
        slug: "usertesting",
        name: "UserTesting",
        blurb:
          "Panel sessions when you need a voice on the leak — moderated or unmoderated, with a recruited audience that matches the segment you are trying to convert.",
        href: "https://www.usertesting.com",
      },
      {
        slug: "lookback",
        name: "Lookback",
        blurb:
          "Live and recorded interviews with the real product — watch someone use the actual flow, then clip the moment the task breaks.",
        href: "https://lookback.io",
      },
    ],
  },
  {
    id: "feedback",
    title: "Surveys & in-product",
    tools: [
      {
        slug: "sprig",
        name: "Sprig",
        blurb:
          "In-product microsurveys at the stall moment — one question where the funnel actually stops, tied to the user and the event.",
        href: "https://sprig.com",
      },
      {
        slug: "pendo",
        name: "Pendo",
        blurb:
          "Guides, NPS, and product usage in one layer — useful when onboarding and feedback need to sit on the same product graph.",
        href: "https://www.pendo.io",
      },
      {
        slug: "typeform",
        name: "Typeform",
        blurb:
          "Longer surveys when you need structured answers — post-purchase, churn, and research forms that a one-question microsurvey cannot carry.",
        href: "https://www.typeform.com",
      },
      {
        slug: "appcues",
        name: "Appcues",
        blurb:
          "Checklists and tooltips that do not replace an aha — use them to point at the next valuable action, not to paper over a confusing product.",
        href: "https://www.appcues.com",
      },
    ],
  },
  {
    id: "performance",
    title: "Web vitals & errors",
    tools: [
      {
        slug: "sentry",
        name: "Sentry",
        blurb:
          "Errors and traces that kill conversion mid-flow — the release, the browser, and the stack trace behind a sudden funnel drop.",
        href: "https://sentry.io",
      },
      {
        slug: "speed-insights",
        name: "CrUX / PSI",
        blurb:
          "Field vitals — slow pages leak paid traffic. CrUX and PageSpeed tell you whether LCP or INP is eating the click before the offer loads.",
        href: "https://pagespeed.web.dev",
      },
      {
        slug: "logrocket",
        name: "LogRocket",
        blurb:
          "Replay plus logs when a step fails in production — console, network, and the session, for bugs support can describe but analytics cannot.",
        href: "https://logrocket.com",
      },
    ],
  },
];

const EXTRA_TOOLS: readonly ToolEntry[] = [
  {
    slug: "looker-studio",
    name: "Looker Studio",
    blurb:
      "Reporting on the funnel without a full BI rebuild — stakeholder views on GA4, BigQuery, or Sheets that do not require a new warehouse project.",
    href: "https://lookerstudio.google.com",
  },
  {
    slug: "bigquery",
    name: "BigQuery",
    blurb:
      "Warehouse for events, scores, and experiment reads — where funnels, revenue, and flags meet once the product outgrows a single analytics UI.",
    href: "https://cloud.google.com/bigquery",
  },
  {
    slug: "stripe",
    name: "Stripe",
    blurb:
      "Checkout, paywalls, and pricing tests on live billing — the source of truth for revenue, failed payments, and which price actually collected.",
    href: "https://stripe.com",
  },
  {
    slug: "customerio",
    name: "Customer.io",
    blurb:
      "Lifecycle messages tied to the same product events — activation and win-back email that fires on behavior, not on a calendar blast.",
    href: "https://customer.io",
  },
  {
    slug: "calendly",
    name: "Calendly",
    blurb:
      "Research and sales booking without a custom calendar — the handoff from a converted page or a research invite into a real conversation.",
    href: "https://calendly.com",
  },
];

const TOOL_NAME_ALIASES: Record<string, string> = {
  boostra: "boostra",
  getboostra: "boostra",
  gtm: "gtm",
  "google tag manager": "gtm",
  ga4: "ga4",
  "looker studio": "looker-studio",
  bigquery: "bigquery",
  stripe: "stripe",
  "customer.io": "customerio",
  calendly: "calendly",
};

const TOOLS_BY_SLUG = new Map<string, ToolEntry>();
const TOOLS_BY_NAME = new Map<string, ToolEntry>();

for (const tool of [
  ...TOOL_CATEGORIES.flatMap((category) => category.tools),
  ...EXTRA_TOOLS,
]) {
  const normalized = withLogo(tool);
  TOOLS_BY_SLUG.set(normalized.slug, normalized);
  TOOLS_BY_NAME.set(normalized.name.toLowerCase(), normalized);
}

export function getTool(slug: string): ToolEntry | undefined {
  const base = TOOLS_BY_SLUG.get(slug);
  if (!base) return undefined;
  const details = getToolDetails(slug);
  return details ? { ...base, ...details } : base;
}

export function getToolCategoryTitle(slug: string): string | undefined {
  for (const category of TOOL_CATEGORIES) {
    if (category.tools.some((tool) => tool.slug === slug)) {
      return category.title;
    }
  }
  return undefined;
}

export function relatedTools(slug: string, limit = 4): ToolEntry[] {
  for (const category of TOOL_CATEGORIES) {
    if (!category.tools.some((tool) => tool.slug === slug)) continue;
    return category.tools
      .filter((tool) => tool.slug !== slug)
      .slice(0, limit)
      .map((tool) => TOOLS_BY_SLUG.get(tool.slug) ?? withLogo(tool));
  }
  return [];
}

export function toolCount() {
  return TOOL_CATEGORIES.reduce((sum, category) => sum + category.tools.length, 0);
}

export function resolveTool(name: string): ToolEntry {
  const key = name.trim().toLowerCase();
  const aliased = TOOL_NAME_ALIASES[key];
  const resolved =
    TOOLS_BY_NAME.get(key) ??
    (aliased ? TOOLS_BY_SLUG.get(aliased) : undefined) ?? {
      slug: key.replace(/[^a-z0-9]+/g, "-"),
      name,
      blurb: "",
      href: `https://www.google.com/search?q=${encodeURIComponent(name)}`,
    };
  return withLogo(resolved);
}
