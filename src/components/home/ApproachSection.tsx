import { useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    title: (
      <>
        Depth over volume.
        <br />
        Small roster, full focus.
      </>
    ),
    body: "We take a small number of clients because shallow engagements don't compound. You get the team's full attention — not account management and handoffs.",
  },
  {
    title: (
      <>
        Beautiful doesn’t
        <br />
        convert by itself.
      </>
    ),
    body: "We connect UX to the metrics that matter. Every design decision is tied to a growth lever — conversion, activation, retention, or LTV — not just a cleaner interface.",
  },
] as const;

/**
 * Rejouice “Our approach” — intro-style lead + key-value block.
 */
export function ApproachSection() {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const scrollToHref = (href: string) => {
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onProcessClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToHref("#process");
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
  }, []);

  return (
    <section
      ref={rootRef}
      className="rj-approach"
      id="approach"
      aria-label="Our approach"
    >
      <div className="rj-approach__lead">
        <div className="rj-approach__lead-inner">
          <div className="rj-approach__lead-space" aria-hidden="true" />
          <div className="rj-approach__lead-content">
            <p ref={leadRef}>
              We work on the moments where growth stalls — UX, conversion,
              onboarding, retention — and leave a system that compounds. See{" "}
              <a
                href="#process"
                className="rj-link-active-full"
                onClick={onProcessClick}
              >
                our process
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="rj-approach__key-value">
        <ul className="rj-approach__list">
          {ITEMS.map((item, i) => (
            <li
              key={i}
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
