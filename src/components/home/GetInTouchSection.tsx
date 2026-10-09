import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat } from "@/lib/askChat";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE_MOBILE_MQ = "(max-width: 767px)";

const GET_IN_TOUCH_HEADLINE = {
  ariaLabel:
    "Schedule a 30-minute strategy call with the UXLAB team.",
  lines: [
    "Schedule a 30-minute",
    "strategy call with the UXLAB team.",
  ],
  linesMobile: [
    "Schedule a 30-minute",
    "strategy call with",
    "the UXLAB team.",
  ],
} as const;

function useHeadlineLines(): readonly string[] {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(HEADLINE_MOBILE_MQ).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(HEADLINE_MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile
    ? GET_IN_TOUCH_HEADLINE.linesMobile
    : GET_IN_TOUCH_HEADLINE.lines;
}

/**
 * End-of-page CTA — strategy-call headline + Let’s talk, wired to ask chat.
 */
export function GetInTouchSection() {
  const headlineLines = useHeadlineLines();
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    const actions = actionsRef.current;
    if (!root || !headline || !actions) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );

      const cta = actions.querySelector<HTMLElement>("a.rj-hero__cta");
      const showCta = () => {
        actions.classList.add("rj-get-in-touch__actions--visible");
      };

      if (cta) {
        if (!reducedMq.matches) {
          gsap.set(cta, { autoAlpha: 0, y: 16, scale: 0.94 });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: root,
                start: "top 82%",
                once: true,
                invalidateOnRefresh: true,
              },
            })
            .to(
              cta,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                ease: "expo.out",
                delay: 0.6,
                onComplete: () => {
                  showCta();
                  gsap.set(cta, { clearProps: "opacity,visibility,transform" });
                },
              },
              0,
            );
        } else {
          gsap.set(cta, { clearProps: "opacity,visibility,transform" });
          showCta();
        }
      } else {
        showCta();
      }
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [headlineLines]);

  const onTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactChat({ source: "homepage_get_in_touch" });
  };

  return (
    <section
      ref={rootRef}
      id="get-in-touch"
      className="rj-get-in-touch theme-light"
      aria-label="Get in touch"
    >
      <div className="rj-get-in-touch__headline-wrap rj-hero__title-block">
        <h2
          ref={headlineRef}
          className="rj-get-in-touch__headline rj-hero__headline rj-awards-title"
          aria-label={GET_IN_TOUCH_HEADLINE.ariaLabel}
        >
          {headlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="rj-hero__line">
              {line}
              {index < headlineLines.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
      </div>

      <div ref={actionsRef} className="rj-get-in-touch__actions">
        <ArrowLink
          href="#contact"
          className="rj-link-active rj-hero__cta rj-hero__cta--talk"
          onClick={onTalkClick}
        >
          Let&apos;s talk
        </ArrowLink>
      </div>
    </section>
  );
}
