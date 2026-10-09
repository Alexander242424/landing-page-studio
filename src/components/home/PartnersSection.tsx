import { useEffect, useRef } from "react";
import { useHeroHeadlineLines } from "@/hooks/useHeroHeadlineLines";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { partnerRailLogos } from "@/lib/clientLogos";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const PARTNERS_HEADLINE_DESKTOP = ["Our official partners."] as const;

const PARTNERS_HEADLINE_MOBILE = ["Our official", "partners."] as const;

/**
 * Light partners rail above FAQ — hairline + nodes, no pill / chrome.
 */
export function PartnersSection() {
  const headlineLines = useHeroHeadlineLines(
    PARTNERS_HEADLINE_DESKTOP,
    PARTNERS_HEADLINE_MOBILE,
  );
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const logos = partnerRailLogos();

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    const rail = railRef.current;
    if (!root || !headline || !rail) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );

      gsap.fromTo(
        rail.querySelectorAll(".rj-partners__item"),
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rail,
            start: "top 90%",
            once: true,
          },
        },
      );
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [headlineLines]);

  return (
    <section
      ref={rootRef}
      id="partners"
      className="rj-partners theme-light"
      aria-label="Official partners"
    >
      <div className="rj-partners__headline-wrap">
        <h2
          ref={headlineRef}
          className="rj-partners__headline rj-awards-title"
          aria-label="Our official partners."
        >
          {headlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="rj-hero__line">
              {line}
              {index < headlineLines.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
      </div>

      <div ref={railRef} className="rj-partners__rail">
        <div className="rj-partners__line" aria-hidden="true" />
        <ul className="rj-partners__list">
          {logos.map((logo) => (
            <li key={logo.id} className="rj-partners__item">
              <span className="rj-partners__node" aria-hidden="true" />
              <img
                className="rj-partners__logo"
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
