import { useEffect, useRef, type MouseEvent } from "react";
import { useHeroHeadlineLines } from "@/hooks/useHeroHeadlineLines";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat } from "@/lib/askChat";
import { SOLUTIONS, solutionChatContext } from "@/lib/solutions";
import { createAwardsCharReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const CHALLENGES_HEADLINE_DESKTOP = [
  "How we invent",
  "your growth",
] as const;

const CHALLENGES_HEADLINE_MOBILE = [
  "How we",
  "invent your",
  "growth",
] as const;

function CropMarks() {
  return (
    <svg
      className="rj-challenges__crop"
      viewBox="0 0 708 386"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 8V8.74206e-08H8M698 0L706 3.4969e-07V8M8 384H0V376M706 376V384H698M132 92L572 292M132 292L572 92"
        stroke="currentColor"
      />
    </svg>
  );
}

/**
 * Challenges We Solve — Awards-style headline reveal, stacked rows,
 * crop-mark media with hover video fade.
 */
export function ChallengesSection() {
  const headlineLines = useHeroHeadlineLines(
    CHALLENGES_HEADLINE_DESKTOP,
    CHALLENGES_HEADLINE_MOBILE,
  );
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    if (!root || !headline) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );

      const rows = root.querySelectorAll(".rj-challenges__row");
      rows.forEach((row) => {
        const media = row.querySelector(".rj-challenges__media-video");
        const video = row.querySelector("video");
        const content = row.querySelector(".rj-challenges__content");

        gsap.fromTo(
          content,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              once: true,
            },
          },
        );

        if (media && video instanceof HTMLVideoElement) {
          gsap.set(media, { opacity: 0 });

          const ensureSrc = () => {
            if (video.dataset.srcAttached === "1") return;
            const dataSrc = video.getAttribute("data-src");
            if (!dataSrc) return;
            video.src = dataSrc;
            video.dataset.srcAttached = "1";
            video.load();
          };

          const play = () => {
            ensureSrc();
            void video.play().catch(() => undefined);
            gsap.to(media, { opacity: 1, duration: 0.45, ease: "power2.out" });
          };
          const pause = () => {
            gsap.to(media, {
              opacity: 0,
              duration: 0.35,
              ease: "power2.inOut",
              onComplete: () => video.pause(),
            });
          };

          row.addEventListener("mouseenter", play);
          row.addEventListener("mouseleave", pause);
          row.addEventListener("focusin", play);
          row.addEventListener("focusout", pause);
          cleanups.push(() => {
            row.removeEventListener("mouseenter", play);
            row.removeEventListener("mouseleave", pause);
            row.removeEventListener("focusin", play);
            row.removeEventListener("focusout", pause);
          });

          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: play,
            onEnterBack: play,
            onLeave: pause,
            onLeaveBack: pause,
          });
        }
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [headlineLines]);

  return (
    <section
      ref={rootRef}
      className="rj-challenges"
      aria-label="How we invent your growth"
    >
      <div className="rj-challenges__headline-wrap">
        <h2
          ref={headlineRef}
          className="rj-challenges__headline rj-awards-title"
          aria-label="How we invent your growth"
        >
          {headlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="rj-hero__line">
              {line}
              {index < headlineLines.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
      </div>

      <div className="rj-challenges__list">
        {SOLUTIONS.map((item) => (
          <article key={item.title} className="rj-challenges__row" tabIndex={0}>
            <div className="rj-challenges__content">
              <div className="rj-challenges__meta">
                <h3 className="rj-challenges__title">{item.title}</h3>
                <p className="rj-challenges__body">{item.body}</p>
              </div>
              <ArrowLink
                href="#contact"
                className="rj-link-active rj-challenges__cta"
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openContactChat({
                    service: solutionChatContext(item),
                  });
                }}
              >
                Learn more
              </ArrowLink>
            </div>
            <div className="rj-challenges__media">
              <CropMarks />
              <div className="rj-challenges__media-video">
                <video
                  data-src={item.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
