export type HomeFaq = {
  question: string;
  answer: string;
};

/** Home FAQ — shared by FaqSection UI and FAQPage JSON-LD. */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: "What does UXLAB do?",
    answer:
      "We are a product + build partner for high-growth startups. We help innovative AI startups and product teams grow revenue and scale the business through conversions, design, and AI engineering — then we ship the work, not a slide deck.",
  },
  {
    question: "Who do you work with?",
    answer:
      "High-growth startups and product teams where the product is the growth engine — including YCombinator and Speedrun founders. If you already have traction and need a partner that can lift conversion and ship, we are a fit.",
  },
  {
    question: "How do you help us grow revenue?",
    answer:
      "Through conversion rate optimisation, product design, websites and landing pages, testing and experimentation, and AI native engineering. We find the product and funnel moments that leak revenue, then design and ship the fixes so conversion actually moves.",
  },
  {
    question: "Do you only design, or do you also build?",
    answer:
      "Both. Product + build means we stay through production. We work with your product and engineering teams so CRO, UI, landing pages, experiments, and AI-native features land in the product, get measured, and feed the next loop.",
  },
  {
    question: "How do engagements start?",
    answer:
      "Share the product or site. We diagnose the highest-friction conversion moments, agree the growth lever, then design, test, and ship. No months-long discovery. The first loop is meant to start growth, not fill a research archive.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Better products, higher conversion, and real revenue growth. Every change is a hypothesis against conversion, activation, or revenue — not vanity metrics. Results live in the case studies.",
  },
];
