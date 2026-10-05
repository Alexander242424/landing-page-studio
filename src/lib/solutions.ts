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
    blurb:
      "Data-driven audits that remove friction from key user journeys.",
    body: "Data-driven audit and optimisation of your key user journeys, removing friction at every step so more visitors become paying customers.",
    video: "/challenges/c1.mp4",
    image: "/challenges/product-metrics.jpg",
  },
  {
    title: "Conversion-Centered Design",
    slug: "product-design",
    blurb:
      "Interfaces and flows designed around your key business actions, tested before launch.",
    body: "Interfaces and user flows designed around your key business actions and tested before launch, so your product is easier to use and converts better.",
    video: "/challenges/c3.mp4",
    image: "/challenges/product-design.jpg",
  },
  {
    title: "Data & Analytics",
    slug: "data-analytics",
    blurb:
      "Event tracking, dashboards, and reporting built around your revenue metrics.",
    body: "Event tracking, dashboards and reporting built around your revenue metrics, giving you a clear view of where users drop off and what drives growth.",
    video: "/challenges/c4.mp4",
    image: "/challenges/websites.jpg",
  },
  {
    title: "Product and pricing experimentation",
    slug: "testing-experimentation",
    blurb:
      "Structured A/B testing for product and pricing, backed by real user behaviour.",
    body: "A structured A/B testing programme for product and pricing, so every decision is backed by real user behaviour and measurable results.",
    video: "/challenges/c2.mp4",
    image: "/challenges/testing-experimentation.jpg",
  },
  {
    title: "AI Native Engineering",
    slug: "ai-engineering",
    blurb:
      "AI-native product experiences that ship faster without compromising quality.",
    body: "Product experiences built with AI-native tools and clean, maintainable code, so you ship faster without compromising quality.",
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
