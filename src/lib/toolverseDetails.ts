import type { ToolChartSeries, ToolMetric } from "@/lib/toolverse";

export type ToolDetailFields = {
  review: string;
  metrics: [ToolMetric, ToolMetric, ToolMetric];
  chart: ToolChartSeries;
  bestFor: string;
  watchouts: readonly [string, string, ...string[]];
  useWhen: string;
};

function m(value: string, label: string): ToolMetric {
  return { value, label };
}

function chart(
  caption: string,
  unit: string,
  points: readonly (readonly [string, number])[],
): ToolChartSeries {
  return {
    caption,
    unit,
    points: points.map(([label, value]) => ({ label, value })),
  };
}

/** UXLAB copy + metrics keyed by tool slug (TOOL_CATEGORIES tools). */
export const TOOL_DETAILS: Record<string, ToolDetailFields> = {
  mixpanel: {
    review:
      "Our default event layer when the team already names funnel steps and needs retention reads without a warehouse project. Mixpanel pays off once signup → activation → paywall events are stable — until then you are paying for dashboards nobody trusts. Pick Amplitude if product ops wants guided journeys out of the box; PostHog if you want flags and replay on the same bill.",
    metrics: [
      m("3–5 days", "Typical time-to-first funnel"),
      m("High", "CRO stack fit"),
      m("$0.28–$0.45", "Est. cost / 1k events"),
    ],
    chart: chart("Weeks to trusted activation read", " wks", [
      ["Spec events", 6.2],
      ["QA + deploy", 2.1],
      ["First funnel", 1.4],
      ["Retention slice", 2.8],
      ["Stakeholder sign-off", 1.6],
    ]),
    bestFor: "Product-led funnels where event names map to revenue steps.",
    watchouts: [
      "Garbage event names compound — audit the taxonomy before scaling reports.",
      "Identity merges across domains need a plan or cohorts lie.",
      "Heavy autocapture temptations; resist unless you have a cleanup sprint.",
    ],
    useWhen: "You will instrument 15–40 named events and iterate weekly on activation.",
  },
  boostra: {
    review:
      "Our pick when the bottleneck is not missing data but missing action — conversion signal needs to collapse into a sprint-sized list you can ship. We built and designed Boostra around that loop: find the stall, propose the fix, measure the lift. Keep Mixpanel or PostHog as the event layer; reach for VWO or Statsig when you need heavyweight client-side experiment stats on top.",
    metrics: [
      m("+2.1x", "Tests shipped (Boostra)"),
      m("High", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days from insight to shipped test", " days", [
      ["Signal review", 2],
      ["Pick hypothesis", 3],
      ["Design fix", 5],
      ["Ship + measure", 4],
      ["Readout", 3],
    ]),
    bestFor: "Squads that want CRO prioritisation, not another dashboard tab.",
    watchouts: [
      "Upstream funnel events still need discipline — vague inputs produce vague moves.",
      "Not a substitute for formal stats on high-traffic pricing experiments.",
      "Value shows up when teams actually ship the recommended interventions.",
    ],
    useWhen: "You need conversion analysis translated into fixes for this sprint.",
  },
  amplitude: {
    review:
      "Strong when PMs want journey templates and experiment hooks without writing SQL. We reach for it on larger product orgs that already have governance. Mixpanel is leaner for pure conversion squads; PostHog wins when you want self-hosting or session replay bundled.",
    metrics: [
      m("4–7 days", "Typical time-to-first funnel"),
      m("High", "CRO stack fit"),
      m("$0.32–$0.55", "Est. cost / 1k events"),
    ],
    chart: chart("Weeks to trusted activation read", " wks", [
      ["Spec events", 5.4],
      ["QA + deploy", 2.6],
      ["First funnel", 2.0],
      ["Retention slice", 2.2],
      ["Stakeholder sign-off", 2.1],
    ]),
    bestFor: "Cross-functional product teams running journeys and cohort studies.",
    watchouts: [
      "License tiers climb fast with MTU growth — model paywall volume early.",
      "Taxonomy drift hurts more here because journeys are pre-wired.",
      "Needs an owner; otherwise dashboards become shelfware.",
    ],
    useWhen: "Multiple squads share one analytics grammar and need guided analysis.",
  },
  posthog: {
    review:
      "The honest all-in-one for startups that refuse five vendors. Flags, funnels, and replay in one pipe keeps leak hunts fast. We still split to Mixpanel when event volume or governance outgrows a single UI, but PostHog is the best 'ship this week' analytics pick.",
    metrics: [
      m("2–4 days", "Typical time-to-first funnel"),
      m("Medium–high", "CRO stack fit"),
      m("$0.00–$0.35", "Est. cost / 1k events"),
    ],
    chart: chart("Weeks to trusted activation read", " wks", [
      ["Spec events", 4.1],
      ["QA + deploy", 1.8],
      ["First funnel", 1.2],
      ["Retention slice", 2.0],
      ["Stakeholder sign-off", 1.1],
    ]),
    bestFor: "Small teams that want analytics, flags, and replay without a CDP project.",
    watchouts: [
      "All-in-one can blur ownership — assign one person to event quality.",
      "Self-host ops cost is real; cloud is simpler for most CRO sprints.",
      "Replay storage adds up on high-traffic pages.",
    ],
    useWhen: "You need to test, watch sessions, and read funnels in the same afternoon.",
  },
  heap: {
    review:
      "Autocapture buys history when nobody wrote a spec — useful after a messy launch or acquisition. The bill and noise catch up quickly, so we treat Heap as a bridge, not the forever stack. Move to Mixpanel once you know which events actually predict conversion.",
    metrics: [
      m("1–3 days", "Typical time-to-first funnel"),
      m("Medium", "CRO stack fit"),
      m("$0.40–$0.70", "Est. cost / 1k events"),
    ],
    chart: chart("Weeks to trusted activation read", " wks", [
      ["Autocapture live", 0.8],
      ["Define retro events", 3.5],
      ["First funnel", 2.2],
      ["Retention slice", 3.1],
      ["Stakeholder sign-off", 2.4],
    ]),
    bestFor: "Retroactive funnels when instrumentation was skipped.",
    watchouts: [
      "PII in URLs and form fields — scrub before wide access.",
      "Event explosion makes dashboards slow and ambiguous.",
      "Retro definitions still need human judgment.",
    ],
    useWhen: "You need answers from past traffic while you write a real taxonomy.",
  },
  ga4: {
    review:
      "Keep GA4 for acquisition and channel quality, not as your product source of truth. BigQuery export helps, but session stitching and user identity are weaker than a product analytics tool. We pair GA4 with Mixpanel on almost every engagement.",
    metrics: [
      m("Same day", "Typical time-to-first funnel"),
      m("Medium (acq)", "CRO stack fit"),
      m("$0", "Est. cost / 1k events"),
    ],
    chart: chart("Weeks to trusted activation read", " wks", [
      ["Enhanced measure", 0.5],
      ["Custom events", 2.8],
      ["Explorations", 1.5],
      ["BQ export", 3.2],
      ["Stakeholder sign-off", 2.0],
    ]),
    bestFor: "Paid and organic traffic diagnostics tied to landing URLs.",
    watchouts: [
      "Sampling and thresholding hide small-segment leaks.",
      "Not built for account-level product retention.",
      "Consent mode gaps can silently drop conversion events.",
    ],
    useWhen: "The question is which campaigns and pages send qualified demand.",
  },
  fullstory: {
    review:
      "When a funnel step drops and you need session proof tied to the same user ID as analytics, FullStory is the premium option. Worth it on high-LTV flows where one leak pays for the license. Hotjar or Clarity cover lighter teams; FullStory wins on search and frustration signals at scale.",
    metrics: [
      m("18–28", "Sessions / leak sprint"),
      m("High", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Sessions reviewed per leak sprint", " sess", [
      ["Checkout drop", 24],
      ["Form rage", 19],
      ["Paywall stall", 31],
      ["Mobile nav", 14],
      ["Onboarding skip", 22],
    ]),
    bestFor: "High-value flows where qualitative proof must match event IDs.",
    watchouts: [
      "Masking rules must be tested — one leak of PII kills trust.",
      "Volume caps force sampling on big sites.",
      "Integrations need maintenance when your analytics taxonomy changes.",
    ],
    useWhen: "Stakeholders ask 'show me the session' on the same step the funnel flagged.",
  },
  hotjar: {
    review:
      "Fast heatmaps and recordings for landing and checkout leaks without enterprise procurement. We use it early in audits, then graduate to FullStory or Clarity+analytics when identity matters. Surveys are fine; do not confuse them with a research program.",
    metrics: [
      m("12–20", "Sessions / leak sprint"),
      m("Medium–high", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Sessions reviewed per leak sprint", " sess", [
      ["Landing scroll", 16],
      ["CTA dead zone", 12],
      ["Form abandon", 18],
      ["Mobile menu", 11],
      ["Pricing toggle", 9],
    ]),
    bestFor: "Marketing-led pages and quick visual evidence for stakeholders.",
    watchouts: [
      "Daily recording limits on lower tiers.",
      "Weak tie to logged-in product events without extra work.",
      "Heatmaps lie on dynamic SPAs without careful filtering.",
    ],
    useWhen: "You need screenshots and clips for a CRO readout this week.",
  },
  clarity: {
    review:
      "Free recordings and rage maps — no excuse to skip qualitative on a budget. We install it on almost every audit alongside paid analytics. Upgrade when you need SSO, deeper search, or tighter PII controls.",
    metrics: [
      m("10–16", "Sessions / leak sprint"),
      m("High (budget)", "CRO stack fit"),
      m("$0", "Pricing band"),
    ],
    chart: chart("Sessions reviewed per leak sprint", " sess", [
      ["Rage clicks", 14],
      ["Dead clicks", 11],
      ["Scroll depth", 8],
      ["Quick backs", 13],
      ["Form rage", 10],
    ]),
    bestFor: "Always-on leak hunting when budget is tight.",
    watchouts: [
      "Microsoft retention policies — export clips you need for reports.",
      "No native product analytics identity.",
      "Can lag on very heavy single-page apps.",
    ],
    useWhen: "You want continuous recordings without a line item fight.",
  },
  contentsquare: {
    review:
      "Enterprise journey scoring when marketing, product, and CX share one metric language. Heavy implementation, but strong for global brands justifying experience ROI. Overkill for a single landing test — use Hotjar or FullStory until complexity demands CSQ.",
    metrics: [
      m("22–35", "Sessions / leak sprint"),
      m("Medium", "CRO stack fit"),
      m("$$$$", "Pricing band"),
    ],
    chart: chart("Sessions reviewed per leak sprint", " sess", [
      ["Journey zone", 28],
      ["Struggle score", 33],
      ["Form friction", 21],
      ["Campaign LP", 26],
      ["App webview", 19],
    ]),
    bestFor: "Global teams aligning UX metrics with revenue reporting.",
    watchouts: [
      "Long implementation — plan quarters, not sprints.",
      "Tag weight affects vitals; coordinate with performance work.",
      "License complexity needs a dedicated admin.",
    ],
    useWhen: "Experience metrics must roll up to executive dashboards.",
  },
  mouseflow: {
    review:
      "Solid mid-market replay with form analytics baked in — good when the leak is field-level on lead gen. Not as deep as FullStory on product search, but faster to deploy than Contentsquare. Pair with Mixpanel on the same funnel step IDs.",
    metrics: [
      m("14–22", "Sessions / leak sprint"),
      m("Medium", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Sessions reviewed per leak sprint", " sess", [
      ["Field drop-off", 20],
      ["Hesitation", 17],
      ["Submit error", 15],
      ["Multi-step", 19],
      ["Mobile keyboard", 12],
    ]),
    bestFor: "Lead-gen and checkout forms where field timing matters.",
    watchouts: [
      "Form lists need maintenance when you redesign.",
      "Sampling on high traffic plans.",
      "Replay search is less flexible than FullStory.",
    ],
    useWhen: "The hypothesis is 'which field kills conversion' not generic rage.",
  },
  optimizely: {
    review:
      "Still the enterprise default for web experimentation when legal and stats review are formal. Implementation weight is real — we use it when traffic and governance justify a platform tax. GrowthBook or Statsig fit warehouse-native teams better.",
    metrics: [
      m("3–6 wks", "First shipped test"),
      m("High", "CRO stack fit"),
      m("$$$$", "Pricing band"),
    ],
    chart: chart("Days from hypothesis to live test", " days", [
      ["Brief + design", 8],
      ["Snippet QA", 5],
      ["Stats review", 6],
      ["Traffic live", 4],
      ["Readout", 7],
    ]),
    bestFor: "High-traffic sites with formal experiment governance.",
    watchouts: [
      "Flicker and snippet weight hurt LCP if poorly deployed.",
      "Feature vs web products split adds confusion.",
      "License cost punishes small wins.",
    ],
    useWhen: "Legal, stats, and marketing all need one approved experimentation surface.",
  },
  vwo: {
    review:
      "Practical CRO suite for teams that want tests, heatmaps, and personalization without Optimizely overhead. We like it on mid-market SaaS with clear landing and pricing tests. Statsig beats it when flags and warehouse metrics are central.",
    metrics: [
      m("2–4 wks", "First shipped test"),
      m("High", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Days from hypothesis to live test", " days", [
      ["Brief + design", 6],
      ["Snippet QA", 4],
      ["Stats review", 3],
      ["Traffic live", 3],
      ["Readout", 5],
    ]),
    bestFor: "Marketing-led CRO on sites and pricing pages.",
    watchouts: [
      "Personalization can outrun measurement discipline.",
      "Plan limits on concurrent tests.",
      "Integrate goals with analytics early or reads disagree.",
    ],
    useWhen: "You run continuous landing and checkout tests with one vendor.",
  },
  statsig: {
    review:
      "Our pick when experiments and flags should read from the warehouse, not a black-box metric. Strong for product teams shipping gated features. VWO is simpler for pure marketing A/B; LaunchDarkly if you only need flags without stats depth.",
    metrics: [
      m("1–3 wks", "First shipped test"),
      m("High", "CRO stack fit"),
      m("$$–$$$", "Pricing band"),
    ],
    chart: chart("Days from hypothesis to live test", " days", [
      ["Metric define", 4],
      ["Flag wiring", 3],
      ["QA buckets", 2],
      ["Traffic live", 2],
      ["Readout", 4],
    ]),
    bestFor: "Product experiments tied to warehouse or product analytics metrics.",
    watchouts: [
      "Needs clean assignment IDs — bad hashing invalidates reads.",
      "Requires dev ownership; not a marketer-only tool.",
      "Metric catalog work upfront pays off.",
    ],
    useWhen: "Engineering owns rollout and stats must match internal dashboards.",
  },
  launchdarkly: {
    review:
      "Gold standard for feature flags and gradual rollouts when experimentation is secondary. We pair it with Mixpanel for reads unless Statsig already covers both. Do not pretend flag toggles replace a measured test plan.",
    metrics: [
      m("1–2 wks", "First shipped test"),
      m("Medium", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Days from hypothesis to live test", " days", [
      ["Flag spec", 3],
      ["SDK wiring", 5],
      ["QA buckets", 2],
      ["Traffic live", 1],
      ["Readout", 6],
    ]),
    bestFor: "Safe rollouts and kill switches on production features.",
    watchouts: [
      "Flag debt accumulates — schedule cleanup.",
      "Experiment analysis is not its core strength.",
      "Seat and MAU pricing needs forecasting.",
    ],
    useWhen: "The primary risk is shipping broken code, not headline lift on a LP.",
  },
  growthbook: {
    review:
      "Open-source experimentation when you already pay for BigQuery and want stats without vendor lock-in. Dev-heavy setup, but CRO cost drops at scale. Not for teams without someone who can own YAML and SQL.",
    metrics: [
      m("2–5 wks", "First shipped test"),
      m("Medium–high", "CRO stack fit"),
      m("$–$$", "Pricing band"),
    ],
    chart: chart("Days from hypothesis to live test", " days", [
      ["Metric SQL", 7],
      ["SDK hook", 4],
      ["QA buckets", 3],
      ["Traffic live", 2],
      ["Readout", 5],
    ]),
    bestFor: "Data teams that want experiment stats on owned infrastructure.",
    watchouts: [
      "Self-host and upgrade burden is yours.",
      "UI polish lags commercial suites.",
      "Needs rigorous metric definitions in the warehouse.",
    ],
    useWhen: "Warehouse is source of truth and eng can maintain the stack.",
  },
  gtm: {
    review:
      "Necessary tag layer for most sites — but a graveyard of misfiring pixels if nobody owns it. We document every tag against a funnel map and use consent triggers religiously. Zaraz or server-side tags when client weight threatens vitals.",
    metrics: [
      m("2–5 days", "Tag deploy cycle"),
      m("Essential", "CRO stack fit"),
      m("$0", "Pricing band"),
    ],
    chart: chart("Days to deploy a tracked funnel step", " days", [
      ["Map event", 1],
      ["Build tag", 2],
      ["Consent path", 2],
      ["QA staging", 1],
      ["Prod verify", 1],
    ]),
    bestFor: "Coordinating analytics, ads, and consent without redeploying the site.",
    watchouts: [
      "Duplicate events when both GTM and hardcoded firing exist.",
      "Workspace sprawl — use naming conventions.",
      "Slows pages when tags multiply unchecked.",
    ],
    useWhen: "Marketing and product both need firing control without weekly releases.",
  },
  segment: {
    review:
      "Collect once, route everywhere — still the default CDP when stacks are messy. We use it to enforce one identify() call before events fan out to Mixpanel and ads. RudderStack wins on warehouse-first budgets; Segment wins on connector breadth.",
    metrics: [
      m("1–2 wks", "Tag deploy cycle"),
      m("High", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Days to deploy a tracked funnel step", " days", [
      ["Source map", 3],
      ["Identify plan", 4],
      ["Destinations", 5],
      ["QA staging", 2],
      ["Prod verify", 2],
    ]),
    bestFor: "Multi-destination tracking with one client-side contract.",
    watchouts: [
      "MTU billing surprises when anonymous traffic spikes.",
      "Bad identify() poisons every downstream tool.",
      "Debugging requires protocol discipline.",
    ],
    useWhen: "Three or more tools need the same events and user IDs.",
  },
  rudderstack: {
    review:
      "Warehouse-first routing without Segment pricing drama — good for teams already on BigQuery or Snowflake. More engineering than Segment, but you own the pipe. Use Segment if non-technical marketers must fix destinations daily.",
    metrics: [
      m("1–3 wks", "Tag deploy cycle"),
      m("Medium–high", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days to deploy a tracked funnel step", " days", [
      ["Source map", 4],
      ["Warehouse schema", 6],
      ["Destinations", 4],
      ["QA staging", 3],
      ["Prod verify", 2],
    ]),
    bestFor: "Event pipelines that land in a warehouse before analytics tools.",
    watchouts: [
      "Transform code needs review like product code.",
      "Self-hosted ops if you choose that path.",
      "Fewer 'marketer-friendly' guardrails.",
    ],
    useWhen: "The warehouse is the system of record for conversion metrics.",
  },
  zaraz: {
    review:
      "Server-side tags on Cloudflare when client GTM weight shows up in PSI and real users bounce. Not a full CDP — pair with product analytics separately. Best for performance-sensitive landing pages with many third-party pixels.",
    metrics: [
      m("3–7 days", "Tag deploy cycle"),
      m("Medium", "CRO stack fit"),
      m("$–$$", "Pricing band"),
    ],
    chart: chart("Days to deploy a tracked funnel step", " days", [
      ["Map event", 2],
      ["Server tool", 3],
      ["Consent path", 2],
      ["QA staging", 2],
      ["Prod verify", 1],
    ]),
    bestFor: "Cutting client JS while keeping ad and analytics firing.",
    watchouts: [
      "Not every GTM tag has a server equivalent.",
      "Debugging is harder than browser DevTools.",
      "Cloudflare coupling — know your DNS story.",
    ],
    useWhen: "Vitals regressions trace to tag bloat on paid landing pages.",
  },
  "search-console": {
    review:
      "Ground truth for queries and pages that already earn impressions — before you spend on content or fixes. We pull GSC weekly into leak reviews alongside GA4 landing data. Pair with Ahrefs when you need competitive gaps, not just your own graph.",
    metrics: [
      m("2–4 hrs", "Time-to-first insight"),
      m("High (SEO)", "CRO stack fit"),
      m("$0", "Pricing band"),
    ],
    chart: chart("Hours to actionable traffic read", " hrs", [
      ["Verify property", 1],
      ["Index coverage", 2],
      ["Query export", 1],
      ["Page cohort", 3],
      ["Brief stakeholders", 2],
    ]),
    bestFor: "Finding demand you already rank for but under-convert.",
    watchouts: [
      "Four-day data lag on queries.",
      "Sampling on low-volume pages.",
      "Not a rank tracker — use Ahrefs/Semrush for that.",
    ],
    useWhen: "The question is which existing URLs deserve CRO or content investment.",
  },
  ahrefs: {
    review:
      "Competitive organic intelligence — where rivals steal clicks and which pages to build or fix. We use it to prioritize landing work that already has search intent. Semrush overlaps; Ahrefs feels sharper on link and content gaps for our clients.",
    metrics: [
      m("4–8 hrs", "Time-to-first insight"),
      m("High (SEO)", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Hours to actionable traffic read", " hrs", [
      ["Site audit", 3],
      ["Gap list", 4],
      ["Page targets", 2],
      ["SERP check", 2],
      ["Brief stakeholders", 3],
    ]),
    bestFor: "Content and SEO-led growth with clear keyword targets.",
    watchouts: [
      "Credits and seat limits on lower plans.",
      "Rank estimates ≠ your GSC reality — triangulate.",
      "Easy to chase volume over conversion intent.",
    ],
    useWhen: "You need competitor URLs and keywords to feed the CRO backlog.",
  },
  similarweb: {
    review:
      "Channel mix and referral quality when evaluating markets or partners — not for daily ops. Helpful in pitch and strategy phases before you commit spend. Plausible or GA4 handle your own site; Similarweb sizes the pond.",
    metrics: [
      m("6–12 hrs", "Time-to-first insight"),
      m("Medium", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Hours to actionable traffic read", " hrs", [
      ["Comp set", 4],
      ["Channel split", 3],
      ["Referral scan", 5],
      ["Geo slice", 4],
      ["Brief stakeholders", 4],
    ]),
    bestFor: "Benchmarking competitors and sizing channels.",
    watchouts: [
      "Estimates, not your analytics — treat as directional.",
      "Enterprise pricing for full exports.",
      "Can distract from fixing your own funnel.",
    ],
    useWhen: "Leadership asks 'how big is their paid vs organic' before budget.",
  },
  semrush: {
    review:
      "Broader marketing suite — keywords, ads, and site audits in one subscription. We use it when SEO and paid search share one team. Ahrefs is leaner for pure SEO depth; Semrush wins on PPC keyword overlap.",
    metrics: [
      m("5–10 hrs", "Time-to-first insight"),
      m("Medium–high", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Hours to actionable traffic read", " hrs", [
      ["Site audit", 3],
      ["Keyword map", 4],
      ["Ad copies", 3],
      ["Page targets", 3],
      ["Brief stakeholders", 3],
    ]),
    bestFor: "Teams running SEO and paid search off one research tool.",
    watchouts: [
      "Feature overload — narrow the workflow.",
      "Data freshness varies by module.",
      "Easy to export lists nobody acts on.",
    ],
    useWhen: "You need keyword, ad, and page intel in one weekly ritual.",
  },
  plausible: {
    review:
      "Lightweight, privacy-first traffic when GA4 feels heavy or legally awkward. Good for marketing sites and microsites — not for product funnels. We still add Mixpanel when events matter more than pageviews.",
    metrics: [
      m("1–2 hrs", "Time-to-first insight"),
      m("Medium (acq)", "CRO stack fit"),
      m("$–$$", "Pricing band"),
    ],
    chart: chart("Hours to actionable traffic read", " hrs", [
      ["Install snippet", 1],
      ["Goals map", 1],
      ["UTM review", 2],
      ["Page cohort", 1],
      ["Brief stakeholders", 1],
    ]),
    bestFor: "Simple, defensible traffic stats on marketing properties.",
    watchouts: [
      "No product retention or user-level journeys.",
      "Goal limits on smaller plans.",
      "Not a replacement for consent-heavy ad attribution.",
    ],
    useWhen: "Stakeholders want clean traffic without cookie-banner complexity.",
  },
  maze: {
    review:
      "Unmoderated tests on prototypes and live URLs — fast signal before you burn dev on the wrong fix. We run maze on checkout copy and nav, not to replace analytics. UserTesting adds voice when stakes are high.",
    metrics: [
      m("3–5 days", "Time-to-first insight"),
      m("High", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days to research-backed decision", " days", [
      ["Task design", 1],
      ["Recruit", 2],
      ["Run study", 1],
      ["Synthesis", 1],
      ["Share readout", 1],
    ]),
    bestFor: "Validating flows before or after a quantitative leak flags.",
    watchouts: [
      "Panel quality varies — screen for ICP fit.",
      "Prototype fidelity changes results.",
      "Success metrics must tie back to funnel steps.",
    ],
    useWhen: "You need 20–40 task completions on a specific UI change.",
  },
  dovetail: {
    review:
      "Research repository when interviews pile up and nobody can find the clip that proves the leak. Tag insights next to hypotheses so CRO decks cite real quotes. Not for quick unmoderated — Maze covers that.",
    metrics: [
      m("1–2 wks", "Time-to-first insight"),
      m("Medium", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days to research-backed decision", " days", [
      ["Import calls", 3],
      ["Tag themes", 4],
      ["Link hypothesis", 2],
      ["Clip reel", 2],
      ["Share readout", 2],
    ]),
    bestFor: "Teams running continuous interviews across squads.",
    watchouts: [
      "Repository rot without tagging discipline.",
      "License per seat adds up.",
      "Not a substitute for quantitative priority.",
    ],
    useWhen: "Qual evidence must survive turnover and feed the experiment backlog.",
  },
  usertesting: {
    review:
      "Panel voice when a leak is emotional or high stakes — pricing, trust, onboarding confusion. Slower and pricier than Maze, but nothing replaces hearing hesitation on a paywall. Book sessions after analytics names the step.",
    metrics: [
      m("5–8 days", "Time-to-first insight"),
      m("Medium–high", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Days to research-backed decision", " days", [
      ["Screener", 2],
      ["Recruit", 3],
      ["Moderated", 2],
      ["Synthesis", 2],
      ["Share readout", 1],
    ]),
    bestFor: "Moderated sessions with ICP match on sensitive flows.",
    watchouts: [
      "Panel ≠ your users unless screened tightly.",
      "Clip cherry-picking bias in decks.",
      "Cost per session limits breadth.",
    ],
    useWhen: "Leadership needs to hear a user struggle on the exact conversion step.",
  },
  lookback: {
    review:
      "Live interviews on the real product — great for mobile and auth flows hard to prototype. We use it in discovery sprints before instrumentation is perfect. Dovetail stores the outputs; Lookback captures the session.",
    metrics: [
      m("4–7 days", "Time-to-first insight"),
      m("Medium", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days to research-backed decision", " days", [
      ["Schedule", 2],
      ["Live session", 1],
      ["Clips", 2],
      ["Synthesis", 2],
      ["Share readout", 1],
    ]),
    bestFor: "Remote moderated research on production builds.",
    watchouts: [
      "Recording consent and NDAs on beta features.",
      "Mobile capture quirks.",
      "Needs facilitator skill for unbiased prompts.",
    ],
    useWhen: "The bug is reproduction friction, not abstract preference.",
  },
  sprig: {
    review:
      "Microsurveys fired on the stall moment — pricing hesitation, onboarding skip — with enough targeting to avoid spam. Response rates beat email when tied to product events. Typeform for long surveys; Sprig for in-context why.",
    metrics: [
      m("12–22%", "Typical response rate"),
      m("High", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Response rate by prompt type", "%", [
      ["Exit intent", 8],
      ["Step stall", 19],
      ["Post-purchase", 24],
      ["Feature discover", 14],
      ["NPS micro", 11],
    ]),
    bestFor: "Short 'why did you stop' prompts on specific funnel steps.",
    watchouts: [
      "Over-targeting annoys power users.",
      "Needs event hooks from analytics.",
      "Sample bias — weight against funnel volume.",
    ],
    useWhen: "Quant shows a drop and you need a reason code within days.",
  },
  pendo: {
    review:
      "In-app guides and NPS when product marketing owns the layer inside the app. Can mask weak activation if guides replace fixing the flow. We prefer fixing the step, then Pendo for reinforcement and surveys.",
    metrics: [
      m("8–16%", "Typical response rate"),
      m("Medium", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Response rate by prompt type", "%", [
      ["Guide step", 6],
      ["In-app NPS", 12],
      ["Feature poll", 15],
      ["Onboarding tip", 9],
      ["Release note", 7],
    ]),
    bestFor: "PLG apps needing guides, polls, and usage analytics together.",
    watchouts: [
      "Guide fatigue hurts activation metrics.",
      "MAU pricing on growing products.",
      "Analytics depth below dedicated product tools.",
    ],
    useWhen: "CS and PM need in-app messaging tied to behavior segments.",
  },
  typeform: {
    review:
      "Longer surveys and lead qual when you need structured answers beyond a one-click microsurvey. Good for waitlists and research recruiting. Do not use it mid-checkout unless you enjoy abandon spikes.",
    metrics: [
      m("18–35%", "Typical response rate"),
      m("Medium", "CRO stack fit"),
      m("$–$$", "Pricing band"),
    ],
    chart: chart("Response rate by prompt type", "%", [
      ["Email invite", 22],
      ["Post-demo", 31],
      ["Waitlist", 28],
      ["Churn survey", 14],
      ["Panel recruit", 19],
    ]),
    bestFor: "Multi-question flows off-product or after conversion.",
    watchouts: [
      "Embedding in funnel adds friction.",
      "Integrations need Zapier or API maintenance.",
      "Brand feel ≠ your app UI — set expectations.",
    ],
    useWhen: "You need ten questions, logic jumps, and clean exports.",
  },
  appcues: {
    review:
      "Checklists and tooltips for onboarding — fine as reinforcement, fatal as a substitute for a clear aha. We audit whether the step should exist before wiring Appcues. Pendo overlaps; Appcues feels lighter for pure onboarding tours.",
    metrics: [
      m("6–14%", "Typical response rate"),
      m("Medium", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Response rate by prompt type", "%", [
      ["Checklist", 10],
      ["Tooltip", 5],
      ["Slideout", 8],
      ["Survey", 13],
      ["Pin", 6],
    ]),
    bestFor: "Guided first-run without a full PM suite.",
    watchouts: [
      "Tooltip walls increase time-to-value.",
      "Hard to measure true lift vs annoyance.",
      "Must sync with feature flags on redesigns.",
    ],
    useWhen: "Activation is close but users miss one obvious control.",
  },
  sentry: {
    review:
      "Errors that silently kill checkout or signup — Sentry catches them when analytics only shows drop-off. Wire release and user context so replays align with sessions. LogRocket overlaps on replay; Sentry wins on error grouping at scale.",
    metrics: [
      m("2.5–6 hrs", "Mean time to detect"),
      m("High", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Hours from error to triage", " hrs", [
      ["Alert fire", 0.3],
      ["Reproduce", 1.2],
      ["Owner assign", 0.8],
      ["Hotfix", 3.5],
      ["Verify conv.", 1.1],
    ]),
    bestFor: "Production JS and API failures on conversion paths.",
    watchouts: [
      "Noise without release tagging and ownership rules.",
      "PII in breadcrumbs — scrub configs.",
      "Quota spikes during bad deploys.",
    ],
    useWhen: "Funnel drops coincide with deploys or browser console errors.",
  },
  "speed-insights": {
    review:
      "CrUX and PSI ground vitals in field data — slow LCP on mobile leaks paid traffic before analytics blames copy. We screenshot PSI deltas beside CRO tickets. Not a monitor replacement for Sentry; vitals and errors stack together.",
    metrics: [
      m("1–3 hrs", "Mean time to detect"),
      m("High", "CRO stack fit"),
      m("$0", "Pricing band"),
    ],
    chart: chart("Hours from error to triage", " hrs", [
      ["Run PSI", 0.5],
      ["CrUX pull", 1],
      ["Compare LP", 1.5],
      ["Ticket file", 0.5],
      ["Verify conv.", 2.0],
    ]),
    bestFor: "Proving performance regressions on landing and checkout URLs.",
    watchouts: [
      "Lab scores ≠ field — prioritize CrUX.",
      "Third-party tags often the culprit — pair with GTM/Zaraz audit.",
      "One-off tests lie — track trends.",
    ],
    useWhen: "Media spend hits pages with weakening mobile LCP or INP.",
  },
  logrocket: {
    review:
      "Replay plus console when errors are intermittent and Sentry alone cannot reproduce. Heavier than Clarity, tighter dev focus. We use it on checkout integrations and third-party widgets. FullStory is stronger for pure UX research teams.",
    metrics: [
      m("3–8 hrs", "Mean time to detect"),
      m("Medium–high", "CRO stack fit"),
      m("$$$", "Pricing band"),
    ],
    chart: chart("Hours from error to triage", " hrs", [
      ["Alert fire", 0.5],
      ["Session find", 1.5],
      ["Reproduce", 2.0],
      ["Hotfix", 4.0],
      ["Verify conv.", 1.2],
    ]),
    bestFor: "Debugging flaky client issues on monetization flows.",
    watchouts: [
      "Session volume pricing.",
      "PII masking configuration is mandatory.",
      "Overlap with analytics — align user IDs.",
    ],
    useWhen: "Support says 'it broke' but logs show nothing obvious.",
  },
};

export function getToolDetails(slug: string): ToolDetailFields | undefined {
  return TOOL_DETAILS[slug];
}
