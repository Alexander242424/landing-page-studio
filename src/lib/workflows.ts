export type WorkflowStep = {
  title: string;
  intro: string;
  points: readonly string[];
};

export type Workflow = {
  slug: string;
  title: string;
  lede: string;
  description: string;
  tags: readonly string[];
  coverSrc: string;
  coverAlt: string;
  date: string;
  datePublished: string;
  author: string;
  tools: readonly string[];
  steps: readonly WorkflowStep[];
  /** Public URL path for playbook PDF download (e.g. /playbooks/foo.pdf). */
  downloadSrc?: string;
  /** Suggested filename when saving the download. */
  downloadFilename?: string;
};

export const WORKFLOWS_PATH = "/workflows";

export function workflowPath(slug: string) {
  return `${WORKFLOWS_PATH}/${slug}`;
}

export const WORKFLOWS: readonly Workflow[] = [
  {
    slug: "the-signal-playbook",
    title: "Signal Playbook",
    lede: "How to set up a conversion-signal system from scratch.",
    description:
      "Capture product, journey, and traffic signals in one place, score them, and route the next test or fix — so CRO is driven by intent, not guesswork.",
    tags: ["CRO", "Analytics", "Activation"],
    coverSrc: "/challenges/testing-experimentation.jpg",
    coverAlt: "Abstract diagram of conversion signals and routing",
    date: "October 9, 2026",
    datePublished: "2026-10-09",
    author: "UXLAB",
    downloadSrc: "/playbooks/the-signal-playbook.pdf",
    downloadFilename: "signal-playbook.pdf",
    tools: [
      "Mixpanel",
      "Amplitude",
      "PostHog",
      "GA4",
      "Segment",
      "GTM",
      "Hotjar",
      "FullStory",
      "Optimizely",
      "VWO",
      "Looker Studio",
      "BigQuery",
    ],
    steps: [
      {
        title: "Define what a signal should do",
        intro:
          "Decide the job of each signal before you capture it. Otherwise the stack is noise.",
        points: [
          "Awareness: where the account or user sits in the journey.",
          "Automated tests: fire an experiment when a leak repeats.",
          "Manual review: ping the team on high-intent drop-offs.",
          "Expansion: product signals that point to an upsell or plan change.",
          "Acquisition: lists for ads and landing tests, not more spend for the same funnel.",
        ],
      },
      {
        title: "Capture first-party signals",
        intro: "Start with data you already own inside the product.",
        points: [
          "Product usage: Mixpanel, Amplitude, PostHog.",
          "Web analytics: GA4, Plausible, server events.",
          "Session evidence: FullStory, Hotjar, Clarity.",
          "Checkout and forms: native events plus GTM.",
          "Support and chat: Intercom, Crisp — where users stall.",
        ],
      },
      {
        title: "Capture second-party signals",
        intro: "Add partner and channel data that explains the visit.",
        points: [
          "Ads and UTM quality: what actually lands in the funnel.",
          "CRM stage: HubSpot, Pipedrive, Attio.",
          "Email and lifecycle: Customer.io, Braze, Iterable.",
          "Review and referral sources that change intent.",
        ],
      },
      {
        title: "Capture third-party context",
        intro: "Firmographics and market context only where they change the test.",
        points: [
          "Traffic quality: Similarweb, Ahrefs, Search Console.",
          "Device and performance: CrUX, web vitals.",
          "Segment traits that change copy, pricing, or flow.",
        ],
      },
      {
        title: "Centralize and score",
        intro: "One place, one awareness stage, no competing dashboards.",
        points: [
          "Pipe events into a warehouse or CDP (Segment, BigQuery).",
          "Enrich the user or account behind the event.",
          "Score stages: identified, aware, interested, considering, converting.",
        ],
      },
      {
        title: "Route to a live change",
        intro: "Every scored signal needs an owner and a next ship.",
        points: [
          "High-intent leaks become the next CRO test.",
          "Tier-1 sessions go to research, not a slide.",
          "Winners sync back as the new baseline in analytics.",
        ],
      },
    ],
  },
  {
    slug: "experimentation-loop",
    title: "Experimentation loop",
    lede: "A weekly test system that ships winners, not a backlog of ideas.",
    description:
      "How UXLAB runs diagnose → hypothesis → test → ship so conversion gains compound instead of resetting every quarter.",
    tags: ["CRO", "Testing", "Product"],
    coverSrc: "/challenges/product-metrics.jpg",
    coverAlt: "Abstract frames suggesting a testing loop",
    date: "September 22, 2026",
    datePublished: "2026-09-22",
    author: "UXLAB",
    tools: ["Optimizely", "VWO", "PostHog", "GA4", "Looker Studio"],
    steps: [
      {
        title: "Pick one leak",
        intro: "One journey, one metric, one owner.",
        points: [
          "Rank drop-offs by revenue, not by pageviews.",
          "Write the hypothesis in one sentence.",
          "Define the kill criteria before launch.",
        ],
      },
      {
        title: "Ship the smallest change",
        intro: "The test is a live product change, not a mock.",
        points: [
          "Build in production with a flag or A/B tool.",
          "Instrument the same events on both variants.",
          "Cap runtime so the next loop can start.",
        ],
      },
      {
        title: "Keep only winners",
        intro: "Losers go away. Winners become default.",
        points: [
          "Promote the variant and remove the flag.",
          "Log the learning in the playbook.",
          "Start the next leak from the new baseline.",
        ],
      },
    ],
  },
  {
    slug: "checkout-leak-map",
    title: "Checkout leak map",
    lede: "Find the step that silently taxes every paid click.",
    description:
      "Map checkout, paywall, and form friction with analytics plus session proof, then test the costliest step first.",
    tags: ["Checkout", "CRO", "Tracking"],
    coverSrc: "/challenges/websites.jpg",
    coverAlt: "Abstract composition suggesting a checkout path",
    date: "September 4, 2026",
    datePublished: "2026-09-04",
    author: "UXLAB",
    tools: ["GA4", "Hotjar", "FullStory", "Stripe", "GTM"],
    steps: [
      {
        title: "Instrument every step",
        intro: "If the step is not an event, it is invisible.",
        points: [
          "Name steps in the order the user actually sees them.",
          "Track errors, retries, and payment method mix.",
          "Join session replay to the same event id.",
        ],
      },
      {
        title: "Price the leak",
        intro: "Volume × drop-off × average order or LTV.",
        points: [
          "Ignore cosmetic rage-clicks until the money step is fixed.",
          "Separate mobile vs desktop funnels.",
        ],
      },
      {
        title: "Test the tax",
        intro: "Copy, fields, and trust — one variable at a time.",
        points: [
          "Cut fields before adding persuasion.",
          "Prove the lift on live traffic.",
        ],
      },
    ],
  },
  {
    slug: "activation-fourteen",
    title: "First fourteen days",
    lede: "The window where a signup becomes a habit — or churns.",
    description:
      "A playbook for onboarding, aha moments, and the first paid action without buying more traffic.",
    tags: ["Activation", "Product", "Lifecycle"],
    coverSrc: "/challenges/product-design.jpg",
    coverAlt: "Abstract rings suggesting an activation path",
    date: "August 18, 2026",
    datePublished: "2026-08-18",
    author: "UXLAB",
    tools: ["Amplitude", "Customer.io", "PostHog", "Appcues"],
    steps: [
      {
        title: "Name the first value",
        intro: "One action that proves the product works.",
        points: [
          "Not ‘completed onboarding’ — a real outcome.",
          "Time-to-value under a day if you can.",
        ],
      },
      {
        title: "Strip the tour",
        intro: "Empty states and defaults beat a 12-step carousel.",
        points: [
          "Put the aha on the first screen.",
          "Trigger help only when the user stalls.",
        ],
      },
    ],
  },
  {
    slug: "pricing-test-system",
    title: "Pricing test system",
    lede: "Packaging and price as experiments, not a yearly debate.",
    description:
      "How to test plans, anchors, and paywalls on real traffic without wrecking trust or billing.",
    tags: ["Pricing", "Experimentation", "Revenue"],
    coverSrc: "/challenges/ai-engineering.jpg",
    coverAlt: "Abstract nested frames suggesting pricing layers",
    date: "July 30, 2026",
    datePublished: "2026-07-30",
    author: "UXLAB",
    tools: ["Stripe", "Statsig", "GA4", "Mixpanel"],
    steps: [
      {
        title: "Hold billing truth",
        intro: "The test can change the offer, not the ledger by accident.",
        points: [
          "Flag the plan in the product, not in random CSS.",
          "Exclude existing subscribers from surprise price jumps.",
        ],
      },
      {
        title: "Test the decision, not the decoration",
        intro: "Anchor, comparison, and default plan move more than color.",
        points: [
          "One variable per test.",
          "Read revenue, not only conversion rate.",
        ],
      },
    ],
  },
  {
    slug: "research-ops",
    title: "Research ops",
    lede: "Interviews and session proof that feed the next ship, not a deck.",
    description:
      "A light research cadence: recruit from the funnel, clip the leak, and hand evidence to the test.",
    tags: ["Research", "Users", "CRO"],
    coverSrc: "/challenges/product-metrics.jpg",
    coverAlt: "Abstract study of user paths",
    date: "July 11, 2026",
    datePublished: "2026-07-11",
    author: "UXLAB",
    tools: ["Maze", "Dovetail", "FullStory", "Calendly"],
    steps: [
      {
        title: "Recruit from the leak",
        intro: "Talk to people who stalled, not to a generic panel.",
        points: [
          "Filter by the same event that failed in analytics.",
          "Five sessions beat fifty unused recordings.",
        ],
      },
      {
        title: "Clip, don’t summarise",
        intro: "The team watches the moment, then tests it.",
        points: [
          "Store clips next to the hypothesis.",
          "Kill research that cannot name a ship.",
        ],
      },
    ],
  },
];

export function getWorkflow(slug: string) {
  return WORKFLOWS.find((item) => item.slug === slug);
}

export function relatedWorkflows(slug: string, limit = 3) {
  return WORKFLOWS.filter((item) => item.slug !== slug).slice(0, limit);
}
