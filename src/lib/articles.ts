export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ArticleFaq = {
  question: string;
  answer: string;
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  /** Short meta description (≤160 chars) */
  description: string;
  /** Direct answer for LLM/GEO snippets — first thing models quote */
  answerCapsule: string;
  date: string;
  /** ISO 8601 for structured data */
  datePublished: string;
  dateModified: string;
  readTime: string;
  image: string;
  imageAlt: string;
  author: {
    name: string;
    jobTitle: string;
    url: string;
  };
  keywords: string[];
  entities: string[];
  takeaways: string[];
  sections: ArticleSection[];
  faq: ArticleFaq[];
};

export const DEFAULT_ARTICLE_AUTHOR = {
  name: "Alex Tyshchenko",
  jobTitle: "Founder, UXLAB",
  url: "https://uxlab.digital",
} as const;

const AUTHOR = DEFAULT_ARTICLE_AUTHOR;

/** Previous short slugs → current title-derived slugs (for redirects). */
export const LEGACY_ARTICLE_SLUGS: Record<string, string> = {
  activation: "how-activation-loops-compound-retention-in-the-first-14-days",
  experiment: "a-practical-playbook-for-cro-experiments-that-ship-weekly",
  systems: "design-systems-that-protect-conversion-under-product-velocity",
  ai: "where-ai-belongs-in-growth-ux-and-where-it-still-fails",
};

