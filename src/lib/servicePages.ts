import type { HomeFaq } from "@/lib/faq";
import type { Solution } from "@/lib/solutions";
import { SOLUTIONS } from "@/lib/solutions";

export type ServiceHeroContent = {
  /** Accessible full headline */
  ariaLabel: string;
  /** Visual lines for awards char reveal (desktop / tablet) */
  lines: readonly string[];
  /** Optional narrower mobile line breaks when desktop `lines` differ */
  linesMobile?: readonly string[];
  /** Supporting description — wraps naturally, not authored as line breaks */
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  logosStat: string;
};

export type ServiceOutcome = {
  title: string;
  body: string;
};

export type ServiceProcessStep = {
  title: string;
  body: string;
};

export type ServicePageContent = {
  slug: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  serviceType: string;
  hero: ServiceHeroContent;
  valueProp: {
    id: string;
    taglineBefore: string;
    taglineLinkLabel: string;
    taglineLinkHref: string;
    taglineAfter: string;
    title: string;
    paragraphs: string[];
  };
  outcomes: {
    id: string;
    leadBefore: string;
    leadLinkLabel: string;
    leadLinkHref: string;
    leadAfter: string;
    items: ServiceOutcome[];
  };
  process: {
    items: ServiceProcessStep[];
  };
  faqs: HomeFaq[];
};

const LOGOS_STAT = "Trusted by YCombinator \n& Speedrun founders";

const SHARED_CTAS = {
  primaryCta: { label: "Let's talk", href: "#contact" },
  secondaryCta: { label: "See results", href: "#glance" },
  logosStat: LOGOS_STAT,
} as const;

function pathFor(slug: string) {
  return `/solutions/${slug}`;
}

