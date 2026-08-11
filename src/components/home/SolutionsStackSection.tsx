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

const DESKTOP_MQ = "(min-width: 768px)";
const MOTION_MQ = "(prefers-reduced-motion: reduce)";

/**
 * Hilden & Kaira–style stacked solutions cards:
 * tall pin-height scrub runway, one shared scrub timeline so cards fling
 * 01→05 in order while pinned. Headline lives inside the pin so it stays
 * with the stack for the full runway, then both scroll away. Last card
 * stays. Mobile / reduced-motion: static vertical stack.
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

        // pin-height owns the scrub runway — pinSpacing would double it.
        ScrollTrigger.create({
          trigger: pinHeight,
          start: "top top",
          end: "bottom bottom",
          pin,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        // Front card (#01) sits on top; deeper cards step back in y/z.
        cards.forEach((card, index) => {
          gsap.set(card, {
            y: gap * index,
            z: -gap * index,
            zIndex: count - index,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });

        // One scrub timeline: each step flings the current front card and
        // steps the rest of the stack forward. Per-card `top+=`/`bottom+=`
        // offsets previously ran later cards *earlier*, so 02–04 flung under
        // 01 and the section looked stuck on 01 then jumped to 05.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 0; i < flingCount; i += 1) {
          const card = cards[i];
          const rotation = (Math.random() - 0.5) * 42;
          const at = i;

          for (let j = i + 1; j < count; j += 1) {
            tl.to(
              cards[j],
              {
                y: `-=${gap}`,
                z: `+=${gap}`,
                ease: "power2.inOut",
                duration: 1,
              },
              at,
            );
          }

          tl.to(
            card,
            {
              yPercent: -100,
              y: "-105vh",
              scale: 1.18,
              rotation,
              ease: "power4.in",
              duration: 1,
            },
            at,
          );
        }

        // Brief hold on the keeper (#05) before pin release / headline exit.
        tl.to({}, { duration: 0.35 });
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

    // Refresh after layout + fonts so pin-height measurements stick.
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
      <div ref={pinHeightRef} className="rj-solutions-stack__pin-height">
        <div ref={pinRef} className="rj-solutions-stack__pin">
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