export const ARTICLES: Article[] = [
  {
    slug: "how-activation-loops-compound-retention-in-the-first-14-days",
    category: "Product News",
    title: "How activation loops compound retention in the first 14 days",
    description:
      "How UXLAB designs activation loops that compound retention in the first 14 days — triggers, habits, and metrics that turn signups into retained users.",
    answerCapsule:
      "Activation loops compound retention when a user’s first success creates the next reason to return within 14 days. The loop is: trigger → first value → habit cue → return. Products that close this loop early retain more users without increasing acquisition spend.",
    date: "Jul 23, 2026",
    datePublished: "2026-07-23",
    dateModified: "2026-07-23",
    readTime: "7 min read",
    image: "/glance/rivian.jpg",
    imageAlt:
      "Night vehicle with headlights on — visual for product activation and retention loops",
    author: AUTHOR,
    keywords: [
      "activation loops",
      "user retention",
      "product activation",
      "growth UX",
      "first 14 days",
      "UXLAB",
    ],
    entities: [
      "UXLAB",
      "activation loop",
      "retention",
      "aha moment",
      "habit loop",
      "conversion",
    ],
    takeaways: [
      "Define one measurable “first value” event—not a tutorial complete.",
      "Instrument time-to-value and day-7 / day-14 retention together.",
      "Design the return cue in the first session, not in a later email drip.",
      "Cut steps that delay the aha; protect the path that creates the loop.",
    ],
    sections: [
      {
        heading: "What an activation loop is",
        paragraphs: [
          "An activation loop is a closed cycle where the first meaningful outcome a user gets also sets up the next visit. Unlike a one-off onboarding checklist, the loop is self-reinforcing: each success makes the product more valuable or more habitual.",
          "For growth teams, the practical definition is simple: a user reaches first value, receives a clear reason to come back, and does come back within a short window—typically measured inside the first 14 days.",
        ],
      },
      {
        heading: "Why the first 14 days matter",
        paragraphs: [
          "Most churn for B2C and PLG products concentrates early. If the loop does not form in the first two weeks, acquisition cost is wasted and retention curves flatten. That is why UXLAB treats days 0–14 as a dedicated design surface—not a soft handoff after “ship onboarding.”",
          "The window is long enough to see a habit cue land, and short enough that you can still change the product before the cohort is lost.",
        ],
        bullets: [
          "Day 0–1: reach first value with minimal friction.",
          "Day 2–7: reinforce with a return cue tied to that value.",
          "Day 8–14: confirm the loop with a second success, not vanity opens.",
        ],
      },
      {
        heading: "How UXLAB designs the loop",
        paragraphs: [
          "We map the current path to first value, remove steps that do not create outcome, and place habit cues where they belong in the product—not only in CRM. Experiments then target time-to-value and early retention together so you do not “win” activation while losing week-two return.",
        ],
      },
    ],
    faq: [
      {
        question: "What is an activation loop in product growth?",
        answer:
          "An activation loop is a product cycle where a user’s first valuable outcome creates the next reason to return. Closing that cycle in the first 14 days is a primary driver of retention for growth-led products.",
      },
      {
        question: "How does UXLAB improve activation without just adding tips?",
        answer:
          "UXLAB shortens time-to-value, defines a clear first-value event, and designs in-product return cues. Tips and emails support the loop; they do not replace a product path that delivers outcome early.",
      },
    ],
  },
  {
    slug: "a-practical-playbook-for-cro-experiments-that-ship-weekly",
    category: "Best Practices",
    title: "A practical playbook for CRO experiments that ship weekly",
    description:
      "A practical CRO experiment playbook from UXLAB: weekly shipping cadence, clear hypotheses, and UX changes grounded in behavior—not opinion.",
    answerCapsule:
      "Weekly CRO experiments work when each test has one hypothesis, one primary metric, and a shippable UX change. UXLAB’s playbook: prioritize by impact × confidence × effort, run clean A/Bs or holdouts, and ship winners into the design system so learning compounds.",
    date: "Jun 12, 2026",
    datePublished: "2026-06-12",
    dateModified: "2026-06-12",
    readTime: "5 min read",
    image: "/glance/oura-case.jpg",
    imageAlt: "Hand with smart ring — visual for experimentation and CRO cadence",
    author: AUTHOR,
    keywords: [
      "CRO experiments",
      "conversion rate optimization",
      "A/B testing",
      "weekly experiments",
      "growth UX",
      "UXLAB",
    ],
    entities: [
      "UXLAB",
      "CRO",
      "A/B test",
      "hypothesis",
      "conversion rate",
      "experiment cadence",
    ],
    takeaways: [
      "One hypothesis, one primary metric per experiment.",
      "Prefer shippable UX diffs over mock-only concept tests.",
      "Keep a visible backlog scored by impact, confidence, and effort.",
      "Document winners and losers so the org stops retesting myths.",
    ],
    sections: [
      {
        heading: "Why weekly beats quarterly big-bets",
        paragraphs: [
          "Large redesigns hide what moved the metric. A weekly cadence forces small, observable changes and builds a habit of evidence. Teams that ship experiments every week learn faster than teams that debate a single homepage rewrite for a quarter.",
        ],
      },
      {
        heading: "The UXLAB weekly CRO loop",
        paragraphs: [
          "Monday: pick the next test from a scored backlog. Mid-week: implement the smallest change that can falsify the hypothesis. End of week: read the result, ship or revert, and write a three-line decision note.",
          "The goal is not more tests for vanity—it is a reliable machine that improves conversion, activation, or revenue per visit without guessing.",
        ],
        bullets: [
          "Hypothesis in plain language (“If we… then… because…”).",
          "Primary metric + guardrails (e.g. activation must not drop).",
          "Sample size / runtime agreed before launch.",
        ],
      },
      {
        heading: "What to test first",
        paragraphs: [
          "Start where intent is high and friction is visible: pricing clarity, signup steps, empty states after signup, and the first success path. UXLAB rarely starts with brand-only hero copy when the funnel is leaking two steps later.",
        ],
      },
    ],
    faq: [
      {
        question: "How often should a team run CRO experiments?",
        answer:
          "A practical cadence is weekly: one focused experiment that can ship, with a clear hypothesis and primary metric. Consistency beats occasional large tests.",
      },
      {
        question: "What makes a good CRO hypothesis?",
        answer:
          "A good hypothesis states the change, the expected metric movement, and the user reason. Example: “If we reduce signup fields to email + password, completion will rise because mobile users abandon multi-step forms.”",
      },
    ],
  },
  {
    slug: "design-systems-that-protect-conversion-under-product-velocity",
    category: "Engineering",
    title: "Design systems that protect conversion under product velocity",
    description:
      "How UXLAB builds design systems that protect conversion while teams ship fast—tokens, patterns, and QA that keep growth UX consistent.",
    answerCapsule:
      "A design system protects conversion under velocity when it encodes proven growth patterns—not only colors and buttons. UXLAB systems capture high-performing funnel components, accessibility, and analytics hooks so new screens inherit what already converts.",
    date: "May 28, 2026",
    datePublished: "2026-05-28",
    dateModified: "2026-05-28",
    readTime: "6 min read",
    image: "/glance/moxion.jpg",
    imageAlt: "Industrial vehicle on road — visual for systems under product velocity",
    author: AUTHOR,
    keywords: [
      "design systems",
      "conversion",
      "product velocity",
      "growth UX",
      "component library",
      "UXLAB",
    ],
    entities: [
      "UXLAB",
      "design system",
      "conversion patterns",
      "design tokens",
      "product velocity",
      "funnel components",
    ],
    takeaways: [
      "Put winning funnel patterns in the system, not only in Figma posters.",
      "Pair components with analytics events and accessibility defaults.",
      "Version breaking changes so growth tests stay comparable.",
      "Review new marketing and product surfaces against the system before launch.",
    ],
    sections: [
      {
        heading: "Velocity without conversion debt",
        paragraphs: [
          "Fast teams copy-paste UI. Over time, signup, pricing, and activation diverge—and conversion becomes a lottery. A growth-aware design system reduces that drift by making the default path the proven path.",
        ],
      },
      {
        heading: "What belongs in a conversion-safe system",
        paragraphs: [
          "Beyond tokens and type, include: form patterns with validation, CTA hierarchy, empty states, pricing blocks, consent patterns, and loading / error states that do not abandon the session. Each should ship with recommended analytics events so experiments stay comparable across releases.",
        ],
        bullets: [
          "Primary / secondary CTA rules that match funnel intent.",
          "Accessible focus and contrast baked into components.",
          "Documented do/don’t for growth-critical screens.",
        ],
      },
      {
        heading: "How UXLAB operationalizes it",
        paragraphs: [
          "We audit live funnels, extract what already works, and encode it into components teams actually use. Then we gate launches: if a surface invents a new signup pattern, it needs a reason—or it uses the system.",
        ],
      },
    ],
    faq: [
      {
        question: "Can a design system improve conversion rate?",
        answer:
          "Yes, when it standardizes proven funnel patterns and prevents accidental regressions. A system that only stores colors will not protect conversion; a system that ships battle-tested growth components will.",
      },
      {
        question: "How does UXLAB keep systems useful at high velocity?",
        answer:
          "UXLAB prioritizes components on the critical path to signup, activation, and purchase, attaches analytics guidance, and reviews new surfaces against those patterns before launch.",
      },
    ],
  },
  {
    slug: "where-ai-belongs-in-growth-ux-and-where-it-still-fails",
    category: "Announcements",
    title: "Where AI belongs in growth UX — and where it still fails",
    description:
      "Where AI belongs in growth UX according to UXLAB—and where chat widgets and novelty still fail conversion, activation, and trust.",
    answerCapsule:
      "AI belongs in growth UX where it reduces friction or increases clarity at a decision point—search, personalization, summarization, guided setup. It fails when it replaces a clear path with open-ended chat, adds latency, or hides accountability. UXLAB ships AI only when it moves activation or conversion with a measurable job-to-be-done.",
    date: "Apr 9, 2026",
    datePublished: "2026-04-09",
    dateModified: "2026-04-09",
    readTime: "8 min read",
    image: "/glance/pergola.jpg",
    imageAlt: "Modern structure at dusk — visual for AI in growth UX",
    author: AUTHOR,
    keywords: [
      "AI growth UX",
      "AI product design",
      "conversion",
      "activation",
      "AI transformation",
      "UXLAB",
    ],
    entities: [
      "UXLAB",
      "AI",
      "growth UX",
      "activation",
      "conversion",
      "generative UI",
      "chat interface",
    ],
    takeaways: [
      "Start from the user job and metric—not from a model demo.",
      "Prefer embedded assistance over a generic chat overlay.",
      "Measure latency, error recovery, and trust—not only novelty NPS.",
      "Keep a deterministic fallback when AI is uncertain.",
    ],
    sections: [
      {
        heading: "Where AI helps growth UX",
        paragraphs: [
          "AI helps when it shortens the path to a decision: classifying intent, filling defaults, explaining a complex plan, or retrieving the right object in a large catalog. In those cases it can raise activation and conversion because the user spends less time stuck.",
        ],
        bullets: [
          "Guided setup that adapts to account type.",
          "Inline explanations for pricing or permissions.",
          "Smart defaults that reflect similar successful users.",
        ],
      },
      {
        heading: "Where AI still fails",
        paragraphs: [
          "AI fails growth when it forces conversation instead of action, invents UI that cannot be verified, or slows the critical path. A chat widget on a pricing page rarely beats a clear comparison table. Hallucinated steps destroy trust faster than a simple empty state.",
        ],
      },
      {
        heading: "UXLAB’s rule for shipping AI",
        paragraphs: [
          "We require a job-to-be-done, a metric, a latency budget, and a non-AI fallback. If the feature cannot beat the deterministic baseline on that metric, it does not ship as a growth surface—full stop.",
        ],
      },
    ],
    faq: [
      {
        question: "Should every product add an AI chat for growth?",
        answer:
          "No. Chat helps when the user’s job is exploratory. For conversion and activation, embedded assistance and clearer deterministic UX usually outperform a generic chat overlay.",
      },
      {
        question: "How does UXLAB decide where to put AI in the product?",
        answer:
          "UXLAB looks for high-friction decision points with a measurable outcome. AI ships there only if it beats a non-AI baseline on activation, conversion, or task success—with a clear fallback.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

/** Canonical slug for a route param, or undefined if unknown. */
export function resolveCanonicalArticleSlug(slug: string): string | undefined {
  if (ARTICLES.some((article) => article.slug === slug)) return slug;
  return LEGACY_ARTICLE_SLUGS[slug];
}

export function getArticleSlugs(): string[] {
  return ARTICLES.map((article) => article.slug);
}

export function getArticleCategories(): string[] {
  return [...new Set(ARTICLES.map((article) => article.category))];
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  return ARTICLES.filter((article) => article.slug !== slug).slice(0, limit);
}

export function articlePath(slug: string): string {
  return `/resources/${slug}`;
}

/** Model prompt for the article-page ask-bar “Summarize” chip. */
export function articleSummarizePrompt(article: Article, url: string): string {
  const body = article.sections
    .map((section) => {
      const paragraphs = section.paragraphs.join("\n\n");
      const bullets = section.bullets?.length
        ? section.bullets.map((item) => `- ${item}`).join("\n")
        : "";
      return `## ${section.heading}\n\n${paragraphs}${
        bullets ? `\n\n${bullets}` : ""
      }`;
    })
    .join("\n\n");

  const takeaways = article.takeaways.map((item) => `- ${item}`).join("\n");
  const faq = article.faq
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");

  return [
    "Summarize this UXLAB article for a reader who has not opened it yet.",
    "Cover the core argument, key takeaways, and who it helps. Be concise and specific. Do not invent details that are not in the article.",
    "",
    `Title: ${article.title}`,
    `URL: ${url}`,
    `Category: ${article.category}`,
    "",
    "Direct answer:",
    article.answerCapsule,
    "",
    "Key takeaways:",
    takeaways,
    "",
    "Article:",
    body,
    faq ? `\nFAQ:\n${faq}` : "",
  ].join("\n");
}