/** Product metrics performance */
export const PRODUCT_PERFORMANCE: ServicePageContent = {
  slug: "product-performance",
  path: pathFor("product-performance"),
  title: "Conversion Rate Optimisation",
  description:
    "You already have the traffic. UXLAB finds where your product leaks revenue — at signup, activation, the paywall, retention — fixes it, and installs a system that keeps compounding after we leave.",
  keywords: [
    "product performance",
    "CRO",
    "conversion rate optimization",
    "activation",
    "retention",
    "LTV",
    "product metrics",
    "UXLAB",
  ],
  serviceType: "Product performance / CRO",
  hero: {
    ariaLabel: "Convert 2-3x more revenue with the same traffic.",
    lines: ["Convert 2-3x more revenue", "with the same traffic."],
    linesMobile: ["Convert 2-3x", "more revenue with", "the same traffic."],
    description:
      "We help the most innovative AI startups and product teams grow revenue and scale business through conversions, design and AI engineering.",
    primaryCta: { label: "Let's talk", href: "#contact" },
    secondaryCta: { label: "Free CRO audit", href: "#contact" },
    logosStat: LOGOS_STAT,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "You already have the traffic. The leak is the product — at signup, onboarding, the paywall, the renewal. Fix those moments and you get",
    taglineLinkLabel: "revenue that compounds without buying more visits",
    taglineLinkHref: "#outcomes",
    taglineAfter: ".",
    title: "Your existing traffic, finally converting.",
    paragraphs: [
      "You've been papering over leaks with more acquisition spend. We reverse that: map every drop-off across the full journey, rank by revenue impact, and ship the changes that move your numbers.",
      "You leave with a working performance system — not a deck. Shippable experiments, clear metric definitions, and a backlog your team can run after we're gone.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is a revenue-compounding product — friction found, interventions shipped, and a backlog that keeps working after we're gone. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "Full-journey visibility.",
        body:
          "We analyze every step from first touchpoint to checkout, across devices and segments, to pinpoint exactly where revenue is lost.",
      },
      {
        title: "Outcomes, not deliverables.",
        body:
          "We don't sell test quotas or monthly reports. We isolate the highest-impact 10% of opportunities first and concentrate our effort where it compounds.",
      },
      {
        title: "One integrated methodology.",
        body:
          "Behavioral data, user research and design, unified in a single conversion strategy rather than split across disconnected CRO and UX teams.",
      },
      {
        title: "Senior-led, system-powered.",
        body:
          "Our most experienced strategists stay hands-on, backed by engineers, analytics and proprietary tooling, so their time goes into decisions that move conversion.",
      },
      {
        title: "Measured against your baseline.",
        body:
          "We go beyond traffic and clicks, benchmarking conversion rate and revenue per visitor and reporting the lift with full accountability.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get a clear picture of where revenue leaks: which screens kill conversion, where users stall, and which moments matter most for your growth model.",
      },
      {
        title: "Prototype",
        body: "You see shippable solutions to your highest-friction moments — redesigned flows, paywalls, onboarding patterns — built to test and ship, not to impress.",
      },
      {
        title: "Validate",
        body: "You know what works before spending eng cycles on it. Experiments confirm or kill each hypothesis with a clean signal, not a stakeholder vote.",
      },
      {
        title: "Ship",
        body: "Changes reach production. You stay in the loop at every step — tight cycles, clear ownership, and craft that lands the way it was designed.",
      },
      {
        title: "Compound",
        body: "You leave with a system that keeps lifting. Patterns, playbooks, and a backlog that compounds after the engagement — not a one-shot optimization.",
      },
    ],
  },
  faqs: [
    {
      question: "What problem does this actually solve for me?",
      answer:
        "Your product has traffic but leaks revenue at signup, onboarding, the paywall, and retention. We find those moments, fix them, and install a measurement system so the same visitors convert harder and stay longer — without buying more traffic.",
    },
    {
      question: "How is this different from a typical CRO agency?",
      answer:
        "Classic CRO optimizes landing pages. Your leaks are usually deeper — in the product itself, the onboarding, the paywall. We work the full journey so lifts show up in revenue, not just click-through rate.",
    },
    {
      question: "What do we need to get started?",
      answer:
        "Access to the product, baseline analytics, and one clear primary metric. Share a URL and your biggest friction point — we diagnose from there and propose a focused first sprint.",
    },
    {
      question: "How fast will we see results?",
      answer:
        "First shippable interventions land within opening weeks. Measurable lifts depend on your traffic volume and eng cycle time — we frame every change with an expected impact and a clear read threshold.",
    },
    {
      question: "Do you advise or actually ship?",
      answer:
        "We ship. We work with your eng and product teams so every change reaches production, gets measured, and feeds the next iteration. Decks without deployed code don't count as done.",
    },
    {
      question: "How will I know it worked?",
      answer:
        "Against your model's metrics — conversion, activation, retention, ARPU, LTV. We frame every intervention as a hypothesis with a clear impact story before touching the product.",
    },
  ],
};

