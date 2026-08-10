import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    title: (
      <>
        A simple philosophy: <br />
        quality over quantity.
      </>
    ),
    body: "We partner with five clients a year to deliver unmatched focus, and impact. Every detail is carefully crafted, every decision strategic, and every outcome transformative.",
  },
  {
    title: (
      <>
        Performance & emotion.
        <br />
        You need both.
      </>
    ),
    body: "We craft brands that become category leaders. These brands aren’t built on products alone. Emotional connection and sustainable growth are the two essentials to get there. This is how you drive retention and advocacy.",
  },
] as const;

/**
 * Rejouice “Our approach” — intro-style lead + key-value block.
 */
export function ApproachSection() {
  const rootRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

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
              Our approach is built for compounding growth—diagnose the real
              friction, design the highest-leverage fix, validate with signal,
              and ship what moves revenue. See{" "}
              <a href="#process" className="rj-link-active-full">
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
