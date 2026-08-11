export type Solution = {
  title: string;
  body: string;
  video: string;
};

/** Canonical Solutions / Challenges We Solve — keep footer & #solutions in sync. */
export const SOLUTIONS: Solution[] = [
  {
    title: "Product Performance Optimization",
    body: "We lift CRO, activation, retention, and LTV together—fixing the screens and steps where people stall so the same traffic converts, compounds, and pays more over time.",
    video: "/challenges/c1.mp4",
  },
  {
    title: "End-to-end product development",
    body: "We design and ship the full product—structure, flows, and UI—aimed at activation, conversion, and LTV, not just a prettier interface.",
    video: "/challenges/c3.mp4",
  },
  {
    title: "User testing & experimentation",
    body: "We validate with real users and experiments before you ship—so you back changes that move conversion, not opinions.",
    video: "/challenges/c2.mp4",
  },
  {
    title: "End-to-end product launch",
    body: "We line up messaging, onboarding, and the first-session path so launch traffic turns into activated users—not a one-day spike.",
    video: "/challenges/c4.mp4",
  },
  {
    title: "AI Transformation",
    body: "We put AI into the product where it cuts friction or opens revenue—clearer workflows, smarter surfaces, better activation.",
    video: "/challenges/c5.mp4",
  },
];