/** Conversion-Centered Design */
export const PRODUCT_DESIGN: ServicePageContent = {
  slug: "product-design",
  path: pathFor("product-design"),
  title: "Conversion-Centered Design",
  description:
    "Product design for SaaS, AI, and digital products. We make complex workflows clearer, easier to use, and ready for your team to build.",
  keywords: [
    "product design",
    "UX design",
    "activation flow design",
    "conversion UX",
    "CRO design",
    "design system",
    "UXLAB",
  ],
  serviceType: "Product design",
  hero: {
    ariaLabel: "Product design for fast-moving product teams.",
    lines: ["Product design for", "fast-moving product teams."],
    description:
      "We design product experiences that make complex workflows clear, easy to use, and ready to build.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "From an early MVP to a live platform, we design the flows, screens, and systems that help users understand",
    taglineLinkLabel: "what to do next",
    taglineLinkHref: "#outcomes",
    taglineAfter: ".",
    title: "A product system your team can build on.",
    paragraphs: [
      "We design the journeys, screens, states, and components that make your product feel clear and consistent.",
      "The work is shaped with your product and engineering teams, so every decision can move from Figma into the real product.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "Product design can start with one difficult flow or cover the whole product. We focus on what your users and team need now. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "UX audit.",
        body: "We review the current product, find where people get stuck, and show what should be improved first.",
      },
      {
        title: "User flows and information architecture.",
        body: "We map journeys, navigation, decisions, and onboarding so every next step makes sense.",
      },
      {
        title: "Wireframes and UX.",
        body: "We solve the structure and logic of key screens before moving into the final visual design.",
      },
      {
        title: "Product UI.",
        body: "We design dashboards, onboarding, forms, tables, mobile screens, and the workflows your users rely on.",
      },
      {
        title: "Design system foundations.",
        body: "We create reusable components, patterns, and states that keep the product consistent as it grows.",
      },
      {
        title: "Developer-ready handoff.",
        body: "Your team gets organized files, responsive notes, component logic, and support while the product is being built.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Product audit",
        body: "We review the product, users, goals, current flows, feedback, and data to understand what needs to change.",
      },
      {
        title: "User flows",
        body: "We map the main journeys and agree on the structure before designing individual screens.",
      },
      {
        title: "Wireframes",
        body: "We work through screen structure, content, states, and edge cases in a simple form that is easy to review.",
      },
      {
        title: "Product UI",
        body: "We apply the visual direction and build a clear, reusable interface across the key product flows.",
      },
      {
        title: "Handoff and QA",
        body: "We prepare the files, explain the logic, review implementation, and help your team ship the intended experience.",
      },
    ],
  },
  faqs: [
    {
      question: "How do you get up to speed with our product?",
      answer:
        "We review the product, user flows, business goals, team feedback, analytics, competitors, and existing research. This gives us enough context to improve the experience without starting from assumptions.",
    },
    {
      question: "Can you work with our product manager and engineers?",
      answer:
        "Yes. We work directly with founders, product managers, engineers, and internal designers. We can join your existing tools and keep feedback and handoff close to the work.",
    },
    {
      question: "Do you improve the UX or only redesign the screens?",
      answer:
        "Both. Sometimes the interface needs polish. Sometimes the flow, hierarchy, copy, or product logic is the real problem. We solve the experience before decorating it.",
    },
    {
      question: "Can you work with our existing design system?",
      answer:
        "Yes. We can use it, clean it up, extend it, or create the missing components and states. We only rebuild what is getting in the team's way.",
    },
    {
      question: "Can you help after the designs are handed off?",
      answer:
        "Yes. We answer developer questions, review implementation, resolve edge cases, and help keep the shipped product close to the approved design.",
    },
  ],
};

