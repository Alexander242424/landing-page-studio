export type HomeFaq = {
  question: string;
  answer: string;
};

/** Home FAQ — shared by FaqSection UI and FAQPage JSON-LD. */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: "What does UXLAB actually do?",
    answer:
      "We grow revenue by improving product performance—UX, journeys, and the metrics behind conversion, activation, retention, and LTV. Strategy and craft in one loop, not slides that die in a deck.",
  },
  {
    question: "Who do you partner with?",
    answer:
      "Product-led teams and founders who already have traction and need sharper experience systems—SaaS, marketplaces, consumer apps, and growth-stage brands ready to compound.",
  },
  {
    question: "How do engagements usually start?",
    answer:
      "Share your product or landing page. We diagnose the highest-friction moments, align on the growth lever, then move into focused design, validation, and shipping—not a months-long discovery theater.",
  },
  {
    question: "Do you only design, or do you ship?",
    answer:
      "We design to ship. We partner closely with your eng and product teams so changes land in production, get measured, and feed the next iteration.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Against the metrics that matter for your model—conversion, activation, retention, ARPU, LTV. Every intervention is framed as a hypothesis with a clear read on impact.",
  },
  {
    question: "How many clients do you take?",
    answer:
      "A small number each year. Limited capacity is intentional: deeper focus, faster loops, and outcomes that compound instead of parallelized agency output.",
  },
];
