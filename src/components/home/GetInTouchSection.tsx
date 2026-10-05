import { useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat, openCroAuditChat } from "@/lib/askChat";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "Let's find your revenue leaks.";

/**
 * End-of-page CTA — Rejouice contact band: full-viewport white field,
 * display-size heading, hero-style action pills, scroll-in reveal.
 */
export function GetInTouchSection() {
  const rootRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const actions = actionsRef.current;
    if (!root || !actions) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const ctx = gsap.context(() => {
      if (!reducedMq.matches) {
        gsap.fromTo(
          actions,
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

  const handleTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactChat();
  };

  const handleAuditClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openCroAuditChat();
  };

  return (
    <section
      ref={rootRef}
      id="get-in-touch"
      className="rj-get-in-touch theme-light"
      aria-label="Contact"
    >
      <h2 className="rj-get-in-touch__heading">{HEADING}</h2>
      <div
        ref={actionsRef}
        className="rj-get-in-touch__actions"
        aria-label="Contact actions"
      >
        <ArrowLink
          href="#contact"
          className="rj-link-active rj-hero__cta rj-hero__cta--talk"
          onClick={handleTalkClick}
        >
          Let&apos;s talk
        </ArrowLink>
        <ArrowLink
          href="#contact"
          className="rj-link-active rj-hero__cta rj-hero__cta--process"
          onClick={handleAuditClick}
        >
          Free CRO audit
        </ArrowLink>
      </div>
    </section>
  );
}
