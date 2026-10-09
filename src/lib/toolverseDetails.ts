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
      "Our default event layer when the team already names funnel steps and needs retention reads without a warehouse project. Mixpanel pays off once signup → activation → paywall events are stable — until then you are paying for dashboards nobody trusts. Pick Amplitude if product ops wants guided journeys out of the box; PostHog if you want flags and replay on the same bill.\n\nHow we actually use it: name 15–40 events that map to money (signup, first value, paywall view, checkout start, purchase) and ignore the rest until those are stable for two weeks. Build one activation funnel and one retention cohort before anyone gets a custom board. If a report disagrees with Stripe or the warehouse, the event is wrong — fix the event, do not add another chart.\n\n\n\nWhat a user should do in the first week: write the event list with the PM, QA it on staging with the real user id, then ship one funnel the growth lead will open every Monday. Mixpanel is the wrong buy if nobody will maintain the taxonomy; you will pay for dashboards the team stops trusting by month two.",
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
    bestFor: "Product-led funnels where event names map to revenue steps. Squads that already know the steps between visit and revenue and will keep those event names stable.",
    watchouts: [
      "Garbage event names compound — audit the taxonomy before scaling reports.",
      "Identity merges across domains need a plan or cohorts lie.",
      "Heavy autocapture temptations; resist unless you have a cleanup sprint.",
      "Do not mirror every GA4 pageview into Mixpanel — you pay for noise and hide the conversion steps.",
      "Anonymous-to-logged-in merges need a written rule or week-1 and week-4 cohorts will not match.",
      "Give edit rights to one owner. Shared 'quick boards' become the reason nobody believes the numbers.",
    ],
    useWhen: "You will instrument 15–40 named events and iterate weekly on activation. You can staff a weekly readout and you would rather argue about the funnel than about which tool to open.",
  },
  boostra: {
    review:
      "Our pick when the bottleneck is not missing data but missing action — conversion signal needs to collapse into a sprint-sized list you can ship. We built and designed Boostra around that loop: find the stall, propose the fix, measure the lift. Keep Mixpanel or PostHog as the event layer; reach for VWO or Statsig when you need heavyweight client-side experiment stats on top.\n\nBoostra is the decision layer, not the measurement layer. It is useful when the team already has traffic and recordings and still ships too slowly because every leak turns into a debate. We use it to collapse a messy funnel into a short list: what is stalling, which fix is worth this sprint, and how you will know it worked. Keep Mixpanel, GA4, or PostHog underneath so the recommendation is tied to a real step, not a vibe.\n\n\n\nA good first use is one revenue flow — pricing, checkout, or activation — not the whole site. Bring the last month of drop-off, two or three session clips, and the constraint (what you can actually ship). If the output is not a test or a UI change with a metric, you used it as another dashboard. It will not replace a statistician on a high-traffic price test; pair it with Statsig or VWO when the decision is 'ship the variant' rather than 'what should we try'.",
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
    bestFor: "Squads that want CRO prioritisation, not another dashboard tab. Teams that have data and still cannot agree what to build next.",
    watchouts: [
      "Upstream funnel events still need discipline — vague inputs produce vague moves.",
      "Not a substitute for formal stats on high-traffic pricing experiments.",
      "Value shows up when teams actually ship the recommended interventions.",
      "Vague upstream events produce vague recommendations — fix names before you scale the loop.",
      "Do not treat it as a substitute for sample-size math on pricing or checkout.",
      "Value disappears if the recommended fixes stay in a doc. Assign an owner and a ship date.",
    ],
    useWhen: "You need conversion analysis translated into fixes for this sprint. The bottleneck is prioritisation and shipping, and you want a sprint-sized list instead of a 40-page audit.",
  },
  amplitude: {
    review:
      "Strong when PMs want journey templates and experiment hooks without writing SQL. We reach for it on larger product orgs that already have governance. Mixpanel is leaner for pure conversion squads; PostHog wins when you want self-hosting or session replay bundled.\n\nUse Amplitude when several squads need the same journey language and you do not want every PM writing SQL. The product pays off after someone owns the taxonomy: the same signup, activation, and habit events across boards. We start with one north-star path and one experiment metric, then add cohorts. Guided journeys are a feature only if the underlying events are true.\n\n\n\nBudget for MTU before you fall in love with the UI. A free-looking pilot becomes expensive the month paid acquisition works. If you are a single CRO squad that only needs funnels, Mixpanel is leaner. If you also want flags and replay on one bill, PostHog is the better default. Amplitude wins when governance, journeys, and a shared catalog matter more than speed of setup.",
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
    bestFor: "Cross-functional product teams running journeys and cohort studies. Product orgs where more than one squad reads the same activation and retention story.",
    watchouts: [
      "License tiers climb fast with MTU growth — model paywall volume early.",
      "Taxonomy drift hurts more here because journeys are pre-wired.",
      "Needs an owner; otherwise dashboards become shelfware.",
      "Model MTU against paywall and marketing spikes before you sign an annual plan.",
      "Pre-built journeys amplify a bad taxonomy — they do not fix it.",
      "Without a named owner, the workspace fills with duplicate charts and the team goes back to spreadsheets.",
    ],
    useWhen: "Multiple squads share one analytics grammar and need guided analysis. You have an analytics owner and you need journeys and cohorts without standing up a warehouse project first.",
  },
  posthog: {
    review:
      "The honest all-in-one for startups that refuse five vendors. Flags, funnels, and replay in one pipe keeps leak hunts fast. We still split to Mixpanel when event volume or governance outgrows a single UI, but PostHog is the best 'ship this week' analytics pick.\n\nPostHog is the stack we recommend when a small team is about to buy analytics, a flag tool, and a replay tool separately. One pipe means the person debugging a paywall can see the funnel, the flag, and the session without a CDP project. Start in cloud unless you already have someone who wants to run the infrastructure. Self-host is a real ops cost, not a free lunch.\n\n\n\nInstrument a short event list anyway. Autocapture and replay will tempt you to skip the spec, and then every 'insight' is a guess. Assign one person to event quality. Split to Mixpanel or Amplitude when governance, identity, or event volume outgrows a single UI — not because the all-in-one is unfashionable, but because the bill and the noise will.",
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
    bestFor: "Small teams that want analytics, flags, and replay without a CDP project. Startups that need funnels, flags, and replay this month and will not staff a data platform team.",
    watchouts: [
      "All-in-one can blur ownership — assign one person to event quality.",
      "Self-host ops cost is real; cloud is simpler for most CRO sprints.",
      "Replay storage adds up on high-traffic pages.",
      "Replay storage grows with traffic. Sample marketing pages or you will pay to store bounces.",
      "All-in-one blurs ownership. One person still has to say which events are canonical.",
      "Feature flags without a metric and a stop date become permanent product forks.",
    ],
    useWhen: "You need to test, watch sessions, and read funnels in the same afternoon. You want to ship a test, watch the broken session, and read the funnel in the same afternoon.",
  },
  heap: {
    review:
      "Autocapture buys history when nobody wrote a spec — useful after a messy launch or acquisition. The bill and noise catch up quickly, so we treat Heap as a bridge, not the forever stack. Move to Mixpanel once you know which events actually predict conversion.\n\nHeap is a bridge. Turn it on when a launch already happened and you need to ask 'what did people click' about traffic you cannot get back. Define a handful of retroactive events that match the conversion question, answer that question, and write the real taxonomy for Mixpanel or PostHog. Do not let autocapture become the system of record. The event list explodes, the UI slows down, and every stakeholder builds a slightly different funnel.\n\n\n\nScrub URLs and form fields before you invite the whole company. Autocapture will happily store emails, tokens, and search queries. Treat that as a launch blocker, not a later cleanup.",
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
    bestFor: "Retroactive funnels when instrumentation was skipped. Teams that skipped instrumentation and still need a defensible read on traffic that already happened.",
    watchouts: [
      "PII in URLs and form fields — scrub before wide access.",
      "Event explosion makes dashboards slow and ambiguous.",
      "Retro definitions still need human judgment.",
      "Set a sunset date. Heap-as-forever is how you end up with an unsearchable event pile.",
      "Retro labels still need a human. 'Clicked div' is not a conversion step.",
      "Confirm what is captured in production with a privacy review before wide access.",
    ],
    useWhen: "You need answers from past traffic while you write a real taxonomy. You are writing a real event spec in parallel and you need history only for this audit or this quarter.",
  },
  ga4: {
    review:
      "Keep GA4 for acquisition and channel quality, not as your product source of truth. BigQuery export helps, but session stitching and user identity are weaker than a product analytics tool. We pair GA4 with Mixpanel on almost every engagement.\n\nKeep GA4 for the question it is good at: which campaigns, channels, and landing URLs send people who then convert. It is a weak product warehouse. Session stitching, user identity, and account-level retention will mislead you if you try to run activation out of Explorations. On almost every engagement we pair GA4 with a product tool and, when the numbers must be audited, a BigQuery export.\n\n\n\nTurn on consent mode on purpose and check that purchase and lead events still arrive. A 'clean' GA4 property after a consent rollout is often just a property that stopped counting. Use it in the Monday growth review for acquisition quality, not as the argument for which in-product step to redesign.",
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
    bestFor: "Paid and organic traffic diagnostics tied to landing URLs. Reading paid and organic demand down to the landing URL, then handing the leak to a product analytics tool.",
    watchouts: [
      "Sampling and thresholding hide small-segment leaks.",
      "Not built for account-level product retention.",
      "Consent mode gaps can silently drop conversion events.",
      "Sampling and thresholding hide the small segments where the leak actually lives.",
      "Do not build account retention or B2B funnel truth in GA4. You will fight the data model.",
      "After a consent change, reconcile conversions against the CRM or Stripe before you trust a drop.",
    ],
    useWhen: "The question is which campaigns and pages send qualified demand. The argument is about channel and page quality, and you already have — or will add — a separate event layer for the product.",
  },
  fullstory: {
    review:
      "When a funnel step drops and you need session proof tied to the same user ID as analytics, FullStory is the premium option. Worth it on high-LTV flows where one leak pays for the license. Hotjar or Clarity cover lighter teams; FullStory wins on search and frustration signals at scale.\n\nFullStory earns its price when a high-value step drops and someone senior says 'show me'. Search by the same user or account id you use in analytics, filter to the funnel step, and watch frustration signals instead of random sessions. We use it on checkout, billing, and onboarding — places where one fixed leak pays for the license. Hotjar or Clarity are enough when you only need a landing-page heatmap.\n\n\n\nWrite masking rules and test them with a fake card and a fake email before you invite stakeholders. One leaked recording ends the program. Also plan for volume caps: on a busy marketing site you will sample, so pin the capture to the flows that make money.",
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
    bestFor: "High-value flows where qualitative proof must match event IDs. High-LTV flows where a session has to match the same user the funnel chart is talking about.",
    watchouts: [
      "Masking rules must be tested — one leak of PII kills trust.",
      "Volume caps force sampling on big sites.",
      "Integrations need maintenance when your analytics taxonomy changes.",
      "Re-test masking after every redesign. New fields slip into recordings.",
      "If analytics taxonomy changes, update the FullStory integration or search will lie.",
      "Do not boil the ocean. Ten sessions on the leaking step beat a hundred random ones.",
    ],
    useWhen: "Stakeholders ask 'show me the session' on the same step the funnel flagged. Stakeholders will not approve a fix without seeing the broken session on that exact step.",
  },
  hotjar: {
    review:
      "Fast heatmaps and recordings for landing and checkout leaks without enterprise procurement. We use it early in audits, then graduate to FullStory or Clarity+analytics when identity matters. Surveys are fine; do not confuse them with a research program.\n\nHotjar is the fastest way to put a picture next to a landing or checkout number. Heatmaps, a short recording sample, and an on-page question will get a skeptical stakeholder to look at the page instead of the deck. We use it in the first audit week, then move identity-heavy product work to FullStory or Clarity plus analytics.\n\n\n\nFilter recordings. A heatmap of a single-page app with no URL rules will blend three flows into one lie. Surveys are a signal, not a research program — five open-text answers do not replace a Maze test or a UserTesting session. Daily caps on lower plans mean you should trigger capture on the leaking URL, not the whole domain.",
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
    bestFor: "Marketing-led pages and quick visual evidence for stakeholders. Marketing pages and simple checkouts where visual evidence has to land this week.",
    watchouts: [
      "Daily recording limits on lower tiers.",
      "Weak tie to logged-in product events without extra work.",
      "Heatmaps lie on dynamic SPAs without careful filtering.",
      "SPA heatmaps need URL or event filters or you will 'prove' a problem that is three pages mixed together.",
      "Recording limits fill up with bounces if you do not target the money URL.",
      "Do not let a survey widget itself become the conversion leak. Keep it off the primary CTA path.",
    ],
    useWhen: "You need screenshots and clips for a CRO readout this week. You need clips and a scroll map for a readout, and logged-in identity is not the point yet.",
  },
  clarity: {
    review:
      "Free recordings and rage maps — no excuse to skip qualitative on a budget. We install it on almost every audit alongside paid analytics. Upgrade when you need SSO, deeper search, or tighter PII controls.\n\nClarity is the default we install when a team says they cannot afford replay. Rage clicks, dead clicks, and quick backs are enough to find the first leak on a marketing site or a simple app. It will not join a logged-in user to a Mixpanel funnel. That is fine for the audit. Upgrade when you need SSO, stricter retention, or search across identified accounts.\n\n\n\nExport the clips you will put in a readout. Retention is not under your control the way a paid suite is. On heavy single-page apps, give it a day and confirm events actually arrive before you promise stakeholders a library of recordings.",
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
    bestFor: "Always-on leak hunting when budget is tight. Always-on leak hunting on a budget, especially marketing sites and early product surfaces.",
    watchouts: [
      "Microsoft retention policies — export clips you need for reports.",
      "No native product analytics identity.",
      "Can lag on very heavy single-page apps.",
      "Export anything you need for a client or board report. Do not assume the clip will still be there.",
      "Pair it with product analytics. Clarity will not tell you the revenue step, only the rage.",
      "Check SPA coverage. If the app swaps views without a load, you may be watching the wrong moment.",
    ],
    useWhen: "You want continuous recordings without a line item fight. You want continuous recordings without a procurement fight, and you can live without deep identity search.",
  },
  contentsquare: {
    review:
      "Enterprise journey scoring when marketing, product, and CX share one metric language. Heavy implementation, but strong for global brands justifying experience ROI. Overkill for a single landing test — use Hotjar or FullStory until complexity demands CSQ.\n\nContentsquare is for organisations that need one experience score in an executive pack, not for a team trying to ship a landing test this month. Zone-based analytics, frustration, and revenue impact are powerful once implementation, privacy, and tag weight are owned. Plan in quarters. If you only have one site and one CRO person, Hotjar or FullStory will get you to a fix sooner.\n\n\n\nCoordinate with performance. The tag is not free. A journey score that slows the landing page is a conversion problem you paid to create. Give it an admin. License and zoning complexity will rot if it is everyone's side project.",
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
    bestFor: "Global teams aligning UX metrics with revenue reporting. Global brands that must roll experience quality up next to revenue, with a team to implement it.",
    watchouts: [
      "Long implementation — plan quarters, not sprints.",
      "Tag weight affects vitals; coordinate with performance work.",
      "License complexity needs a dedicated admin.",
      "Do not buy it for a single landing test. The implementation will outlast the test.",
      "Budget tag weight against LCP before you turn every zone on.",
      "Without a dedicated admin, zones go stale the first time the design system changes.",
    ],
    useWhen: "Experience metrics must roll up to executive dashboards. Heatmaps are no longer enough and leadership wants a shared metric, not another vendor tab.",
  },
  mouseflow: {
    review:
      "Solid mid-market replay with form analytics baked in — good when the leak is field-level on lead gen. Not as deep as FullStory on product search, but faster to deploy than Contentsquare. Pair with Mixpanel on the same funnel step IDs.\n\nMouseflow is the practical pick when the leak is a form, not a mysterious product journey. Field timing, refills, and drop-off on the same recording tell you whether people stall on phone, card, or the legal checkbox. Pair the form step with the same id you use in Mixpanel so the chart and the clip describe one moment.\n\n\n\nRebuild the form analytics list when you redesign. Old field names silently stop matching and you will brief the wrong fix. Search is less flexible than FullStory, so go in with a hypothesis ('which field') instead of browsing.",
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
    bestFor: "Lead-gen and checkout forms where field timing matters. Lead-gen and checkout forms where the question is which field, not which page.",
    watchouts: [
      "Form lists need maintenance when you redesign.",
      "Sampling on high traffic plans.",
      "Replay search is less flexible than FullStory.",
      "Update field mapping after every form change or the drop-off chart will blame a field that no longer exists.",
      "High-traffic plans sample. Confirm you are watching the form, not a random slice of the homepage.",
      "Do not expect product-grade event search. Bring the step id with you.",
    ],
    useWhen: "The hypothesis is 'which field kills conversion' not generic rage. You can point at a form and you need field-level proof before you redraw the whole flow.",
  },
  optimizely: {
    review:
      "Still the enterprise default for web experimentation when legal and stats review are formal. Implementation weight is real — we use it when traffic and governance justify a platform tax. GrowthBook or Statsig fit warehouse-native teams better.\n\nOptimizely still fits when traffic is large and legal, brand, and stats all need a system of record for tests. The tax is implementation: snippet weight, flicker, and a long path from idea to live. We use it when that governance is a requirement, not a personality preference. Warehouse-native teams usually move faster on Statsig or GrowthBook.\n\n\n\nIf you deploy the snippet, measure LCP before and after. A winning headline that slows the page can lose money. Keep web experiments and feature experiments from becoming two religions inside the same company — write which surface owns which class of test.",
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
    bestFor: "High-traffic sites with formal experiment governance. High-traffic sites that already have an experiment council and need an approved place to run tests.",
    watchouts: [
      "Flicker and snippet weight hurt LCP if poorly deployed.",
      "Feature vs web products split adds confusion.",
      "License cost punishes small wins.",
      "Audit flicker and snippet weight. A slow test page is not a fair test.",
      "License cost makes small, frequent tests feel expensive. Batch governance, not ideas.",
      "Do not run the same change in the web snippet and in a feature flag without one source of assignment.",
    ],
    useWhen: "Legal, stats, and marketing all need one approved experimentation surface. Legal, stats, and marketing will not accept a lighter tool, and you have the traffic to feed it.",
  },
  vwo: {
    review:
      "Practical CRO suite for teams that want tests, heatmaps, and personalization without Optimizely overhead. We like it on mid-market SaaS with clear landing and pricing tests. Statsig beats it when flags and warehouse metrics are central.\n\nVWO is the mid-market CRO suite: tests, heatmaps, and personalization without the Optimizely procurement cycle. It is a good home for landing, pricing, and checkout tests run by a marketing-led team. Wire goals to the same conversion event as analytics on day one or the VWO readout and the Mixpanel readout will argue forever.\n\n\n\nPersonalization is the trap. Segments feel productive and then you cannot tell what actually won. Cap concurrent tests, write a primary metric, and stop a personalization that you cannot explain in one sentence.",
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
    bestFor: "Marketing-led CRO on sites and pricing pages. Teams running a steady stream of landing and pricing tests who want insights in the same vendor.",
    watchouts: [
      "Personalization can outrun measurement discipline.",
      "Plan limits on concurrent tests.",
      "Integrate goals with analytics early or reads disagree.",
      "Connect goals to analytics before the first test or you will 'win' in one tool and lose in another.",
      "Plan limits on concurrent tests are a feature. Use them.",
      "Personalization without a holdout is just unmeasured UI.",
    ],
    useWhen: "You run continuous landing and checkout tests with one vendor. You want one CRO suite and you do not need warehouse-native stats as the source of truth.",
  },
  statsig: {
    review:
      "Our pick when experiments and flags should read from the warehouse, not a black-box metric. Strong for product teams shipping gated features. VWO is simpler for pure marketing A/B; LaunchDarkly if you only need flags without stats depth.\n\nStatsig is the pick when engineering owns rollout and the metric must match the warehouse or product analytics, not a vendor's black box. Define the metric and the assignment id before you build the flag. A hashed id that does not match the analytics user id will produce a confident, wrong readout.\n\n\n\nIt is not a marketer-only tool. Someone has to wire the SDK, QA buckets, and keep the metric catalog honest. If the work is purely a marketing landing test and nobody wants to touch code, VWO is simpler. If you only need kill switches and not stats, LaunchDarkly is enough.",
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
    bestFor: "Product experiments tied to warehouse or product analytics metrics. Product teams shipping gated features who will read results in the same metrics as their dashboards.",
    watchouts: [
      "Needs clean assignment IDs — bad hashing invalidates reads.",
      "Requires dev ownership; not a marketer-only tool.",
      "Metric catalog work upfront pays off.",
      "Bad assignment ids invalidate the test. Write the hashing rule down.",
      "A metric catalog is upfront work. Skipping it means every test invents its own success.",
      "Do not hand the SDK to five squads without an owner for stale flags.",
    ],
    useWhen: "Engineering owns rollout and stats must match internal dashboards. Engineering will own the flag and you refuse to have two versions of conversion.",
  },
  launchdarkly: {
    review:
      "Gold standard for feature flags and gradual rollouts when experimentation is secondary. We pair it with Mixpanel for reads unless Statsig already covers both. Do not pretend flag toggles replace a measured test plan.\n\nLaunchDarkly is how you ship a risky change without betting the conversion rate on a single deploy. Flags, targeting, and kill switches are the product. Experiment readouts are secondary — pair it with Mixpanel or Statsig if the question is lift, not safety.\n\n\n\nFlag debt is the real cost. Every temporary toggle that survives a quarter becomes a product fork nobody can reason about. Put a cleanup date on the ticket when you create the flag. Forecast seats and MAU before a traffic spike, not after the invoice.",
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
    bestFor: "Safe rollouts and kill switches on production features. Production rollouts where the main risk is broken code, not a headline test.",
    watchouts: [
      "Flag debt accumulates — schedule cleanup.",
      "Experiment analysis is not its core strength.",
      "Seat and MAU pricing needs forecasting.",
      "Schedule flag cleanup or the codebase becomes a maze of dead variants.",
      "Do not pretend a 10% rollout without a metric is an experiment.",
      "MAU pricing moves with acquisition. Model it.",
    ],
    useWhen: "The primary risk is shipping broken code, not headline lift on a LP. You need a kill switch and gradual exposure, and a separate tool will judge whether the change made money.",
  },
  growthbook: {
    review:
      "Open-source experimentation when you already pay for BigQuery and want stats without vendor lock-in. Dev-heavy setup, but CRO cost drops at scale. Not for teams without someone who can own YAML and SQL.\n\nGrowthBook fits teams that already pay for BigQuery or Snowflake and do not want experiment stats locked in a vendor. You will write metric SQL and maintain an SDK. That is the point: the conversion definition lives next to revenue, not in a snippet UI. It is the wrong tool if nobody on the team will own YAML, upgrades, and metric reviews.\n\n\n\nUI polish is behind VWO and Optimizely. Stakeholders who want to click variations together may bounce. Use it when data and engineering are in the room. Cloud hosting removes some of the ops pain; self-host only if you truly need it.",
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
    bestFor: "Data teams that want experiment stats on owned infrastructure. Data teams that want experiment stats on metrics they already trust in the warehouse.",
    watchouts: [
      "Self-host and upgrade burden is yours.",
      "UI polish lags commercial suites.",
      "Needs rigorous metric definitions in the warehouse.",
      "Self-host means you own upgrades and downtime. Budget that.",
      "A vague SQL metric will 'win' tests that did not move revenue. Review definitions.",
      "Do not expect marketers to self-serve the first experiments without a data partner.",
    ],
    useWhen: "Warehouse is source of truth and eng can maintain the stack. The warehouse is the source of truth and someone can maintain the stack after the first test.",
  },
  gtm: {
    review:
      "Necessary tag layer for most sites — but a graveyard of misfiring pixels if nobody owns it. We document every tag against a funnel map and use consent triggers religiously. Zaraz or server-side tags when client weight threatens vitals.\n\nGTM is essential and dangerous. It lets marketing fire a pixel without a release, and it also lets a forgotten tag double-count purchases for a year. We treat the container like code: a naming scheme, a map from each tag to a funnel step, and consent as a trigger, not a hope. One owner publishes. Everyone else proposes.\n\n\n\nWhen the container starts showing up in LCP, move the heavy pixels to Zaraz or another server-side path. Do not solve tag weight by adding another tag manager.",
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
    bestFor: "Coordinating analytics, ads, and consent without redeploying the site. Sites that need analytics, ads, and consent firing without a deploy for every pixel.",
    watchouts: [
      "Duplicate events when both GTM and hardcoded firing exist.",
      "Workspace sprawl — use naming conventions.",
      "Slows pages when tags multiply unchecked.",
      "Hardcoded gtag plus GTM is how you double-fire. Pick one path per event.",
      "Workspaces sprawl. Name tags after the funnel step, not the person who added them.",
      "Audit the container quarterly. Dead tags are a performance and a privacy problem.",
    ],
    useWhen: "Marketing and product both need firing control without weekly releases. Marketing and product both need control, and you will actually document what is published.",
  },
  segment: {
    review:
      "Collect once, route everywhere — still the default CDP when stacks are messy. We use it to enforce one identify() call before events fan out to Mixpanel and ads. RudderStack wins on warehouse-first budgets; Segment wins on connector breadth.\n\nSegment is justified when three or more tools must see the same identify() and the same event names. One client contract, many destinations. The failure mode is a sloppy identify: merge the wrong anonymous id and you poison Mixpanel, ads, and the warehouse together. Write the identity spec before you turn on destinations.\n\n\n\nWatch MTU. A campaign that floods anonymous traffic can blow the bill without creating a single customer. RudderStack is the better default if the warehouse is the product and marketers do not need to rewire destinations every week. Segment wins on connector breadth and on teams that already know it.",
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
    bestFor: "Multi-destination tracking with one client-side contract. Messy stacks that need one client-side contract fanning out to analytics, ads, and the warehouse.",
    watchouts: [
      "MTU billing surprises when anonymous traffic spikes.",
      "Bad identify() poisons every downstream tool.",
      "Debugging requires protocol discipline.",
      "Anonymous traffic spikes are an MTU event. Cap or sample before a big launch.",
      "A bad identify() is an incident. Treat it like one.",
      "Destinations drift. Re-QA the purchase event in each tool after every tracking change.",
    ],
    useWhen: "Three or more tools need the same events and user IDs. At least three destinations need the same user id, and someone will own the tracking plan.",
  },
  rudderstack: {
    review:
      "Warehouse-first routing without Segment pricing drama — good for teams already on BigQuery or Snowflake. More engineering than Segment, but you own the pipe. Use Segment if non-technical marketers must fix destinations daily.\n\nRudderStack is the warehouse-first pipe: events land where SQL, experiments, and reverse ETL already live, without Segment's MTU drama. You pay in engineering. Transforms are product code — review them. Marketers who need to add a Facebook destination on a Friday will feel the missing guardrails.\n\n\n\nUse it when BigQuery or Snowflake is the conversion system of record. Use Segment when non-technical people must operate destinations daily and connector breadth matters more than owning the pipe.",
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
    bestFor: "Event pipelines that land in a warehouse before analytics tools. Teams whose conversion truth already lives in a warehouse and who can staff the pipeline.",
    watchouts: [
      "Transform code needs review like product code.",
      "Self-hosted ops if you choose that path.",
      "Fewer 'marketer-friendly' guardrails.",
      "Unreviewed transforms will silently drop the revenue event. Code review them.",
      "Self-host only with an owner for upgrades. Otherwise use cloud.",
      "Document the schema. A warehouse full of unnamed properties is not a win.",
    ],
    useWhen: "The warehouse is the system of record for conversion metrics. You want events in SQL first and you accept that destination changes go through engineering.",
  },
  zaraz: {
    review:
      "Server-side tags on Cloudflare when client GTM weight shows up in PSI and real users bounce. Not a full CDP — pair with product analytics separately. Best for performance-sensitive landing pages with many third-party pixels.\n\nZaraz is how we cut third-party JavaScript on Cloudflare sites when PageSpeed and real users both say the landing page is drowning in pixels. It is not a CDP and it will not replace product analytics. Move the tags that have a server-side tool, keep a thin client path for what cannot move, and remeasure LCP and INP.\n\n\n\nDebugging is worse than GTM's preview mode. Write a checklist for 'did the purchase fire' that includes the server log, not only the browser. And know your DNS story — you are coupling tagging to Cloudflare.",
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
    bestFor: "Cutting client JS while keeping ad and analytics firing. Performance-sensitive landing pages that must keep ads and analytics without the client-side pile.",
    watchouts: [
      "Not every GTM tag has a server equivalent.",
      "Debugging is harder than browser DevTools.",
      "Cloudflare coupling — know your DNS story.",
      "Some GTM tags have no server equivalent. Do not pretend they all moved.",
      "A failed server tool fails quietly. Alert on missing conversions, not only on JS errors.",
      "If you might leave Cloudflare, do not put your only tracking path here.",
    ],
    useWhen: "Vitals regressions trace to tag bloat on paid landing pages. Vitals regressions trace to tag bloat and the site is already on Cloudflare.",
  },
  "search-console": {
    review:
      "Ground truth for queries and pages that already earn impressions — before you spend on content or fixes. We pull GSC weekly into leak reviews alongside GA4 landing data. Pair with Ahrefs when you need competitive gaps, not just your own graph.\n\nSearch Console is the list of demand you already earned. Every week we export queries and pages, join them to landing conversion in GA4, and ask which URLs get impressions and then fail. That is a CRO backlog, not an SEO hobby. Ahrefs tells you what competitors rank for. GSC tells you what you already have.\n\n\n\nExpect lag and thin data on low-volume pages. Do not 'fix' a two-click URL because the position moved half a point. Cohort pages that actually send sessions, then decide whether the leak is the snippet, the page, or the offer.",
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
    bestFor: "Finding demand you already rank for but under-convert. Finding URLs that already rank and under-convert, before you commission more content.",
    watchouts: [
      "Four-day data lag on queries.",
      "Sampling on low-volume pages.",
      "Not a rank tracker — use Ahrefs/Semrush for that.",
      "Query data lags. Do not call a winner on yesterday.",
      "Low-volume pages are noise. Set a session floor before they enter the backlog.",
      "GSC is not a rank tracker. Triangulate positions with Ahrefs or Semrush when the SERP matters.",
    ],
    useWhen: "The question is which existing URLs deserve CRO or content investment. The question is which existing pages deserve a test, a rewrite, or a faster template.",
  },
  ahrefs: {
    review:
      "Competitive organic intelligence — where rivals steal clicks and which pages to build or fix. We use it to prioritize landing work that already has search intent. Semrush overlaps; Ahrefs feels sharper on link and content gaps for our clients.\n\nAhrefs is how we decide which organic bets can turn into revenue, not just traffic. Content gaps and competing URLs matter only if the intent can convert — a tool page, a comparison, a template, a pricing-adjacent guide. We cross-check rank estimates against Search Console before anyone builds a page. Semrush overlaps; we reach for Ahrefs when the question is links and the pages rivals already win.\n\n\n\nCredits and seats run out on lower plans in the middle of an audit. Export the target list once and work from it. Volume without conversion intent is how content teams stay busy and the funnel stays flat.",
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
    bestFor: "Content and SEO-led growth with clear keyword targets. Prioritising pages and keywords that can feed a landing or product conversion, not just sessions.",
    watchouts: [
      "Credits and seat limits on lower plans.",
      "Rank estimates ≠ your GSC reality — triangulate.",
      "Easy to chase volume over conversion intent.",
      "Rank estimates are not your GSC reality. Triangulate before you rewrite a page.",
      "Chasing volume keywords with no commercial intent will not move revenue.",
      "Seat and credit limits stall the audit if you do not export the working set early.",
    ],
    useWhen: "You need competitor URLs and keywords to feed the CRO backlog. You need competitor URLs and a gap list to decide what to fix or build next quarter.",
  },
  similarweb: {
    review:
      "Channel mix and referral quality when evaluating markets or partners — not for daily ops. Helpful in pitch and strategy phases before you commit spend. Plausible or GA4 handle your own site; Similarweb sizes the pond.\n\nSimilarweb is a strategy tool. Use it when leadership asks how a competitor mixes paid, organic, and referral before you copy their budget. Treat every number as directional. Your own GA4 or Plausible is the truth for your site. Similarweb sizes the pond.\n\n\n\nIt becomes a distraction when a team would rather benchmark rivals than fix a checkout. Time-box it to a pitch, a market entry, or a quarterly channel review. Full exports sit on expensive tiers — decide the three questions before you pull data.",
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
    bestFor: "Benchmarking competitors and sizing channels. Sizing a competitor's channel mix before a budget or a market bet.",
    watchouts: [
      "Estimates, not your analytics — treat as directional.",
      "Enterprise pricing for full exports.",
      "Can distract from fixing your own funnel.",
      "Estimates are not analytics. Never set a target from Similarweb alone.",
      "Enterprise exports are easy to overbuy. Write the questions first.",
      "A competitor chart does not fix your funnel. Leave the tool after the decision.",
    ],
    useWhen: "Leadership asks 'how big is their paid vs organic' before budget. Someone senior is asking 'how big is their paid versus organic' and your own analytics cannot answer that.",
  },
  semrush: {
    review:
      "Broader marketing suite — keywords, ads, and site audits in one subscription. We use it when SEO and paid search share one team. Ahrefs is leaner for pure SEO depth; Semrush wins on PPC keyword overlap.\n\nSemrush is the working surface for keywords, ads, and the SERP you are about to send traffic to. We use it to see whether a query is a comparison, a tool, or a definition before we spend CRO time on the landing page. If the SERP is all definitions, a harder page will not convert. Pair it with Search Console so you work on queries you can actually win.\n\n\n\nIt overlaps Ahrefs. Pick one as the system of habit so the team is not reconciling two keyword universes. Position tracking is a monitor, not a conversion metric — the win is still the landing page's lead or purchase rate.",
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
    bestFor: "Teams running SEO and paid search off one research tool. Mapping intent and competitive SERPs so CRO effort lands on pages that can convert.",
    watchouts: [
      "Feature overload — narrow the workflow.",
      "Data freshness varies by module.",
      "Easy to export lists nobody acts on.",
      "Two SEO suites create two backlogs. Standardise on one.",
      "Position is not revenue. Attach a conversion rate before a keyword becomes a project.",
      "Ads data goes stale. Refresh the competitive set before a quarterly plan, not after.",
    ],
    useWhen: "You need keyword, ad, and page intel in one weekly ritual. You are choosing keywords, ads, or a page rewrite and you need the SERP, not just your own queries.",
  },
  plausible: {
    review:
      "Lightweight, privacy-first traffic when GA4 feels heavy or legally awkward. Good for marketing sites and microsites — not for product funnels. We still add Mixpanel when events matter more than pageviews.\n\nPlausible is enough when the site is content and landing pages and GA4 has become a place people open and do not decide. You get sources, pages, and goals without a tag pile. It will not replace product analytics for activation and retention. Use it as the honest traffic layer, then Mixpanel or PostHog for the product.\n\n\n\nGoals have to be few and tied to money or a qualified lead. A dashboard of scroll goals feels productive and tells you nothing. It is also the right recommendation when a client cannot or will not run a heavy Google stack.",
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
    bestFor: "Simple, defensible traffic stats on marketing properties. Marketing sites that need source and page truth without GA4's noise.",
    watchouts: [
      "No product retention or user-level journeys.",
      "Goal limits on smaller plans.",
      "Not a replacement for consent-heavy ad attribution.",
      "Do not force product retention into Plausible. You will invent a fake funnel.",
      "Too many goals dilute the one conversion that matters.",
      "Ad blockers mean you are sampling. Use it for trends, and reconcile big swings with the CRM.",
    ],
    useWhen: "Stakeholders want clean traffic without cookie-banner complexity. The decision is which pages and channels send visits, and a heavier suite is slowing the page or the team.",
  },
  maze: {
    review:
      "Unmoderated tests on prototypes and live URLs — fast signal before you burn dev on the wrong fix. We run maze on checkout copy and nav, not to replace analytics. UserTesting adds voice when stakes are high.\n\nMaze is how you catch a broken path before you ship it to everyone. Put a prototype or a live URL in front of people, score success, misclicks, and time, and fix the step that fails. Five to eight sessions on one task beat a hundred opinions in a design review. We use it before a redesign of onboarding, pricing, or checkout — not as a replacement for watching production leaks in Clarity.\n\n\n\nWrite one task in the user's words. 'Explore the product' produces wander. 'Upgrade to the team plan without asking support' produces a result you can ship against.",
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
    bestFor: "Validating flows before or after a quantitative leak flags. Unmoderated tests on a specific flow before a redesign hits production.",
    watchouts: [
      "Panel quality varies — screen for ICP fit.",
      "Prototype fidelity changes results.",
      "Success metrics must tie back to funnel steps.",
      "Vague tasks create vague heatmaps. Script the job to be done.",
      "A pretty prototype that skips error states will hide the real leak.",
      "Do not recruit only friends of the team. The path has to survive a stranger.",
    ],
    useWhen: "You need 20–40 task completions on a specific UI change. You have a prototype or a URL and a single task you can score as pass or fail.",
  },
  dovetail: {
    review:
      "Research repository when interviews pile up and nobody can find the clip that proves the leak. Tag insights next to hypotheses so CRO decks cite real quotes. Not for quick unmoderated — Maze covers that.\n\nDovetail is the memory of the research program. Interviews, clips, and tags only help if they sit next to a hypothesis the CRO backlog can cite — 'users stall on seat count because they think it is per month'. A library nobody tags is a hard drive. We require a highlight and a decision on every session that influenced a test.\n\n\n\nIt does not recruit users and it does not run the test. Pair it with Maze, UserTesting, or Lookback. And resist taxonomy theatre: ten tags you will actually filter beat eighty tags that make search useless.",
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
    bestFor: "Teams running continuous interviews across squads. Teams that run interviews and need the evidence attached to the next experiment.",
    watchouts: [
      "Repository rot without tagging discipline.",
      "License per seat adds up.",
      "Not a substitute for quantitative priority.",
      "Untagged projects become write-only. Make tagging part of the session, not a later week.",
      "Do not let the repository replace talking to a new user this month.",
      "Highlights without a decision are trivia. Write the change they imply.",
    ],
    useWhen: "Qual evidence must survive turnover and feed the experiment backlog. Research is already happening and the failure mode is 'we heard something once and lost it'.",
  },
  usertesting: {
    review:
      "Panel voice when a leak is emotional or high stakes — pricing, trust, onboarding confusion. Slower and pricier than Maze, but nothing replaces hearing hesitation on a paywall. Book sessions after analytics names the step.\n\nUserTesting is the panel when you need a specific person — a finance admin, a first-time buyer, a mobile-only user — and you cannot recruit them this week. Use it to hear why a leak exists, then confirm the size of that leak in analytics. A vivid quote is not a conversion rate.\n\n\n\nWrite a tight test and a segment. An unfiltered panel will politely complete a task your real users abandon. Moderated sessions are worth it when you need to ask 'why did you stop'. Unmoderated is enough when the path is simple and you need volume.",
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
    bestFor: "Moderated sessions with ICP match on sensitive flows. Hearing the reason behind a leak from people who match the segment you are trying to convert.",
    watchouts: [
      "Panel ≠ your users unless screened tightly.",
      "Clip cherry-picking bias in decks.",
      "Cost per session limits breadth.",
      "The wrong segment gives you confident nonsense. Spend the time on recruiting filters.",
      "Panel users are professional enough to push through friction your customers will not.",
      "Clips are not a sample size. Go back to the funnel before you rebuild the page.",
    ],
    useWhen: "Leadership needs to hear a user struggle on the exact conversion step. You cannot recruit the right users yourself in time, and a quote will change the fix you ship.",
  },
  lookback: {
    review:
      "Live interviews on the real product — great for mobile and auth flows hard to prototype. We use it in discovery sprints before instrumentation is perfect. Dovetail stores the outputs; Lookback captures the session.\n\nLookback is for watching someone use the real product, live or recorded, and clipping the second the task breaks. It is lighter-weight interview infrastructure than a full research suite. We use it for onboarding and checkout with customers you already have, which beats a generic panel when the account context matters.\n\n\n\nGet consent and a quiet task. A demo where you drive the mouse teaches you nothing. Store the clip next to the hypothesis in Dovetail or the experiment doc so the insight survives the call.",
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
    bestFor: "Remote moderated research on production builds. Moderated or recorded sessions on the real product with people who already have an account.",
    watchouts: [
      "Recording consent and NDAs on beta features.",
      "Mobile capture quirks.",
      "Needs facilitator skill for unbiased prompts.",
      "If you talk more than they click, you ran a meeting, not a test.",
      "Real accounts can expose real data. Agree what is off-camera before you hit record.",
      "A single dramatic session is a lead, not a verdict. Check the funnel after.",
    ],
    useWhen: "The bug is reproduction friction, not abstract preference. You can recruit customers yourself and you need the moment of failure on video.",
  },
  sprig: {
    review:
      "Microsurveys fired on the stall moment — pricing hesitation, onboarding skip — with enough targeting to avoid spam. Response rates beat email when tied to product events. Typeform for long surveys; Sprig for in-context why.\n\nSprig is for one question at the moment of the stall: after a failed paywall, a skipped onboarding step, or a rage click. Trigger it from the product event, not from a timer on the homepage. The answer is useful only if you can join it back to the user and the step. Otherwise you have a word cloud.\n\n\n\nKeep the survey tiny. A five-question intercept at the worst moment is itself a conversion leak. Close the loop: if people say 'I don't know what this costs', the next sprint changes the price presentation, and you measure the step again.",
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
    bestFor: "Short 'why did you stop' prompts on specific funnel steps. In-product questions fired on a specific failure, tied to the user and the event.",
    watchouts: [
      "Over-targeting annoys power users.",
      "Needs event hooks from analytics.",
      "Sample bias — weight against funnel volume.",
      "A survey on every page trains people to ignore you and adds friction.",
      "Untargeted 'how do you like the app' responses will not name the leak.",
      "Do not leave the study running after you have the answer. It becomes wallpaper.",
    ],
    useWhen: "Quant shows a drop and you need a reason code within days. You know where the funnel stops and you need the words people use, not another recording.",
  },
  pendo: {
    review:
      "In-app guides and NPS when product marketing owns the layer inside the app. Can mask weak activation if guides replace fixing the flow. We prefer fixing the step, then Pendo for reinforcement and surveys.\n\nPendo makes sense when guides, NPS, and usage need to live on one product graph — usually a larger B2B app with an onboarding owner. Guides are not an aha. If the empty state is confusing, a tooltip that says 'click here' is a patch. We use guides to point at the next valuable action after the product can actually deliver it.\n\n\n\nNPS without a segment is a vanity number. Cut it by plan, tenure, and whether they finished activation. And watch performance: a guide framework that loads on every page is a vitals problem.",
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
    bestFor: "PLG apps needing guides, polls, and usage analytics together. B2B products that need onboarding guides and feedback on the same usage data.",
    watchouts: [
      "Guide fatigue hurts activation metrics.",
      "MAU pricing on growing products.",
      "Analytics depth below dedicated product tools.",
      "Tooltips that compensate for a broken IA will multiply. Fix the path.",
      "NPS without a segment hides the accounts that are about to churn.",
      "Audit guide weight. Onboarding JS should not be your LCP.",
    ],
    useWhen: "CS and PM need in-app messaging tied to behavior segments. You have an owner for in-app messaging and the product already has a clear next step worth pointing at.",
  },
  typeform: {
    review:
      "Longer surveys and lead qual when you need structured answers beyond a one-click microsurvey. Good for waitlists and research recruiting. Do not use it mid-checkout unless you enjoy abandon spikes.\n\nTypeform is for the conversation that does not fit in a one-question Sprig study: churn, post-purchase, a research screen, a lead form you are willing to make sequential. Completion is the design problem. Every extra question is a tax. Put the qualifying question first so a drop-off still leaves you something.\n\n\n\nDo not use it as your product analytics. A beautiful form that does not write back to the CRM or the user id is a dead end. Connect the submission to the same email or account you use everywhere else.",
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
    bestFor: "Multi-question flows off-product or after conversion. Structured surveys and lead forms where the questions themselves are the experience.",
    watchouts: [
      "Embedding in funnel adds friction.",
      "Integrations need Zapier or API maintenance.",
      "Brand feel ≠ your app UI — set expectations.",
      "Long forms feel premium and convert worse. Cut until it hurts.",
      "Unconnected responses cannot be joined to revenue. Wire the destination first.",
      "Logic branches that nobody QA'd will skip the question you needed.",
    ],
    useWhen: "You need ten questions, logic jumps, and clean exports. You need more than one answer, and you will connect submissions to the customer record.",
  },
  appcues: {
    review:
      "Checklists and tooltips for onboarding — fine as reinforcement, fatal as a substitute for a clear aha. We audit whether the step should exist before wiring Appcues. Pendo overlaps; Appcues feels lighter for pure onboarding tours.\n\nAppcues is a way to point a user at the next valuable action — a checklist, a tooltip, a short tour — after you know what that action is from the funnel. It does not create the aha. If activation is broken, a five-step tour adds guilt and no revenue. Build the checklist from the events that predict conversion, not from the features marketing wants to announce.\n\n\n\nTarget it. A tour for everyone on login is how you train power users to click Skip. Measure the step after the guide, not the guide completion rate.",
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
    bestFor: "Guided first-run without a full PM suite. Pointing activated users at the next action you have already proven matters.",
    watchouts: [
      "Tooltip walls increase time-to-value.",
      "Hard to measure true lift vs annoyance.",
      "Must sync with feature flags on redesigns.",
      "Tours that announce features are not onboarding. Tie each step to an event.",
      "Completion of the checklist is not success. The following product action is.",
      "Stale guides after a redesign block the new UI. Put an expiry on every flow.",
    ],
    useWhen: "Activation is close but users miss one obvious control. The funnel says which step predicts revenue, and a hint can remove a discovery problem.",
  },
  sentry: {
    review:
      "Errors that silently kill checkout or signup — Sentry catches them when analytics only shows drop-off. Wire release and user context so replays align with sessions. LogRocket overlaps on replay; Sentry wins on error grouping at scale.\n\nSentry is how a conversion drop becomes a release, a browser, and a stack trace instead of a redesign debate. When checkout falls on a Tuesday, look at errors and traces before you rewrite the button. Tag releases, assign an owner, and scrub PII from breadcrumbs before you widen access.\n\n\n\nIt will page you into oblivion without rules. Alert on the endpoints and front-end transactions that sit on the money path — payment, signup, invite — not on every console warning. Pair it with vitals: an error-free page that takes eight seconds still leaks paid traffic.",
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
    bestFor: "Production JS and API failures on conversion paths. Production failures on the steps that collect an email, a card, or an account.",
    watchouts: [
      "Noise without release tagging and ownership rules.",
      "PII in breadcrumbs — scrub configs.",
      "Quota spikes during bad deploys.",
      "Untuned alerts create silence. Route money-path issues to a human.",
      "Breadcrumbs leak emails and tokens if you do not scrub them.",
      "A bad deploy can burn the quota. Know the spike plan.",
    ],
    useWhen: "Funnel drops coincide with deploys or browser console errors. A funnel moves on a deploy, or support tickets mention a console error you cannot reproduce.",
  },
  "speed-insights": {
    review:
      "CrUX and PSI ground vitals in field data — slow LCP on mobile leaks paid traffic before analytics blames copy. We screenshot PSI deltas beside CRO tickets. Not a monitor replacement for Sentry; vitals and errors stack together.\n\nCrUX and PageSpeed are the argument that the page is losing the click before the offer paints. We put the field LCP and INP of the paid landing page next to the CRO ticket. Lab scores are a hint. Field data is the decision. A green Lighthouse run on a laptop does not describe a mid-range phone on the campaign URL.\n\n\n\nRerun after tag changes. GTM and third parties are often the regression. Track the URL over weeks — one-off tests bounce. This is not a replacement for Sentry; a fast page can still throw on submit.",
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
    bestFor: "Proving performance regressions on landing and checkout URLs. Proving that a landing or checkout URL is slow for real users, not just in a lab.",
    watchouts: [
      "Lab scores ≠ field — prioritize CrUX.",
      "Third-party tags often the culprit — pair with GTM/Zaraz audit.",
      "One-off tests lie — track trends.",
      "Do not prioritise a lab score over CrUX on the URL you actually buy traffic for.",
      "Third-party tags move vitals. Re-test after the container changes.",
      "A single run lies. Compare the same template across several days.",
    ],
    useWhen: "Media spend hits pages with weakening mobile LCP or INP. Media spend hits a page whose mobile LCP or INP is getting worse.",
  },
  logrocket: {
    review:
      "Replay plus console when errors are intermittent and Sentry alone cannot reproduce. Heavier than Clarity, tighter dev focus. We use it on checkout integrations and third-party widgets. FullStory is stronger for pure UX research teams.\n\nLogRocket is for the bug that happens sometimes: the console, the network call, and the session in one place. We use it when Sentry shows an error we cannot reproduce and support says 'it broke on checkout'. It is heavier than Clarity and more developer-shaped than FullStory. Align the user id with analytics or you will never find the session the funnel is complaining about.\n\n\n\nMask aggressively. Network logs will contain more PII than a heatmap. Sample if you are not debugging a monetisation flow — storing every marketing bounce is how the invoice arrives.",
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
    bestFor: "Debugging flaky client issues on monetization flows. Intermittent client bugs on checkout, billing, and other flows where logs and replay must match.",
    watchouts: [
      "Session volume pricing.",
      "PII masking configuration is mandatory.",
      "Overlap with analytics — align user IDs.",
      "Turn on masking before you invite the company. Network bodies are sensitive.",
      "Volume pricing punishes 'record everything'. Target the flow.",
      "If the user id does not match Mixpanel, you will never find the right session.",
    ],
    useWhen: "Support says 'it broke' but logs show nothing obvious. Someone can describe the failure and neither analytics nor a plain error tracker can reproduce it.",
  },

  "looker-studio": {
    review:
      "Looker Studio is the stakeholder layer, not the source of truth. We use it when a founder or a client needs a Monday view of spend, landing conversion, and pipeline without learning Mixpanel or SQL. The report should point at a decision — which campaigns to cut, which URLs to test — and link back to the tool that holds the raw events. A 30-page deck of charts that nobody can reconcile with Stripe is how reporting replaces work.\n\nBuild from a short metric list you already trust: sessions, qualified leads or checkouts, and revenue. Every extra blended source is a way for the numbers to diverge. When the question becomes 'why did activation drop for this cohort', leave Studio and open the product analytics tool or BigQuery. Studio will not save you from a broken GA4 property; it will just make the broken number prettier.\n\nRefresh ownership matters. A report wired to a personal Google login dies when that person leaves. Put it on a shared account, name the fields after the funnel step, and date the definition. If finance does not recognise the revenue line, fix the source before you add another page.",
    metrics: [
      m("1–2 days", "Time-to-first decision view"),
      m("Medium", "CRO stack fit"),
      m("$0", "Pricing band"),
    ],
    chart: chart("Days to a report people open", " days", [
      ["Pick metrics", 1],
      ["Connect source", 1],
      ["Reconcile", 2],
      ["Stakeholder pass", 1],
      ["Weekly habit", 2],
    ]),
    bestFor: "A shared Monday view of acquisition and conversion for people who will not live in the analytics tool.",
    watchouts: [
      "Blended sources that do not match Stripe or the CRM will be believed anyway. Reconcile first.",
      "Personal-login reports vanish. Use a shared owner.",
      "Studio cannot explain a product cohort. Do not pretend the chart is the analysis.",
      "Too many pages means nobody opens it. One decision per report.",
      "Sampled GA4 underneath a clean chart is still sampled.",
      "Pretty formatting hides a stale extract. Show the data date.",
    ],
    useWhen: "Leadership needs the same three numbers every week and the argument is no longer about where to click.",
  },
  bigquery: {
    review:
      "BigQuery is where conversion becomes auditable. Product events, ad spend, and Stripe can sit in one place so an experiment readout matches finance. We reach for it when a UI tool cannot answer the question — multi-touch revenue, account-level retention, or a metric Statsig and GrowthBook should read from the warehouse. It is the wrong first tool. If you do not yet have named events, a warehouse will only store the mess at scale.\n\nStart with one table that matters: the funnel step grain you wish Mixpanel had, with a user id, a timestamp, and the revenue flag. Model that properly before you add every click. Cost surprises come from unbounded scans and dashboards that query raw events all day. Partition, and make the expensive query a scheduled table.\n\nSomeone has to own schemas the way they own the tracking plan. An undocumented column called value_2 is how a price test gets read against the wrong number. Pair it with Looker Studio or Hex for humans, and with GrowthBook or Statsig when the warehouse metric is the experiment metric.",
    metrics: [
      m("2–4 wks", "First trusted funnel table"),
      m("High (at scale)", "CRO stack fit"),
      m("Usage", "Pricing band"),
    ],
    chart: chart("Weeks to a trusted revenue table", " wks", [
      ["Event land", 1.5],
      ["Identity", 2.0],
      ["Funnel SQL", 1.2],
      ["Reconcile", 1.0],
      ["Scheduled", 0.8],
    ]),
    bestFor: "Teams whose conversion questions no longer fit in one analytics UI and who can staff SQL.",
    watchouts: [
      "A warehouse does not clean bad events. Fix tracking before you model it.",
      "Unbounded queries are a bill. Partition and schedule the heavy reads.",
      "Two user ids in one table will split every cohort. Write the identity rule.",
      "Finance will not adopt a table they cannot reconcile. Do that join early.",
      "Dashboards on raw events get slow and wrong. Materialise the funnel.",
      "Access is a privacy decision. Revenue tables are not a playground.",
    ],
    useWhen: "You need experiment and revenue math that a product analytics UI cannot express, and someone will maintain the SQL.",
  },
  stripe: {
    review:
      "Stripe is the conversion source of truth for anyone who charges a card. Funnels in Mixpanel that do not match successful charges are stories. We use Checkout, customer portal, and the events around invoice.paid and checkout.session.completed to judge pricing tests, failed payments, and paywall changes. The product analytics tool should receive those events, not invent a parallel 'purchase' that fires on a button click.\n\nFailed payments and recovery are a CRO surface. A declined card, an expired trial, and a 3DS drop are leaks you can see in Stripe before you redraw the pricing page. Do not A/B test prices in a way that creates two products you cannot explain to finance. Write the variant, the price id, and the success metric first.\n\nRadar and fraud rules can silently suppress conversion. If a country or a card type falls off, check Stripe before you blame the headline. And keep test-mode keys out of production readouts — it sounds obvious and it still happens in early setups.",
    metrics: [
      m("Same day", "Time-to-revenue truth"),
      m("Essential", "CRO stack fit"),
      m("Usage", "Pricing band"),
    ],
    chart: chart("Days to trust a pricing readout", " days", [
      ["Price ids", 1],
      ["Webhook", 2],
      ["Analytics join", 3],
      ["Failure view", 2],
      ["Readout", 2],
    ]),
    bestFor: "Any paid product where the win is collected revenue, not a button click.",
    watchouts: [
      "A front-end purchase event that is not a Stripe charge will inflate conversion.",
      "Fraud rules can look like a conversion bug. Check declines by reason.",
      "Price tests without a price id per variant cannot be reconciled.",
      "Webhooks fail quietly. Alert on missing invoice events.",
      "The customer portal is part of retention. Do not ignore it in the journey.",
      "Test-mode data in a live board is an incident.",
    ],
    useWhen: "The decision is whether a paywall, price, or checkout change actually collected money.",
  },
  customerio: {
    review:
      "Customer.io is the lifecycle layer that should fire on product behavior, not on a marketer's calendar. Trial day three is meaningless if the user already activated — or if they never did. We connect it to the same events as Mixpanel or Segment: signed up, reached first value, stalled before paywall, paid, went quiet. Then the message is a response to the leak, not a newsletter.\n\nOne job per campaign. A twelve-email drip that 'nurtures' everyone will train users to ignore you and will hide which step you were trying to fix. Measure the product event after the send, not the open rate. Opens are a weak proxy for activation.\n\nFrequency and consent are part of conversion. A pushy win-back on a user who is mid-checkout is how you create the stall you were trying to cure. Suppress anyone already in the flow.",
    metrics: [
      m("1–2 wks", "First behavior-led campaign"),
      m("Medium–high", "CRO stack fit"),
      m("$$", "Pricing band"),
    ],
    chart: chart("Days to a message that tracks to a product event", " days", [
      ["Event map", 3],
      ["Segment", 2],
      ["Copy + QA", 3],
      ["Holdout", 2],
      ["Readout", 4],
    ]),
    bestFor: "Activation and win-back messages triggered by the same events as the funnel.",
    watchouts: [
      "Open rate is not activation. Hold the campaign to the product event.",
      "A blast to everyone hides the segment that is actually stuck.",
      "Messaging a user who is already converting adds friction. Suppress them.",
      "Events that arrive late will send the wrong email. Check identity and delay.",
      "Too many campaigns create fatigue you will blame on the product.",
      "Unsubscribed users are a signal. Do not keep a shadow list.",
    ],
    useWhen: "A funnel step would move if the right people heard one specific thing at the moment they stall.",
  },
  calendly: {
    review:
      "Calendly is the handoff from a converted page into a human: a demo, a research session, or a sales call. The leak is usually not the calendar brand. It is the step before it — a form that asks for a novel, a routing rule that sends the wrong person, or a confirmation that never states what will happen on the call. We treat the booking rate from the landing CTA as the metric, and we watch show rate after that.\n\nKeep the event type honest. A 15-minute 'strategy audit' that is a pitch will burn the traffic you just paid for and will show up as no-shows, not as a landing-page problem. Routing by segment (plan, company size, timezone) matters more than theme colors.\n\nFor research, Calendly removes the back-and-forth so Lookback or a customer interview actually happens. Put the consent line and the task in the confirmation. A booked slot with a confused participant is a wasted session.",
    metrics: [
      m("Hours", "Time-to-first booked path"),
      m("Medium", "CRO stack fit"),
      m("$–$$", "Pricing band"),
    ],
    chart: chart("Days to a booking path you can judge", " days", [
      ["Event type", 0.5],
      ["Routing", 1],
      ["Page CTA", 1],
      ["Reminders", 0.5],
      ["Show-rate read", 3],
    ]),
    bestFor: "Demo, sales, and research handoffs where the next step is a specific person's time.",
    watchouts: [
      "A long form before the calendar kills the booking. Ask less.",
      "Wrong routing looks like low lead quality. Check who receives the meeting.",
      "No-shows are part of conversion. Measure them, and send one useful reminder.",
      "Too many event types confuse the CTA. One primary path.",
      "Round-robin without ownership means nobody prepares. Name the outcome of the call.",
      "Embedding the widget can hurt page speed. Lazy-load it below the decision.",
    ],
    useWhen: "The offer converts into a conversation, and you need that conversation on the calendar without a custom build.",
  },

};

export function getToolDetails(slug: string): ToolDetailFields | undefined {
  return TOOL_DETAILS[slug];
}
