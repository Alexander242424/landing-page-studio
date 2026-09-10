export type Solution = {
  title: string;
  slug: string;
  /** One-line mega-menu teaser */
  blurb: string;
  body: string;
  video: string;
  /** Optional still used instead of video in the stack card media slot. */
  image?: string;
};

/** Canonical Solutions / Challenges We Solve — keep footer & #solutions in sync. */
export const SOLUTIONS: Solution[] = [
  {
    title: "Conversion Rate Optimisation",
    slug: "product-performance",
    blurb: "CRO, activation, retention, and LTV improvements that compound.",
    body: "We find the highest-impact opportunities across the product journey and improve the screens and steps that shape conversion, activation, retention, and revenue.",
    video: "/challenges/c1.mp4",
    image: "/challenges/product-metrics.jpg",
  },
  {
    title: "Product Design",
    slug: "product-design",
    blurb: "Clear product experiences, ready to build.",
    body: "We design the flows, screens, states, and systems that make complex products easier to understand, use, and ship.",
    video: "/challenges/c3.mp4",
    image: "/challenges/product-design.jpg",
  },
  {
    title: "Websites + Landing Pages",
    slug: "websites",
    blurb: "Conversion-focused sites and funnels built for qualified demand.",
    body: "We shape the positioning, page structure, product story, and conversion paths that turn visits into qualified demos, trials, and pipeline.",
    video: "/challenges/c4.mp4",
    image: "/challenges/websites.jpg",
  },
  {
    title: "Testing & Experimentation",
    slug: "testing-experimentation",
    blurb: "User research and experiments that validate product decisions.",
    body: "We test ideas with real users and clear metrics before full build, so the team can move forward with evidence instead of assumptions.",
    video: "/challenges/c2.mp4",
    image: "/challenges/testing-experimentation.jpg",
  },
  {
    title: "AI Native Engineering",
    slug: "ai-engineering",
    blurb: "AI-native product engineering from brief to production.",
    body: "We use AI-native tools to design, build, and ship reliable product experiences faster, with production quality and maintainable code.",
    video: "/challenges/c5.mp4",
    image: "/challenges/ai-engineering.jpg",
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