/** Websites + Funnels */
export const WEBSITES: ServicePageContent = {
  slug: "websites",
  path: pathFor("websites"),
  title: "Websites + Landing Pages",
  description:
    "You're spending on traffic but the site isn't closing. UXLAB builds conversion-first sites and funnels that turn visits into qualified demos, trials, and pipeline for funded B2B and AI startups.",
  keywords: [
    "website design",
    "landing pages",
    "conversion funnels",
    "B2B website",
    "SaaS marketing site",
    "demand generation",
    "CRO",
    "UXLAB",
  ],
  serviceType: "Websites and funnels",
  hero: {
    ariaLabel: "Sites and funnels that turn visitors into qualified demand.",
    lines: ["Sites and funnels that turn", "visitors into qualified demand."],
    description:
      "A good site makes the next step feel obvious. We build the positioning, structure, and conversion paths that turn visits into pipeline.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "You're spending on traffic but visitors arrive, can't parse the offer, and leave. We build the site and funnels that turn that traffic into",
    taglineLinkLabel: "qualified demos, trials, and pipeline",
    taglineLinkHref: "#outcomes",
    taglineAfter: " — not bounce rates.",
    title: "A site that closes while you sleep.",
    paragraphs: [
      "Most B2B and AI startup sites fail at the first job: making the value obvious to someone who's never heard of you. Visitors arrive curious and leave confused. We fix that with clear positioning, page structure, and CTAs built around how your buyers actually evaluate and decide.",
      "You get a conversion-ready system your team can test and iterate: analytics wired from day one, modular sections you can swap, and a CRO hypothesis backlog — not a static build that goes stale in a quarter.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is a site system that converts — clear offer, guided buyer path, and pages built to keep improving. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "Offer clarity and positioning.",
        body: "Your value is obvious in the first scroll — for a buyer who's never heard of you. No jargon, no buried proof, no 12-section homepage that explains everything and closes nothing.",
      },
      {
        title: "Conversion-first page structure.",
        body: "Hero, proof, pricing, and capture moments built around how real buyers move — so the next step always feels obvious, not like effort.",
      },
      {
        title: "Product storytelling for complex offers.",
        body: "Technical and AI products explained without dumbing down — narratives that respect smart buyers and still drive the qualified click.",
      },
      {
        title: "Trust signals and social proof.",
        body: "Credibility markers placed where doubt lives in the buyer journey — not in a footer no one reads. Logos, case data, and specifics that earn the next step.",
      },
      {
        title: "Funnel and CTA architecture.",
        body: "Awareness to action: landing pages, nurture, pricing, and capture moments designed for how your buyers actually evaluate — so the leads that arrive actually close.",
      },
      {
        title: "Analytics and CRO hypothesis backlog.",
        body: "Instrumentation from day one and a sequenced test backlog — so conversion keeps improving after launch instead of freezing until the next redesign budget.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get a clear read on why visitors leave: weak offer clarity, confused buyer path, missing proof, or a funnel that doesn't match how your buyers actually decide.",
      },
      {
        title: "Prototype",
        body: "You see page structures and key templates before full build — hero, proof, pricing, capture — designed for qualified conversion, not for a design award.",
      },
      {
        title: "Validate",
        body: "Your copy and layout hypotheses get tested with real signal before engineering investment. You know what drives qualified action, not just scroll depth.",
      },
      {
        title: "Ship",
        body: "You get a live site with tracking, performance, and SEO fundamentals wired from day one — so you can read results and act on them immediately.",
      },
      {
        title: "Compound",
        body: "You leave with a CRO backlog and a modular system so the site keeps improving rather than fossilizing after launch.",
      },
    ],
  },
  faqs: [
    {
      question: "My site looks great — why am I not converting?",
      answer:
        "Usually because it looks great for you, not for a buyer who's never heard of you. The offer is unclear, the proof is buried, or the path to conversion isn't obvious. We fix the structure, not just the aesthetics.",
    },
    {
      question: "What makes this different from a brand agency?",
      answer:
        "Brand polish without conversion structure is a beautiful brochure. We optimize for qualified demand: clarity of offer, buyer path, and measurable outcomes — not award-winning design.",
    },
    {
      question: "Can you work in Webflow, Framer, or our own codebase?",
      answer:
        "Yes. We match the stack that fits your team's velocity and ownership. The goal is a site your team can maintain and test — not a locked build that needs an agency retainer to update.",
    },
    {
      question: "What about SEO?",
      answer:
        "We build on solid technical foundations and support content structure that helps discovery. The primary job is converting visits — we don't build sites that work against you in search.",
    },
    {
      question: "How will I know the site is working?",
      answer:
        "By qualified demos, trials, signups, and pipeline — with tracking wired from day one. Page views without action are not a success metric.",
    },
  ],
};

