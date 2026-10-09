import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LazyVideo } from "@/components/media/LazyVideo";
import { ArrowIcon, ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat } from "@/lib/askChat";
import type { ServiceHeroContent } from "@/lib/servicePages";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageReveal } from "@/lib/pageReveal";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/** 1:1 from https://www.rejouice.com/static/reel-short.mp4 */
const HERO_VIDEO = "/video/hero.mp4";
const HERO_POSTER = "/video/hero-poster.jpg";
const HEADLINE_MOBILE_MQ = "(max-width: 767px)";
const MOBILE_MQ = "(max-width: 1023px)";
const DESKTOP_MQ = "(min-width: 1024px)";

/** Overlapping client logos beside the proof caption. */
const PROOF_LOGOS = [
  { id: "oura", src: "/logos/oura.svg", alt: "Oura" },
  {
    id: "nespresso",
    src: "/logos/nespresso.svg",
    alt: "Nespresso",
    fill: true,
  },
  { id: "stan", src: "/logos/stan.svg", alt: "Stan" },
  { id: "forbes", src: "/logos/forbes.svg", alt: "Forbes", fill: true },
] as const;

const DEFAULT_HERO: ServiceHeroContent = {
  ariaLabel: "Conversion rate optimisation systems for revenue growth.",
  lines: ["Conversion rate optimisation", "systems for revenue growth."],
  linesMobile: [
    "Conversion rate",
    "optimisation systems",
    "for revenue growth.",
  ],
  description:
    "Without spending a single cent more on Google Ads, Facebook ads, SEO or content marketing.",
  primaryCta: { label: "Let's talk", href: "#contact" },
  logosStat: "Trusted by YCombinator \n& Speedrun founders",
};

/** Hero + showreel — H1 char flip + description word reveal on load. */
function useHeadlineLines(hero: ServiceHeroContent): readonly string[] {
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

  return isMobile && hero.linesMobile ? hero.linesMobile : hero.lines;
}

