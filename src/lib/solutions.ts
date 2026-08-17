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
    blurb: "You're shipping features but the numbers don't move.",
    body: "We identify where users drop, stall, and churn — then fix the screens and steps that kill conversion, activation, and retention so the same traffic pays more over time.",
    video: "/challenges/c1.mp4",
  },
  {
    title: "Product Design",
    slug: "product-design",
    blurb: "Your product works, but users stall before they see the value.",
    body: "We design flows and UI that move users to first value and habit — not just a cleaner interface on top of the same broken journey.",
    video: "/challenges/c3.mp4",
  },
  {
    title: "Websites + Funnels",
    slug: "websites",
    blurb: "You're spending on traffic but your site isn't closing.",
    body: "We build pages and funnels that clarify the offer, reduce friction, and turn visits into qualified pipeline — not a polished brochure that exits as fast as it loads.",
    video: "/challenges/c4.mp4",
  },
  {
    title: "Testing & Experimentation",
    slug: "testing-experimentation",
    blurb: "You ship on opinion, not evidence.",
    body: "We validate with real users and experiments before you ship — so every change that goes live has a clear read on whether it moves the number.",
    video: "/challenges/c2.mp4",
  },
  {
    title: "AI Engineering",
    slug: "ai-engineering",
    blurb: "You want to ship faster, but quality can't slip.",
    body: "We design and build with AI-native tooling — from scoped brief to production in days, not months, without trading reliability for speed.",
    video: "/challenges/c5.mp4",
  },
  {
    title: "AI MVP to Product",
    slug: "ai-mvp-to-product",
    blurb: "Your demo works. Real users stall.",
    body: "We turn vibe-coded prototypes and AI-generated builds into products people trust, understand, and return to — from demo that impresses to product that retains.",
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
