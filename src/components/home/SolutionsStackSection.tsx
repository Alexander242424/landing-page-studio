import { useEffect, useMemo, useRef, type MouseEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { LazyVideo } from "@/components/media/LazyVideo";
import { openContactChat } from "@/lib/askChat";
import { SOLUTIONS, solutionChatContext, type Solution } from "@/lib/solutions";
import {
  solutionHasLanding,
  solutionPath,
} from "@/lib/servicePages";
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
 * Mobile / reduced-motion: static vertical stack; cards fade/slide up in
 * staggered beats (title → copy/CTA → media) on scroll, like Challenges.
 */
export function SolutionsStackSection({
  solutions = SOLUTIONS,
  excludeSlug,
  sectionId = "solutions",
  headline = (
    <>
      How we invent
      <br />
      your growth
    </>
  ),
  ariaLabel = "How we invent your growth",
}: {
  solutions?: readonly Solution[];
  /** Hide the active service when embedding on a service landing. */
  excludeSlug?: string;
  sectionId?: string;
  headline?: ReactNode;
  ariaLabel?: string;
} = {}) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const pinHeightRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () => solutions.filter((item) => item.slug !== excludeSlug),
    [solutions, excludeSlug],
  );

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
        gsap.set(cards, {
          clearProps: "transform,y,z,rotation,scale,zIndex,opacity",
        });
        pinHeight.style.removeProperty("height");

        // Mobile / reduced-motion: staggered fade-up per card (like Challenges).
        if (!motionMq.matches) {
          stackCtx = gsap.context(() => {
            cards.forEach((card) => {
              const top = card.querySelector<HTMLElement>(
                ".rj-solutions-stack__card-top",
              );
              const body = card.querySelector<HTMLElement>(
                ".rj-solutions-stack__card-body",
              );
              const media = card.querySelector<HTMLElement>(
                ".rj-solutions-stack__card-media",
              );
              const parts = [top, body, media].filter(
                (el): el is HTMLElement => Boolean(el),
              );
              if (parts.length === 0) return;

              gsap.set(parts, { opacity: 0, y: 28 });

              ScrollTrigger.create({
                trigger: card,
                start: "top 90%",
                once: true,
                onEnter: () => {
                  gsap.to(parts, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: "power3.out",
                    overwrite: "auto",
                  });
                },
              });
            });
          }, root);
        }
        return;
      }

      stackCtx = gsap.context(() => {
        // Tight deck peek — large gaps + glass made 6 cards look like a trail bug.
        const gap = 28;
        const count = cards.length;
        const flingCount = count - 1;
        // Settle after pin engages so card 01 doesn't fling on the same
        // frame as position:fixed — that read as a jump; later cards were fine.
        const introHold = 0.75;
        const outroHold = 0.4;
        const timelineUnits = introHold + flingCount + outroHold;

        // Keep scrub distance proportional to fling count (was tuned for 5 cards).
        pinHeight.style.height = `${Math.round(100 * timelineUnits * 1.05)}vh`;

        cards.forEach((card, index) => {
          gsap.set(card, {
            y: gap * index,
            z: -gap * index,
            yPercent: 0,
            scale: 1,
            rotation: 0,
            // Deeper cards fade so the glass stack doesn't read as a glitch trail.
            opacity: index === 0 ? 1 : Math.max(0.4, 1 - index * 0.1),
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
                opacity:
                  stackIndex === 0
                    ? 1
                    : Math.max(0.4, 1 - stackIndex * 0.1),
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
              opacity: 0,
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
  }, [items]);

  return (
    <section
      ref={rootRef}
      id={sectionId}
      className="rj-solutions-stack"
      aria-label={ariaLabel}
    >
      <div className="rj-solutions-stack__heading">
        <h2
          ref={headlineRef}
          className="rj-solutions-stack__headline rj-awards-title"
        >
          {headline}
        </h2>
      </div>

      <div ref={pinHeightRef} className="rj-solutions-stack__pin-height">
        <div ref={pinRef} className="rj-solutions-stack__pin">
          <div className="rj-solutions-stack__list" role="list">
            {items.map((item, index) => {
              const tone = CARD_TONES[index % CARD_TONES.length];
              const num = String(index + 1).padStart(2, "0");

              return (
                <article
                  key={item.title}
                  id={`solution-${item.slug}`}
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
                          href={
                            solutionHasLanding(item.slug)
                              ? solutionPath(item)
                              : "#contact"
                          }
                          className="rj-solutions-stack__cta"
                          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (solutionHasLanding(item.slug)) {
                              void navigate({
                                to: "/solutions/$slug",
                                params: { slug: item.slug },
                                viewTransition: true,
                              });
                              return;
                            }
                            openContactChat({
                              service: solutionChatContext(item),
                            });
                          }}
                        >
                          {solutionHasLanding(item.slug)
                            ? "Explore"
                            : "Let's talk"}
                        </ArrowLink>
                      </div>
                      <div className="rj-solutions-stack__card-media">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="rj-solutions-stack__image"
                            width={1600}
                            height={1000}
                            decoding="async"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <LazyVideo
                            src={item.video}
                            className="rj-solutions-stack__video"
                            loop
                            muted
                            playsInline
                            rootMargin="600px 0px"
                            preload="metadata"
                          />
                        )}
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
