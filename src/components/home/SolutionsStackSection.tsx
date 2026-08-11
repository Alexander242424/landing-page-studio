import { useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { LazyVideo } from "@/components/media/LazyVideo";
import { openContactChat } from "@/lib/askChat";
import { SOLUTIONS } from "@/lib/solutions";
import { createAwardsCharReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const CARD_TONES = [
  "tone-paper",
  "tone-lime",
  "tone-ink",
  "tone-stone",
  "tone-teal",
] as const;

/** Deterministic fling spins — Math.random() re-rolls on every refresh and feels like a jump. */
const FLING_ROTATIONS = [-14, 11, -8, 16] as const;

const DESKTOP_MQ = "(min-width: 768px)";
const MOTION_MQ = "(prefers-reduced-motion: reduce)";

/**
 * Hilden & Kaira–style stacked solutions cards.
 *
 * Desktop: headline stays in normal flow and scrolls away; the pin frame is a
 * full viewport that sticks at the top while cards fling on scrub. Same pin
 * target on every width ≥768 — pinning the short list at "center center" was
 * fighting Lenis and jerking on engage/release.
 *
 * Mobile / reduced-motion: static vertical stack.
 */
export function SolutionsStackSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const pinHeightRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    const pinHeight = pinHeightRef.current;
    const pin = pinRef.current;
    if (!root || !headline || !pinHeight || !pin) return;

    const cleanups: Array<() => void> = [];
    cleanups.push(
      createAwardsCharReveal(headline, {
        start: "top 85%",
      }),
    );

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const motionMq = window.matchMedia(MOTION_MQ);
    let stackCtx: gsap.Context | null = null;

    const teardownStack = () => {
      stackCtx?.revert();
      stackCtx = null;
    };

    const setupStack = () => {
      teardownStack();

      const cards = Array.from(
        root.querySelectorAll<HTMLElement>(".rj-solutions-stack__card"),
      );
      if (cards.length === 0) return;

      const enablePin =
        desktopMq.matches && !motionMq.matches && cards.length > 1;

      if (!enablePin) {
        gsap.set(cards, { clearProps: "transform,y,z,rotation,scale,zIndex" });
        return;
      }

      stackCtx = gsap.context(() => {
        const gap = 72;
        const count = cards.length;
        const flingCount = count - 1;
        // Settle after pin engages so card 01 doesn't fling on the same
        // frame as position:fixed — that read as a jump; later cards were fine.
        const introHold = 0.75;
        const outroHold = 0.4;

        cards.forEach((card, index) => {
          gsap.set(card, {
            y: gap * index,
            z: -gap * index,
            yPercent: 0,
            scale: 1,
            rotation: 0,
            zIndex: count - index,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });

        // One ScrollTrigger owns pin + scrub so they can't drift apart.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: "top top",
            end: "bottom bottom",
            pin,
            pinSpacing: false,
            anticipatePin: 0,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        tl.to({}, { duration: introHold });

        for (let i = 0; i < flingCount; i += 1) {
          const card = cards[i];
          const rotation = FLING_ROTATIONS[i % FLING_ROTATIONS.length] ?? 12;
          const at = introHold + i;

          // Absolute stack targets — relative -= jumps if ST refreshes mid-scrub.
          for (let j = i + 1; j < count; j += 1) {
            const stackIndex = j - i - 1;
            tl.to(
              cards[j],
              {
                y: gap * stackIndex,
                z: -gap * stackIndex,
                ease: "none",
                duration: 1,
              },
              at,
            );
          }

          // Single y channel (no yPercent mix) — y + yPercent on card 0
          // from rest caused a one-frame pop at fling start.
          tl.to(
            card,
            {
              y: () => -window.innerHeight * 1.2,
              scale: 1.18,
              rotation,
              ease: "none",
              duration: 1,
            },
            at,
          );
        }

        tl.to({}, { duration: outroHold });
      }, root);
    };

    setupStack();

    const onChange = () => {
      setupStack();
      ScrollTrigger.refresh();
    };

    desktopMq.addEventListener("change", onChange);
    motionMq.addEventListener("change", onChange);
    cleanups.push(() => {
      desktopMq.removeEventListener("change", onChange);
      motionMq.removeEventListener("change", onChange);
      teardownStack();
    });

    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    cleanups.push(() =>
      window.removeEventListener("orientationchange", onOrientation),
    );

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(() => requestAnimationFrame(refresh));
    if (document.fonts?.ready) {
      void document.fonts.ready.then(refresh);
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="solutions"
      className="rj-solutions-stack"
      aria-label="How we invent your growth"
    >
      <div className="rj-solutions-stack__heading">
        <h2
          ref={headlineRef}
          className="rj-solutions-stack__headline rj-awards-title"
        >
          How we invent
          <br />
          your growth
        </h2>
      </div>

      <div ref={pinHeightRef} className="rj-solutions-stack__pin-height">
        <div ref={pinRef} className="rj-solutions-stack__pin">
          <div className="rj-solutions-stack__list" role="list">
            {SOLUTIONS.map((item, index) => {
              const tone = CARD_TONES[index % CARD_TONES.length];
              const num = String(index + 1).padStart(2, "0");

              return (
                <article
                  key={item.title}
                  role="listitem"
                  className={cn(
                    "rj-solutions-stack__card",
                    `rj-solutions-stack__card--${tone}`,
                  )}
                >
                  <div className="rj-solutions-stack__card-inner">
                    <div className="rj-solutions-stack__card-top">
                      <div className="rj-solutions-stack__card-copy">
                        <h3 className="rj-solutions-stack__card-title">
                          {item.title}
                        </h3>
                      </div>
                      <div
                        className="rj-solutions-stack__card-number"
                        aria-hidden="true"
                      >
                        <span>{num[0]}</span>
                        <span>{num[1]}</span>
                      </div>
                    </div>

                    <div className="rj-solutions-stack__card-bottom">
                      <div className="rj-solutions-stack__card-body">
                        <p>{item.body}</p>
                        <ArrowLink
                          href="#contact"
                          className="rj-solutions-stack__cta"
                          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                            event.preventDefault();
                            event.stopPropagation();
                            openContactChat();
                          }}
                        >
                          Let&apos;s talk
                        </ArrowLink>
                      </div>
                      <div className="rj-solutions-stack__card-media">
                        <LazyVideo
                          src={item.video}
                          className="rj-solutions-stack__video"
                          loop
                          muted
                          playsInline
                          rootMargin="600px 0px"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
