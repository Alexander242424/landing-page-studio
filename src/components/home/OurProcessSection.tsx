import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    title: "Discover",
    body: "We map the product, funnel, and revenue constraints before we touch UI—so every design decision is aimed at a real growth lever.",
  },
  {
    title: "Diagnose",
    body: "Behavior data, session review, and competitive context surface the highest-friction moments. We prioritize what moves conversion, retention, or monetization first.",
  },
  {
    title: "Prototype",
    body: "We design focused interventions—flows, paywalls, and system patterns—built to be tested, not presented as theater.",
  },
  {
    title: "Validate",
    body: "Hypotheses get pressure-tested with experiments and qualitative signal. We keep what compounds and cut what doesn’t.",
  },
  {
    title: "Ship",
    body: "We partner with your team like co-founders in the work: tight loops, clear ownership, and production-ready craft without agency overhead.",
  },
  {
    title: "Compound",
    body: "Wins become a system—patterns, principles, and a backlog that keeps growth compounding after the engagement ends.",
  },
] as const;

/**
 * Metalab-style hoverable columns — equal widths collapse/expand on hover,
 * description clipped until the active column doubles in width.
 */
export function OurProcessSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState<number | null>(null);
  const [fixedColumnWidth, setFixedColumnWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const count = ITEMS.length;
  const columnWidth = `${100 / count}%`;
  const columnExpandedWidth = `${(100 / count) * 2}%`;
  const columnContractedWidth = `${(100 - (100 / count) * 2) / (count - 1)}%`;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const measure = () => {
      // Only sample equal-width state (Metalab uses first column offsetWidth).
      if (active !== null) return;
      const first = itemRefs.current[0];
      if (first) setFixedColumnWidth(first.offsetWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (columnsRef.current) ro.observe(columnsRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active, count]);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    if (headline) {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );
    }

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item) => {
        if (!item) return;
        const line = item.querySelector<HTMLElement>(".rj-process__line");
        const number = item.querySelector<HTMLElement>(".rj-process__number");
        const titleText = item.querySelector<HTMLElement>(
          ".rj-process__item-title-text",
        );

        if (line) gsap.set(line, { scaleX: 0, scaleY: 0 });
        if (number) gsap.set(number, { autoAlpha: 0 });
        if (titleText) gsap.set(titleText, { y: "105%" });
        // Descriptions: always visible below 1200px (CSS); desktop via .is-active hover.

        ScrollTrigger.create({
          trigger: item,
          start: "top bottom",
          once: true,
          onEnter: () => {
            const duration = reducedMotion ? 0.001 : 1.8;
            const ease = "power3.out";
            if (line) gsap.to(line, { scaleX: 1, scaleY: 1, duration, ease });
            if (titleText) gsap.to(titleText, { y: 0, duration, ease });
            if (number) gsap.to(number, { autoAlpha: 1, duration, ease });
          },
        });
      });
    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="process"
      className="rj-process"
      aria-label="Our process"
      style={
        {
          "--column-width": columnWidth,
          "--column-expanded-width": columnExpandedWidth,
          "--column-contracted-width": columnContractedWidth,
          "--fixed-column-width": `${fixedColumnWidth}px`,
          "--transition-duration": reducedMotion ? "0s" : "0.6s",
        } as CSSProperties
      }
    >
      <div className="rj-process__title-row">
        <h2
          ref={headlineRef}
          className="rj-process__title rj-awards-title"
        >
          Our process
        </h2>
      </div>

      <div
        ref={columnsRef}
        className="rj-process__columns"
        onMouseLeave={() => setActive(null)}
      >
        {ITEMS.map((item, index) => {
          const isActive = active === index;
          const isNotActive = active !== null && active !== index;

          return (
            <article
              key={item.title}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={cn(
                "rj-process__item",
                isActive && "is-active",
                isNotActive && "is-not-active",
              )}
              onMouseEnter={() => setActive(index)}
            >
              <span className="rj-process__line" aria-hidden="true" />
              <span className="rj-process__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="rj-process__item-body">
                <p className="rj-process__item-title">
                  <span className="rj-process__item-title-text">
                    {item.title}
                  </span>
                </p>
                <div className="rj-process__description">
                  <p className="rj-process__description-text">{item.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