/** Testing & Experimentation */
export const TESTING: ServicePageContent = {
  slug: "testing-experimentation",
  path: pathFor("testing-experimentation"),
  title: "Testing & Experimentation",
  description:
    "Your roadmap is mostly opinions. UXLAB installs the research and experimentation loop that turns every change into a confirmed hypothesis or a cheap kill — so your team ships smarter every cycle.",
  keywords: [
    "A/B testing",
    "experimentation",
    "CRO testing",
    "user research",
    "product validation",
    "UXLAB",
  ],
  serviceType: "Testing and experimentation",
  hero: {
    ariaLabel: "Ship what actually moves conversion, not opinions.",
    lines: ["Ship what actually moves", "conversion, not opinions."],
    description:
      "User research and experiments that validate your bets — so you stop shipping features that don't move metrics.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "Your roadmap is mostly opinions. You ship features, metrics barely move, and no one knows why. We give you a program that turns every change into a",
    taglineLinkLabel: "confirmed hypothesis or a cheap kill",
    taglineLinkHref: "#outcomes",
    taglineAfter: " — so shipping gets smarter every cycle.",
    title: "Stop guessing. Start compounding.",
    paragraphs: [
      "Most product teams ship first and wonder why it didn't work second. Research happens after the fact, if at all. The roadmap is built from whoever speaks loudest in planning. We install the loop that fixes this.",
      "You get a program, not a one-off test: research that surfaces real friction, experiments designed for clean reads, and a backlog that compounds insight into decisions your whole team trusts.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is an experimentation system your team can run — every hypothesis tested, every result trusted, every sprint smarter than the last. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "Research that kills bad ideas cheaply.",
        body: "Session review, interviews, and heuristic audits that surface why users stall — real evidence for the backlog, not anecdotes that get overruled in the next review.",
      },
      {
        title: "Experiments your whole team trusts.",
        body: "Hypotheses, variants, and analysis designed for a clean read — including when to stop or iterate without false confidence or sunk-cost bias.",
      },
      {
        title: "A test roadmap that compounds.",
        body: "Prioritized backlog tied to your metrics — plus operating playbooks so your team keeps running experiments after the engagement, not just when we're around.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get a clear opportunity set: where conversion leaks, which hypotheses are worth testing first, and what the data says vs. what the team assumes.",
      },
      {
        title: "Prototype",
        body: "You see test-ready variants before engineering investment — one primary metric, controlled changes, and craft that doesn't confound the experiment.",
      },
      {
        title: "Validate",
        body: "Your hypotheses get a clean read: proper instrumentation, guardrails, and analysis that separates real lift from noise. You know what to ship and what to kill.",
      },
      {
        title: "Ship",
        body: "Winners go to production; losers become documented learning. You avoid re-shipping the same idea under a new name three sprints later.",
      },
      {
        title: "Compound",
        body: "You leave with an operating rhythm and living roadmap so experimentation becomes how you decide — not a special project that disappears after the engagement.",
      },
    ],
  },
  faqs: [
    {
      question: "We don't have much traffic — can we still experiment?",
      answer:
        "Yes, with the right design. With limited traffic we prioritize bigger changes, qualitative validation, and sequential learning. It's still far better than shipping blind and calling it a roadmap.",
    },
    {
      question: "Which tools do you use?",
      answer:
        "The ones that fit your stack and the decision quality you need — Optimizely, LaunchDarkly, GrowthBook, native feature flags, or analytics-led holdouts. Tool choice follows the problem.",
    },
    {
      question: "Is this only A/B testing?",
      answer:
        "No. A/B tests are one tool. We blend UX research, prototype testing, and quantitative experiments — and sometimes the right next step is a study or prototype test before a full A/B.",
    },
    {
      question: "We already have a CRO team — how do you fit?",
      answer:
        "We amplify. Research depth, experiment design, prioritization rigour, and a second perspective — without replacing your team's ownership of the program.",
    },
    {
      question: "How fast will we see ROI?",
      answer:
        "Early learning and first wins typically emerge within the opening cycles. Every test is framed with an expected impact and a clear kill criteria — so you're always making progress, even when a test loses.",
    },
    {
      question: "What if a test fails?",
      answer:
        "A clean negative is progress. You stop shipping the same opinion in new packaging. We document why, update the backlog, and the next test starts from a better place.",
    },
  ],
};

