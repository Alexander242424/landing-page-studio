import type { HomeFaq } from "@/lib/faq";
import type { Solution } from "@/lib/solutions";
import { SOLUTIONS } from "@/lib/solutions";

export type ServiceHeroContent = {
  /** Accessible full headline */
  ariaLabel: string;
  /** Visual lines for awards char reveal (desktop); flow as one wrap on mobile */
  lines: [string, string];
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

const LOGOS_STAT = "Trusted by 200+ YCombinator \n& Speedrun founders";

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
  title: "Product metrics performance",
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
    ariaLabel: "Turn the same traffic into compounding revenue.",
    lines: ["Turn the same traffic", "into compounding revenue."],
    description:
      "Your product leaks. We find where, fix it, and install a system that keeps compounding after we leave.",
    ...SHARED_CTAS,
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
        title: "A friction map ranked by money.",
        body: "Every drop-off moment across signup, onboarding, paywall, and retention — ranked by revenue impact. You know what to fix first, and why.",
      },
      {
        title: "Shippable experiments, not slide decks.",
        body: "Flows, UI, and messaging built to land with your eng team — plus a sequenced experiment roadmap so wins stack instead of resetting each sprint.",
      },
      {
        title: "Metrics your whole team agrees on.",
        body: "Clear definitions for conversion, activation, retention, and LTV — plus playbooks that stick — so product, growth, and leadership pull in the same direction.",
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

/** Product Design */
export const PRODUCT_DESIGN: ServicePageContent = {
  slug: "product-design",
  path: pathFor("product-design"),
  title: "Product Design",
  description:
    "Your product works but people stall — at signup, the core feature, the paywall. UXLAB designs the flows and UI so users reach first value, build habit, and pay — without getting lost.",
  keywords: [
    "product design",
    "UX design",
    "product flows",
    "activation design",
    "conversion UX",
    "UXLAB",
  ],
  serviceType: "Product design",
  hero: {
    ariaLabel: "Design a product they understand and return to.",
    lines: ["Design a product they", "understand and return to."],
    description:
      "Structure, flows, and UI built for the moments that matter — first value, repeat habit, and willingness to pay.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "Your product works but people stall — at signup, at the core feature, at the paywall. We design flows and UI so users reach",
    taglineLinkLabel: "first value, habit, and revenue",
    taglineLinkHref: "#outcomes",
    taglineAfter: " without getting lost.",
    title: "Design that earns its place in the funnel.",
    paragraphs: [
      "Every screen in your product either moves someone forward or loses them. Most teams have screens that do neither — they exist because someone built them, not because they convert. We audit, redesign, and build the flows that matter most.",
      "You get coherent systems your engineering team can ship and maintain: IA, interaction patterns, and UI components with all the states — empty, loading, error, edge cases — built in from the start.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is a product users navigate without hand-holding — flows clear, UI shippable, patterns your team can extend. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "Flows where users don't stall.",
        body: "Mapped journeys from signup to first value to paid habit — with structure that makes the next step obvious even under real-world distraction and edge cases.",
      },
      {
        title: "UI your engineering team can ship.",
        body: "Components, states, and interaction patterns ready for production — with accessibility, empty states, and error cases included, not left as follow-up tickets.",
      },
      {
        title: "A design system that compounds.",
        body: "Living patterns so new features inherit what already converts — and your team stops re-debating the same design decisions every sprint.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get a clear picture of where design fails your users: which screens cause drop-off, where IA hides value, and what's costing you activation or retention.",
      },
      {
        title: "Prototype",
        body: "You see high-fidelity solutions for the highest-leverage screens — built for pressure-testing with real users, not moodboard reviews with stakeholders.",
      },
      {
        title: "Validate",
        body: "You know which designs move task success and time-to-value before heavy build. We cut what decorates without lifting the metric.",
      },
      {
        title: "Ship",
        body: "Your engineering team gets production-ready specs, every state, and a pairing partner — so what ships matches what was designed, down to the edge cases.",
      },
      {
        title: "Compound",
        body: "You get a pattern library that keeps new features consistent with what converts — so design debt doesn't quietly undo the growth you built.",
      },
    ],
  },
  faqs: [
    {
      question: "My product already looks decent — why do I need this?",
      answer:
        "Visual polish isn't the problem. The problem is flows that stall at activation, IA that buries the core feature, or UI states that break trust at the wrong moment. We fix what's losing you revenue, not what's aesthetically weak.",
    },
    {
      question: "Will you redesign everything?",
      answer:
        "We start with the highest-leverage screens. A full redesign is only justified when the architecture genuinely blocks growth — most teams need sharp, focused interventions on the 3–5 surfaces that matter most.",
    },
    {
      question: "How do you hand off to our engineering team?",
      answer:
        "Production-ready specs, every state, and pairing through ship. Not a Figma dump. We stay in the loop until the code matches the intent — edge cases included.",
    },
    {
      question: "Can you work within our existing design system?",
      answer:
        "Yes. We extend or repair what you have. If your system blocks conversion, we propose targeted upgrades — not a full rewrite by default.",
    },
    {
      question: "How do I measure whether the design worked?",
      answer:
        "By the metrics that matter: task success, time-to-value, activation, conversion, retention. Aesthetic preference in a review session is not a success metric.",
    },
    {
      question: "Who gets the most value from this?",
      answer:
        "Product-led teams with real users, a shipping culture, and screens that are losing them revenue — SaaS, marketplaces, consumer apps. Not teams looking for a rebrand.",
    },
  ],
};

