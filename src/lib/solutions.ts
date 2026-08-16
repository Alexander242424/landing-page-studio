export type Solution = {
  title: string;
  slug: string;
  /** One-line mega-menu teaser */
  blurb: string;
  body: string;
  video: string;
};

/** Canonical Solutions / Challenges We Solve — keep footer & #solutions in sync. */
export const SOLUTIONS: Solution[] = [
  {
    title: "Product metrics performance",
    slug: "product-performance",
    blurb: "CRO, activation, retention, and LTV lifts that compound.",
    body: "We lift CRO, activation, retention, and LTV together—fixing the screens and steps where people stall so the same traffic converts, compounds, and pays more over time.",
    video: "/challenges/c1.mp4",
  },
  {
    title: "Product Design",
    slug: "product-design",
    blurb: "Flows and UI aimed at activation and conversion.",
    body: "We design the product end to end—structure, flows, and UI—aimed at activation, conversion, and LTV, not just a prettier interface.",
    video: "/challenges/c3.mp4",
  },
  {
    title: "Websites + Funnels",
    slug: "websites",
    blurb: "Sites that turn visits into qualified demand.",
    body: "We build marketing and product sites that clarify the offer, guide the first session, and turn visits into qualified demand—not just a static brochure.",
    video: "/challenges/c4.mp4",
  },
  {
    title: "Testing & Experimentation",
    slug: "testing-experimentation",
    blurb: "Validate with users and experiments before you ship.",
    body: "We validate with real users and experiments before you ship—so you back changes that move conversion, not opinions.",
    video: "/challenges/c2.mp4",
  },
  {
    title: "AI Engineering",
    slug: "ai-engineering",
    blurb: "Ship production product 3× faster with AI-first engineering.",
    body: "We design and build products with AI-native tooling — moving from scoped brief to production in days, not months, without trading quality for speed.",
    video: "/challenges/c5.mp4",
  },
  {
    title: "AI MVP to Product",
    slug: "ai-mvp-to-product",
    blurb: "From vibe-coded MVPs to products people trust.",
    body: "We turn vibe-coded prototypes, rough MVPs, and AI-generated builds into products users can trust, understand, and use.",
    video: "/challenges/c1.mp4",
  },
];

/** Detail payload for openContactChat from a Solutions card. */
export function solutionChatContext(item: Solution) {
  return {
    title: item.title,
    slug: item.slug,
    description: item.body,
  };
}
