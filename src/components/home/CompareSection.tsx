import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

type CompareCell = { kind: "yes" } | { kind: "no" } | { kind: "text"; value: string };

type CompareRow = {
  label: string;
  cells: readonly CompareCell[];
};

const COMPETITOR_COLUMNS = [
  "SaaS tool",
  "In-house hire",
  "Traditional agency",
  "Advisor",
] as const;

const ROWS: readonly CompareRow[] = [
  {
    label: "Ships live, not decks",
    cells: [
      { kind: "yes" },
      { kind: "no" },
      { kind: "text", value: "If they can code" },
      { kind: "text", value: "Usually a deck" },
      { kind: "no" },
    ],
  },
  {
    label: "Judged by revenue",
    cells: [
      { kind: "yes" },
      { kind: "text", value: "Vanity metrics" },
      { kind: "text", value: "Outputs" },
      { kind: "text", value: "Deliverables" },
      { kind: "text", value: "Advice" },
    ],
  },
  {
    label: "Design, test, and build",
    cells: [
      { kind: "yes" },
      { kind: "no" },
      { kind: "text", value: "Split across roles" },
      { kind: "text", value: "Handoffs" },
      { kind: "no" },
    ],
  },
  {
    label: "Tests on real traffic",
    cells: [
      { kind: "yes" },
      { kind: "text", value: "If you set it up" },
      { kind: "text", value: "Not always" },
      { kind: "text", value: "Limited" },
      { kind: "no" },
    ],
  },
  {
    label: "First loop in weeks",
    cells: [
      { kind: "yes" },
      { kind: "text", value: "Setup varies" },
      { kind: "text", value: "Ramp-up" },
      { kind: "text", value: "Discovery first" },
      { kind: "text", value: "No ship date" },
    ],
  },
  {
    label: "Works inside your team",
    cells: [
      { kind: "yes" },
      { kind: "no" },
      { kind: "yes" },
      { kind: "no" },
      { kind: "text", value: "On the side" },
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      className="rj-compare__mark rj-compare__mark--yes"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="9" fill="currentColor" stroke="none" />
      <path
        d="M6.2 10.2 8.8 12.8 13.8 7.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="rj-compare__mark rj-compare__mark--no"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 7 13 13M13 7 7 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CellView({ cell }: { cell: CompareCell }) {
  if (cell.kind === "yes") {
    return (
      <span className="rj-compare__cell-inner">
        <CheckIcon />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (cell.kind === "no") {
    return (
      <span className="rj-compare__cell-inner">
        <CrossIcon />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span className="rj-compare__cell-text">{cell.value}</span>;
}

/**
 * Why UXLAB vs typical alternatives — light comparison table above partners.
 */
export function CompareSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    if (!root || !headline) return;

    const cleanup = createAwardsCharReveal(headline, {
      start: "top 85%",
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelector(".rj-compare__scroll"),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.querySelector(".rj-compare__scroll"),
            start: "top 90%",
            once: true,
          },
        },
      );
    }, root);

    return () => {
      cleanup();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="compare"
      className="rj-compare theme-light"
      aria-label="Why UXLAB"
    >
      <div className="rj-compare__headline-wrap">
        <h2
          ref={headlineRef}
          className="rj-compare__headline rj-awards-title"
          aria-label="Complete solution for your revenue grow."
        >
          <span className="rj-hero__line">Complete solution</span>
          <span className="rj-hero__line">for your revenue grow.</span>
        </h2>
      </div>

      <div className="rj-compare__scroll">
        <table className="rj-compare__table">
          <thead>
            <tr>
              <th scope="col" className="rj-compare__corner">
                <span className="sr-only">Capability</span>
              </th>
              <th scope="col" className="rj-compare__col-head rj-compare__col-head--us">
                <span className="rj-compare__brand" aria-label="UXLAB">
                  <span
                    className="rj-logo__mark rj-compare__brand-mark"
                    role="img"
                    aria-hidden="true"
                  />
                </span>
              </th>
              {COMPETITOR_COLUMNS.map((column) => (
                <th key={column} scope="col" className="rj-compare__col-head">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="rj-compare__row-head">
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.label}-${index === 0 ? "uxlab" : COMPETITOR_COLUMNS[index - 1]}`}
                    className={
                      index === 0
                        ? "rj-compare__cell rj-compare__cell--us"
                        : "rj-compare__cell"
                    }
                  >
                    <CellView cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
