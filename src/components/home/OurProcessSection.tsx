import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ITEMS = [
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

export type ProcessItem = {
  title: string;
  body: string;
};

/**
 * Metalab-style hoverable columns — equal widths collapse/expand on hover,
 * description clipped until the active column doubles in width.
 */
export function OurProcessSection({
  items = DEFAULT_ITEMS,
  headline = "Our process",
}: {
  items?: readonly ProcessItem[];
  headline?: ReactNode;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState<number | null>(null);
  const [fixedColumnWidth, setFixedColumnWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const processItems = items;
  const count = processItems.length;
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
    const columns = columnsRef.current;
    if (!root || !columns) return;

    const cleanups: Array<() => void> = [];

    if (headline) {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );
    }

    const items = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (items.length === 0) return;

    const lines = items
      .map((item) => item.querySelector<HTMLElement>(".rj-process__line"))
      .filter(Boolean) as HTMLElement[];
    const numbers = items
      .map((item) => item.querySelector<HTMLElement>(".rj-process__number"))
      .filter(Boolean) as HTMLElement[];
    const titles = items
      .map((item) =>
        item.querySelector<HTMLElement>(".rj-process__item-title-text"),
      )
      .filter(Boolean) as HTMLElement[];

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(lines, { scaleX: 1, scaleY: 1 });
        gsap.set(numbers, { autoAlpha: 1 });
        gsap.set(titles, { y: 0 });
        return;
      }

      gsap.set(lines, { scaleX: 0, scaleY: 0 });
      gsap.set(numbers, { autoAlpha: 0, y: 12 });
      gsap.set(titles, { y: "110%" });
      gsap.set(items, { autoAlpha: 0.001 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: columns,
          start: "top 78%",
          once: true,
        },
      });

      // Soft column fade, then staggered Metalab line / number / title reveal.
      tl.to(
        items,
        {
          autoAlpha: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
        },
        0,
      );

      tl.to(
        lines,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 1.15,
          stagger: 0.09,
        },
        0.08,
      );

      tl.to(
        numbers,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.09,
        },
        0.16,
      );

      tl.to(
        titles,
        {
          y: "0%",
          duration: 1.05,
          stagger: 0.09,
        },
        0.2,
      );
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
          {headline}
        </h2>
      </div>

      <div
        ref={columnsRef}
        className="rj-process__columns"
        onMouseLeave={() => setActive(null)}
      >
        {processItems.map((item, index) => {
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
