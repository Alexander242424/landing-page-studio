import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { openContactChat } from "@/lib/askChat";

gsap.registerPlugin(ScrollTrigger);

const CTA_PREFIX = "Find revenue leaks.";
const CTA_LINK = "Let's talk";

/**
 * End-of-page CTA — Rejouice contact band: full-viewport white field,
 * display-size underlined heading, scroll-in reveal.
 */
export function GetInTouchSection() {
  const rootRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cta = ctaRef.current;
    if (!root || !cta) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const ctx = gsap.context(() => {
      if (!reducedMq.matches) {
        gsap.fromTo(
          cta,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              once: true,
            },
          },
        );
      }
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="get-in-touch"
      className="rj-get-in-touch theme-light"
      aria-label="Contact"
    >
      <h2 className="rj-get-in-touch__heading">
        <button
          ref={ctaRef}
          type="button"
          className="rj-get-in-touch__cta"
          aria-label={`${CTA_PREFIX} ${CTA_LINK} — open contact chat`}
          onClick={() => openContactChat()}
        >
          <span className="rj-get-in-touch__label">
            {CTA_PREFIX}{" "}
            <span className="rj-get-in-touch__link">{CTA_LINK}</span>
          </span>
          <span className="rj-get-in-touch__bar" aria-hidden="true" />
        </button>
      </h2>
    </section>
  );
}