/** Websites + Funnels */
export const WEBSITES: ServicePageContent = {
  slug: "websites",
  path: pathFor("websites"),
  title: "Websites + Funnels",
  description:
    "You're spending on traffic but your site isn't closing. UXLAB builds the site and funnels that turn visits into qualified demos, trials, and pipeline — not bounce rates.",
  keywords: [
    "website design",
    "landing pages",
    "funnels",
    "conversion website",
    "demand generation",
    "UXLAB",
  ],
  serviceType: "Websites and funnels",
  hero: {
    ariaLabel: "Sites that turn visits into qualified demand.",
    lines: ["Sites that turn visits", "into qualified demand."],
    description:
      "Your site should be your best salesperson — not a brochure visitors skim and leave.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "You're spending on traffic, but your site isn't closing. Visitors arrive, don't understand the offer, and leave. We build the site and funnels that turn that traffic into",
    taglineLinkLabel: "qualified demos, trials, and pipeline",
    taglineLinkHref: "#outcomes",
    taglineAfter: " — not bounce rates.",
    title: "A site that sells while you sleep.",
    paragraphs: [
      "Most sites fail at the first job: making the value obvious. Visitors arrive knowing nothing; they leave still knowing nothing. We fix that with positioning, structure, and CTAs built around how your buyers actually decide — not what your homepage committee approved.",
      "You get a conversion-ready site your team can test and iterate: instrumentation wired from day one, modular sections you can swap, and a backlog of hypotheses — not a static build that goes stale in a quarter.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is a site system that converts — clear offer, guided path, and pages built to keep improving. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "An offer obvious in the first scroll.",
        body: "Positioning, proof, and hierarchy that make the value clear before a visitor reaches the fold — without burying the CTA under 12 sections of marketing copy.",
      },
      {
        title: "Funnels that qualify before they convert.",
        body: "Awareness → consideration → action: landing, pricing, product, and capture moments that match how real buyers move — so the leads that arrive actually close.",
      },
      {
        title: "A site built to compound, not to launch.",
        body: "Instrumentation, modular architecture, and a test backlog so conversion keeps improving after launch — instead of freezing until the next redesign budget.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get a clear read on why visitors leave: weak offer clarity, confused path, missing proof, or a funnel that doesn't match how your buyers actually decide.",
      },
      {
        title: "Prototype",
        body: "You see page structures and key templates before full build — hero, proof, pricing, capture — designed for qualified conversion, not for design awards.",
      },
      {
        title: "Validate",
        body: "Your copy and layout hypotheses get tested with real signal before engineering investment. You know what drives qualified action, not just scrolls.",
      },
      {
        title: "Ship",
        body: "You get a live site with tracking, performance, and SEO fundamentals wired from day one — so you can read results and act on them immediately.",
      },
      {
        title: "Compound",
        body: "You leave with an experiment roadmap and a modular system so the site keeps improving rather than fossilizing after launch.",
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
      question: "Can you work in Webflow, Framer, or our own codebase?",
      answer:
        "Yes. We match the stack that fits your team's velocity and ownership. The goal is a site your team can maintain and test — not a locked black box that needs an agency retainer to update.",
    },
    {
      question: "What makes this different from a brand agency?",
      answer:
        "Brand polish without conversion structure is a beautiful brochure. We optimize for qualified demand: clarity of offer, path to action, and measurable outcomes — not award-winning design.",
    },
    {
      question: "Do you run ads to the site?",
      answer:
        "We focus on converting the traffic you already have or are buying. We partner with your growth team on landing fit; media buying isn't the core offer.",
    },
    {
      question: "What about SEO?",
      answer:
        "We build on solid technical foundations and support content structure that helps discovery. The primary job is converting visits — but we don't build sites that work against you in search.",
    },
    {
      question: "How will I know the site is working?",
      answer:
        "By qualified demos, trials, signups, and pipeline — with tracking wired from day one. Vanity metrics like page views without action don't count as success.",
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
  title: "AI Engineering",
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

/** AI MVP to Product */
export const AI_MVP: ServicePageContent = {
  slug: "ai-mvp-to-product",
  path: pathFor("ai-mvp-to-product"),
  title: "AI MVP to Product",
  description:
    "Your demo impresses in a pitch. Then real users try it and stall. UXLAB closes the gap between demo-ready and product-ready — before you scale acquisition into a leaky funnel.",
  keywords: [
    "AI MVP",
    "prototype to product",
    "productization",
    "vibe coding",
    "AI startup product",
    "UXLAB",
  ],
  serviceType: "AI MVP to product",
  hero: {
    ariaLabel: "Turn a vibe-coded demo into a product people trust.",
    lines: ["Turn a vibe-coded demo", "into a product people trust."],
    description:
      "Vibe-coded MVPs break on real users. We harden the experience so they activate, return, and pay — without you in the room.",
    ...SHARED_CTAS,
  },
  valueProp: {
    id: "value",
    taglineBefore:
      "Your demo impresses in a pitch. Then real users try it — and stall, get confused, or don't come back. We close the gap between demo-ready and",
    taglineLinkLabel: "product-ready",
    taglineLinkHref: "#outcomes",
    taglineAfter: " — before you scale acquisition into a leaky funnel.",
    title: "From impressive to trustworthy.",
    paragraphs: [
      "Vibe-coded and AI-scaffolded builds optimize for the demo moment. They look great when you're narrating. Under real use — without you in the room — they break on clarity, edge cases, and retention. That gap is costing you your early adopters.",
      "You get a path from prototype to a product people can navigate independently: clear IA, reliable flows, UI systems that handle edge cases, and a growth loop that gives users a reason to return.",
    ],
  },
  outcomes: {
    id: "outcomes",
    leadBefore:
      "What you leave with is a product people navigate, trust, and come back to — not just a demo that wows in a pitch. See",
    leadLinkLabel: "our process",
    leadLinkHref: "#process",
    leadAfter: ".",
    items: [
      {
        title: "A product people use without you.",
        body: "Core jobs-to-be-done mapped into flows users can navigate without narration — so your early adopters succeed on their own and you can start scaling acquisition.",
      },
      {
        title: "A product that doesn't break trust.",
        body: "Loading, errors, empty states, permissions, and AI edge cases designed so users feel in control even when things don't go perfectly.",
      },
      {
        title: "An activation path and roadmap to revenue.",
        body: "The first-value moment defined, the return habit designed, and a prioritized backlog toward retention and monetization — so the product grows beyond the MVP.",
      },
    ],
  },
  process: {
    items: [
      {
        title: "Diagnose",
        body: "You get an honest read: what's demo magic vs. product debt, where real users stall, and what the minimum trust bar is before you scale acquisition.",
      },
      {
        title: "Prototype",
        body: "You see restructured flows and UI that keep the insight of the vibe build — while removing the confusion and dead ends that kill retention.",
      },
      {
        title: "Validate",
        body: "You get activation signal from real users on the hardened experience — before you spend money sending traffic to a product that still breaks at step three.",
      },
      {
        title: "Ship",
        body: "Your engineering team gets production-ready specs and a build partner — so the MVP becomes a maintainable product your team can extend without explanations.",
      },
      {
        title: "Compound",
        body: "You leave with a growth-oriented backlog: activation, retention, and monetization next — so the demo becomes a product trajectory, not a plateau.",
      },
    ],
  },
  faqs: [
    {
      question: "Our demo works fine — why do we need this?",
      answer:
        "Demos optimize for the pitch moment. Products optimize for repeated, independent success. Real users don't have you narrating. We close that gap: clarity, trust, edge cases, and activation so users return without you in the room.",
    },
    {
      question: "Won't this slow us down?",
      answer:
        "It protects your acquisition spend. Sending traffic to a product that breaks on real users is what slows you down — churn before retention and angry early adopters who tell others. We get you production-ready fast.",
    },
    {
      question: "Will you rewrite everything?",
      answer:
        "Only what blocks trust or activation. The insight of the vibe build — what makes it impressive — stays. We replace what confuses, crashes, or can't scale.",
    },
    {
      question: "Can you work with AI-generated code?",
      answer:
        "Yes. We partner with your engineering team to productize the UX layer on top of AI scaffolds — focusing on experience quality, trust, and the growth loops that turn curiosity into retention.",
    },
    {
      question: "What does done look like?",
      answer:
        "Users complete the core job without hand-holding, return for a second session, and you have a clear roadmap toward the revenue milestones that matter.",
    },
    {
      question: "Who is this for?",
      answer:
        "Founders with a promising AI prototype who are about to scale acquisition — and need to be honest about whether the product is actually ready for the users they're paying to acquire.",
    },
  ],
};

export const SERVICE_PAGES: ServicePageContent[] = [
  PRODUCT_PERFORMANCE,
  PRODUCT_DESIGN,
  WEBSITES,
  TESTING,
  AI_ENGINEERING,
  AI_MVP,
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
