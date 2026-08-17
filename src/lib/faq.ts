export type HomeFaq = {
  question: string;
  answer: string;
};

/** Home FAQ — shared by FaqSection UI and FAQPage JSON-LD. */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: "What does UXLAB actually do?",
    answer:
      "We grow revenue by fixing the product moments that kill it. UX, CRO, conversion, activation, retention, and LTV — strategy and execution in one loop, not slides that never ship.",
  },
  {
    question: "Who do you partner with?",
    answer:
      "Product-led teams and founders who already have traction and need sharper growth. SaaS, marketplaces, consumer apps, and growth-stage brands where the experience is the product.",
  },
  {
    question: "How do engagements usually start?",
    answer:
      "Share your product or site. We diagnose the highest-friction moments, align on the growth lever, then move into design, validation, and shipping — no months-long discovery phase.",
  },
  {
    question: "Do you only design, or do you ship?",
    answer:
      "We design to ship. We work closely with your engineering and product teams so changes land in production, get measured, and feed the next iteration.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Against the metric that matters for your model — conversion, activation, retention, ARPU, or LTV. Every change is framed as a hypothesis with a clear read on impact.",
  },
  {
    question: "How many clients do you take?",
    answer:
      "A small number each year. Limited capacity is intentional: deeper focus, faster loops, and outcomes that compound instead of parallel agency output.",
  },
];