export function HeroReel({ content }: { content?: ServiceHeroContent } = {}) {
  const hero = content ?? DEFAULT_HERO;
  const headlineLines = useHeadlineLines(hero);
  const isPhone = useIsMobile();
  const { isRevealed, shouldPlay } = usePageReveal();
  const loadVideoEager = shouldPlay || isPhone;
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactChat();
  };

  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const logo = logoRef.current;
    const copy = copyRef.current;
    const description = descriptionRef.current;
    const actions = actionsRef.current;
    const proof = proofRef.current;
    const icon = iconRef.current;
    const reel = reelRef.current;
    const videoWrap = videoWrapRef.current;
    const frame = frameRef.current;
    if (!isRevealed) return;
    if (!heroEl || !logo || !copy || !reel || !videoWrap || !frame) return;

    const copyUnit = copy;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (reduced) {
        logo.classList.add("rj-hero__copy--visible");
        description?.classList.add("rj-hero__copy--visible");
        actions?.classList.add("rj-hero__copy--visible");
        proof?.classList.add("rj-hero__copy--visible");
        gsap.set([logo, description, actions, proof].filter(Boolean), {
          clearProps: "opacity,visibility,transform",
        });
      } else {
        revealCleanups.push(
          createAwardsCharReveal(logo, {
            playOnLoad: true,
            delay: 0.35,
            onComplete: () => logo.classList.add("rj-hero__copy--visible"),
          }),
        );

        if (description) {
          revealCleanups.push(
            createTextReveal(description, {
              playOnLoad: true,
              delay: 0.85,
              duration: 1.35,
              wordsStagger: 0.012,
            }),
          );
          description.classList.add("rj-hero__copy--visible");
        }

        if (actions) gsap.set(actions, { autoAlpha: 0, y: 14 });
        if (proof) gsap.set(proof, { autoAlpha: 0, y: 12 });

        const follow = gsap.timeline({
          delay: 1.65,
          defaults: { ease: "expo.out" },
        });
        if (actions) {
          follow.to(
            actions,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              onComplete: () => actions.classList.add("rj-hero__copy--visible"),
            },
            0,
          );
        }
        if (proof) {
          follow.to(
            proof,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              onComplete: () => proof.classList.add("rj-hero__copy--visible"),
            },
            actions ? 0.2 : 0,
          );
        }
      }

      if (icon) {
        if (reduced) {
          gsap.set(icon, { clearProps: "opacity,visibility,transform" });
        } else {
          gsap.set(icon, { autoAlpha: 0, y: -14 });
          gsap.to(icon, {
            autoAlpha: 1,
            y: 0,
            delay: 1.1,
            duration: 1.2,
            ease: "expo.out",
          });
          gsap.to(icon, {
            y: 8,
            delay: 2.4,
            duration: 1.15,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1,
          });
        }

        ScrollTrigger.create({
          trigger: heroEl,
          start: "bottom bottom",
          end: "bottom top",
          onEnter: () =>
            gsap.to(icon, { autoAlpha: 0, duration: 0.25, overwrite: "auto" }),
          onLeaveBack: () =>
            gsap.to(icon, { autoAlpha: 1, duration: 0.25, overwrite: "auto" }),
        });
      }

      const mm = gsap.matchMedia();

      mm.add(MOBILE_MQ, () => {
        gsap.set(frame, {
          clearProps: "--rj-reel-clip,--rj-reel-radius",
          clipPath: "inset(0% round 0rem)",
        });
        gsap.set(copyUnit, { clearProps: "transform" });
        gsap.set(videoWrap, { clearProps: "transform" });

        return () => {
          gsap.set([copyUnit, videoWrap], { clearProps: "transform" });
          gsap.set(frame, {
            clearProps: "transform,clipPath,--rj-reel-clip,--rj-reel-radius",
          });
        };
      });

      mm.add(DESKTOP_MQ, () => {
        gsap.set(frame, {
          "--rj-reel-clip": "0%",
          "--rj-reel-radius": "0rem",
          clipPath: "inset(0% round 0rem)",
        });
        gsap.set(videoWrap, { clearProps: "transform" });
        gsap.set(copyUnit, { clearProps: "transform" });

        return () => {
          gsap.set(frame, {
            clearProps: "--rj-reel-clip,--rj-reel-radius,clipPath",
          });
          gsap.set(videoWrap, { clearProps: "transform" });
          gsap.set(copyUnit, { clearProps: "transform" });
        };
      });
    }, rootRef);

    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    if (!shouldPlay) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
      for (const dispose of revealCleanups) dispose();
      ctx.revert();
      gsap.set([logo, description, actions, proof].filter(Boolean), {
        autoAlpha: 1,
        y: 0,
        clearProps: "transform",
      });
      logo.classList.add("rj-hero__copy--visible");
      description?.classList.add("rj-hero__copy--visible");
      actions?.classList.add("rj-hero__copy--visible");
      proof?.classList.add("rj-hero__copy--visible");
    };
  }, [isRevealed, shouldPlay, headlineLines]);

  return (
    <section ref={rootRef} className="rj-hero-reel" id="hero" aria-label="Hero">
      <div ref={heroRef} className="rj-hero">
        <div ref={copyRef} className="rj-hero__motion">
          <div className="rj-hero__copy">
            <div className="rj-hero__title-block">
              <h1
                ref={logoRef}
                className="rj-hero__logo rj-hero__headline rj-awards-title"
                aria-label={hero.ariaLabel}
              >
                {headlineLines.map((line, index) => (
                  <span key={`${index}-${line}`} className="rj-hero__line">
                    {line}
                    {index < headlineLines.length - 1 ? " " : null}
                  </span>
                ))}
              </h1>
            </div>
            <div className="rj-hero__taglines">
              <p
                ref={descriptionRef}
                className="rj-hero__tagline rj-hero__description rj-text-reveal"
              >
                {hero.description}
              </p>
              <div
                ref={actionsRef}
                className="rj-hero__actions"
                aria-label="Hero actions"
              >
                <ArrowLink
                  href={hero.primaryCta.href}
                  className="rj-link-active rj-hero__cta rj-hero__cta--talk"
                  onClick={onTalkClick}
                >
                  {hero.primaryCta.label}
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={proofRef}
          className="rj-hero__proof"
          aria-label="For Tech and DTC brands"
        >
          <p className="rj-hero__proof-label">For Tech and DTC brands</p>
          <div className="rj-hero__proof-aside">
            <div className="rj-hero__proof-bundle">
              <ul className="rj-hero__proof-faces" aria-hidden="true">
                {PROOF_LOGOS.map((logo) => (
                  <li
                    key={logo.id}
                    className={
                      logo.fill
                        ? "rj-hero__proof-face rj-hero__proof-face--fill"
                        : "rj-hero__proof-face"
                    }
                  >
                    <img
                      src={logo.src}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </li>
                ))}
              </ul>
              <p className="rj-hero__proof-aside-text">{hero.logosStat}</p>
            </div>
          </div>
        </div>

        <div className="rj-hero__controls">
          <div ref={iconRef} className="rj-hero__icon-wrap" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 12 12"
              className="rj-hero__icon"
            >
              <path
                fill="currentColor"
                d="m5.796 9.246-2.97-2.97-.762.782 4.356 4.356 4.356-4.356-.782-.782-2.96 2.96V1.039H5.806z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={reelRef}
        id="home-reel"
        className="rj-reel"
        aria-label="Showreel"
      >
        <div ref={videoWrapRef} className="rj-reel__videos">
          <div ref={frameRef} className="rj-reel__video-frame">
            <LazyVideo
              ref={videoRef}
              className="rj-reel__video"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              muted
              loop
              playsInline
              preload={loadVideoEager ? "auto" : "metadata"}
              eager={loadVideoEager}
              autoPlayWhenVisible
              rootMargin="240px 0px"
            />
          </div>
        </div>
        <div className="rj-reel__mobile-label" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              fill="currentColor"
              d="m5.796 9.246-2.97-2.97-.762.782 4.356 4.356 4.356-4.356-.782-.782-2.96 2.96V1.039H5.806z"
            />
          </svg>
          Scroll
        </div>
      </div>
    </section>
  );
}