/** AI Engineering */
export const AI_ENGINEERING: ServicePageContent = {
  slug: "ai-engineering",
  path: pathFor("ai-engineering"),
  title: "AI Native Engineering",
  description:
    "You have more roadmap than cycles. UXLAB ships your features in days using AI-first engineering — production quality, your stack, your team keeps the velocity after we leave.",
  keywords: [
    "AI-first development",
    "AI engineering",
    "ship faster with AI",
    "AI product development",
    "rapid product engineering",
    "LLM engineering",
    "AI-native build",
    "UXLAB",
  ],
  serviceType: "AI-first product engineering",
  hero: {
    ariaLabel: "Ship your backlog 3× faster at production quality.",
    lines: ["Ship your backlog 3× faster", "at production quality."],
    description:
      "AI-native builds turn a scoped brief into a live product in days — your roadmap ships faster without the quality trade-off.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "You have more roadmap than cycles. Hiring takes months. Agencies take longer. We close that gap — AI-first engineering that ships",
    taglineLinkLabel: "your features in days, not sprints",
    taglineLinkHref: "#outcomes",
    taglineAfter: ".",
    title: "Your backlog, finally moving.",
    paragraphs: [
      "LLMs and code generation have collapsed the time from spec to production. Teams that use them effectively ship 3–5× faster without sacrificing quality. We bring that leverage to your product — with the engineering discipline to keep it production-ready.",
      "You get real features shipped: working, maintainable, built for your stack. No six-month timelines, no handoff delays. Just focused builds that land in production and move the metrics you care about.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is real product shipped — fast, clean, and ready to compound. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "Features live in days, not sprints.",
        body: "Your brief goes from spec to production in a fraction of the usual time. The gap between what you want to build and what's actually live closes — measurably.",
      },
      {
        title: "Design and code that ship together.",
        body: "No agency handoff lag. Design, interaction, and engineering move in one loop — so what lands in production matches what was intended, under real load.",
      },
      {
        title: "Your team ships faster after we leave.",
        body: "We embed AI-first workflows and tooling into your process. Your team inherits the velocity — not a dependency on us to keep things moving.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Scope",
        body: "You get a tight build definition: what ships, what done means, and what must not break. The scope is your speed — vague requirements become slow, expensive builds.",
      },
      {
        title: "Build",
        body: "Your feature moves fast. AI-first tooling handles the repeatable work; human judgment handles architecture, edge cases, and the decisions that affect quality and maintainability.",
      },
      {
        title: "Review",
        body: "You get code that passes your team's bar: works under real load, handles edge cases, and is maintainable by engineers who weren't in the room when it was built.",
      },
      {
        title: "Ship",
        body: "You get a live deployment with monitoring, rollback readiness, and documentation. Nothing that requires a heroic sprint to maintain or explain three months later.",
      },
      {
        title: "Iterate",
        body: "You keep the momentum. The speed of AI-first builds makes iteration cheap — measure, adjust, and ship the next increment before the competition catches up.",
      },
    ],
  },
  faqs: [
    {
      question: "How much faster will our features actually ship?",
      answer:
        "Simple features ship in 1–3 days. Product MVPs in 1–2 weeks. The acceleration comes from collapsing the design-to-code gap and removing the back-and-forth that normally eats sprint time.",
    },
    {
      question: "Will AI-generated code create technical debt?",
      answer:
        "In our hands, the opposite. AI handles high-volume, repetitive coding. We apply engineering judgment to architecture, edge cases, and the decisions that actually affect long-term quality — so what ships is maintainable.",
    },
    {
      question: "Will this actually be production-ready?",
      answer:
        "Yes. We work with your stack, follow your conventions, write tests, and ship code your team can maintain and extend. Not a throwaway prototype — production code.",
    },
    {
      question: "What's the difference between this and vibe coding?",
      answer:
        "Discipline. Vibe coding is fast and fragile. We use AI tooling with engineering rigour: types, tests, clear specs, and review cycles that catch what the model misses. You get the speed without the debt.",
    },
    {
      question: "Can you work alongside our existing engineering team?",
      answer:
        "Yes. We embed as a dedicated build pair — moving fast on features your team doesn't have cycles for, while staying aligned with the architecture and standards your team owns.",
    },
    {
      question: "Who is this for?",
      answer:
        "Founders and product teams with more roadmap than cycles — who need to ship more, faster, without hiring a full engineering team or waiting months for an agency.",
    },
  ],
};

export const SERVICE_PAGES: ServicePageContent[] = [
  PRODUCT_PERFORMANCE,
  PRODUCT_DESIGN,
  WEBSITES,
  TESTING,
  AI_ENGINEERING,
];

export const SERVICE_SLUGS = SERVICE_PAGES.map((page) => page.slug);

export function getServicePage(slug: string): ServicePageContent | undefined {
  return SERVICE_PAGES.find((page) => page.slug === slug);
}

export function getAllServicePages(): ServicePageContent[] {
  return SERVICE_PAGES;
}

/** Path for a solution — dedicated landing when available, else home hash. */
export function solutionPath(item: Solution): string {
  const page = getServicePage(item.slug);
  if (page) return page.path;
  return `/#solution-${item.slug}`;
}

export function solutionHasLanding(slug: string): boolean {
  return Boolean(getServicePage(slug));
}

/** Ensure every SOLUTIONS entry has a landing (dev sanity). */
export function missingServiceLandings(): string[] {
  return SOLUTIONS.filter((item) => !solutionHasLanding(item.slug)).map(
    (item) => item.slug,
  );
}
