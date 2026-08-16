import { useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import type { ServiceOutcome } from "@/lib/servicePages";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * “What you get” — same key-value / split pattern as home ApproachSection
 * (not a generic numbered card grid).
 */
export function ServiceOutcomesSection({
  id = "outcomes",
  leadBefore,
  leadLinkLabel,
  leadLinkHref = "#process",
  leadAfter = ".",
  items,
}: {
  id?: string;
  leadBefore: string;
  leadLinkLabel: string;
  leadLinkHref?: string;
  leadAfter?: string;
  items: ServiceOutcome[];
}) {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const scrollToHref = (href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onLeadLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!leadLinkHref.startsWith("#")) return;
    event.preventDefault();
    scrollToHref(leadLinkHref);
  };

  useEffect(() => {
    const root = rootRef.current;
    const lead = leadRef.current;
    if (!root || !lead) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createTextReveal(lead, {
          trigger: lead.closest(".rj-approach__lead-content") ?? lead,
          animateLinkScale: true,
          start: "top 92%",
        }),
      );

      itemRefs.current.forEach((item) => {
        if (!item) return;
        const split = item.querySelector<HTMLElement>(".rj-split");
        const title = item.querySelector<HTMLElement>(".rj-approach__title-text");
        const body = item.querySelector<HTMLElement>(".rj-approach__body-text");

        if (split) {
          ScrollTrigger.create({
            trigger: split,
            start: "top 90%",
            once: true,
            onEnter: () => split.classList.add("is-shown"),
          });
        }
        if (title) {
          cleanups.push(createTextReveal(title, { start: "top 92%" }));
        }
        if (body) {
          cleanups.push(createTextReveal(body, { start: "top 92%" }));
        }
      });
    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [items]);

  return (
    <section
      ref={rootRef}
      className="rj-approach"
      id={id}
      aria-label="What you get"
    >
      <div className="rj-approach__lead">
        <div className="rj-approach__lead-inner">
          <div className="rj-approach__lead-space" aria-hidden="true" />
          <div className="rj-approach__lead-content">
            <p ref={leadRef}>
              {leadBefore}{" "}
              <a
                href={leadLinkHref}
                className="rj-link-active-full"
                onClick={onLeadLinkClick}
              >
                {leadLinkLabel}
              </a>
              {leadAfter}
            </p>
          </div>
        </div>
      </div>

      <div className="rj-approach__key-value">
        <ul className="rj-approach__list">
          {items.map((item, i) => (
            <li
              key={item.title}
              className="rj-approach__item"
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              <div className="rj-split" />
              <div className="rj-approach__title">
                <h3 className="rj-approach__title-text rj-text-reveal">
                  {item.title}
                </h3>
              </div>
              <div className="rj-approach__body">
                <div className="rj-approach__body-inner">
                  <p className="rj-approach__body-text rj-text-reveal">
                    {item.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
