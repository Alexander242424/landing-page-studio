import { useLayoutEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoStrip } from "@/components/home/LogoStrip";
import { LazyVideo } from "@/components/media/LazyVideo";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat } from "@/lib/askChat";
import type { ServiceHeroContent } from "@/lib/servicePages";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";
import { usePageReveal } from "@/lib/pageReveal";

gsap.registerPlugin(ScrollTrigger);

const HERO_VIDEO = "/video/hero.mp4";
const HERO_POSTER = "/video/hero-poster.jpg";
const MOBILE_MQ = "(max-width: 1023px)";
const DESKTOP_MQ = "(min-width: 1024px)";

const DEFAULT_HERO: ServiceHeroContent = {
  ariaLabel: "We turn your product experience into revenue.",
  lines: ["We turn your product", "experience into revenue."],
  description:
    "Growth partner for AI startups and product teams to boost conversions, retention, user experience, funnels, and AI transformation.",
  primaryCta: { label: "Let's talk", href: "#contact" },
  secondaryCta: { label: "See results", href: "#glance" },
  logosStat: "Trusted by 200+ YCombinator \n& Speedrun founders",
};

/**
 * Rejouice-matched hero + showreel:
 * - Awards char reveal on 2-line static headline
 * - Description via createTextReveal (same masked word reveal as HomeIntro / approach)
 * - Scrubbed title+description parallax; showreel stays full-bleed (no clip grow)
 * - Logo bar sits outside the copy unit so it rides up with the video
 * - Taglines sit in normal hero flow on all breakpoints (no mobile bottom scrub —
 *   that desynced them from the showreel while the video scrolled)
 * - Mobile uses a lighter animation budget to avoid touch scroll jitter
 *
 * Load sequence (with playHomeEntrance): header → video → title → description
 */
export function HeroReel({ content }: { content?: ServiceHeroContent } = {}) {
  const hero = content ?? DEFAULT_HERO;
  const { lenis } = useSmoothScroll();
  const { isRevealed, shouldPlay } = usePageReveal();
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToHref = (href: string) => {
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onResultsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToHref(hero.secondaryCta.href);
  };

  const onTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactChat();
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const logo = logoRef.current;
    const copy = copyRef.current;
    const description = descriptionRef.current;
    const actions = actionsRef.current;
    const logos = logosRef.current;
    const icon = iconRef.current;
    const reel = reelRef.current;
    const videoWrap = videoWrapRef.current;
    const frame = frameRef.current;
    if (!isRevealed) return;
    if (!hero || !logo || !copy || !reel || !videoWrap || !frame) return;

    // Headline + description + CTAs share one scroll-linked y.
    // Logos sit on the reel and scroll with it (Rejouice: bar + video go up together).
    const copyUnit = copy;

    const cleanups: Array<() => void> = [];

    // DOM-mutating splits outside gsap.context so ctx.revert() cannot double-revert.
    // Title after video starts (~0.22s in playHomeEntrance); description as title settles.
    cleanups.push(
      createAwardsCharReveal(logo, {
        playOnLoad: true,
        delay: 0.52,
        duration: 1.5,
        stagger: 0.05,
        yStagger: 0.016,
      }),
    );

    if (description) {
      cleanups.push(
        createTextReveal(description, {
          playOnLoad: true,
          delay: 1.7,
        }),
      );
    }

    const ctx = gsap.context(() => {
      if (actions) {
        gsap.set(actions, { autoAlpha: 0, y: 14 });
        gsap.to(actions, {
          autoAlpha: 1,
          y: 0,
          delay: 2.55,
          duration: 1,
          ease: "expo.out",
        });
      }

      if (logos) {
        gsap.set(logos, { autoAlpha: 1 });

        const logosStat = logos.querySelector<HTMLElement>(".rj-hero__logos-stat");
        if (logosStat) {
          gsap.set(logosStat, { autoAlpha: 0, y: 14 });
          gsap.to(logosStat, {
            autoAlpha: 1,
            y: 0,
            delay: 2.55,
            duration: 1,
            ease: "expo.out",
          });
        }
      }

      if (icon) {
        gsap.set(icon, { autoAlpha: 0, y: -14 });
        gsap.to(icon, {
          autoAlpha: 1,
          y: 0,
          delay: 1.35,
          duration: 1.2,
          ease: "expo.out",
        });
        gsap.to(icon, {
          y: 8,
          delay: 2.7,
          duration: 1.15,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Fixed to viewport bottom — hide once the hero band leaves the screen.
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom bottom",
          end: "bottom top",
          onEnter: () => gsap.to(icon, { autoAlpha: 0, duration: 0.25, overwrite: "auto" }),
          onLeaveBack: () => gsap.to(icon, { autoAlpha: 1, duration: 0.25, overwrite: "auto" }),
        });
      }

      const mm = gsap.matchMedia();

      // Mobile: no copy/video parallax — video must not scrub up over the hero text.
      mm.add(MOBILE_MQ, () => {
        gsap.set(frame, {
          clearProps: "--rj-reel-clip,--rj-reel-radius",
          clipPath: "inset(0% round 0rem)",
        });
        gsap.set(copyUnit, { clearProps: "transform" });
        gsap.set(videoWrap, { clearProps: "transform" });

        return () => {
          gsap.set([copyUnit, videoWrap], {
            clearProps: "transform",
          });
          gsap.set(frame, {
            clearProps: "transform,clipPath,--rj-reel-clip,--rj-reel-radius",
          });
        };
      });

      // Desktop: copy drifts; logos + full-bleed reel stay glued and scroll away together.
      mm.add(DESKTOP_MQ, () => {
        gsap.set(frame, {
          "--rj-reel-clip": "0%",
          "--rj-reel-radius": "0rem",
          clipPath: "inset(0% round 0rem)",
        });
        gsap.set(videoWrap, { clearProps: "transform" });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              scrub: true,
              start: "top top",
              end: "bottom top",
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            copyUnit,
            { y: 0 },
            {
              // A bit faster off the top than the original 0.5 hold — keep it mild.
              y: () => hero.offsetHeight * 0.32,
              duration: 1,
              ease: "none",
            },
          );

        return () => {
          gsap.set(frame, {
            clearProps: "--rj-reel-clip,--rj-reel-radius,clipPath",
          });
          gsap.set(videoWrap, { clearProps: "transform" });
        };
      });

      cleanups.push(() => mm.revert());
    }, rootRef);

    // Avoid ScrollTrigger.refresh on mobile address-bar resize (layout thrash).
    // First-load: playHomeEntrance / preloader already refresh after the wipe.
    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    if (!shouldPlay) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [isRevealed, shouldPlay]);

  return (
    <section ref={rootRef} className="rj-hero-reel" id="hero" aria-label="Hero">
      <div ref={heroRef} className="rj-hero">
        <div ref={copyRef} className="rj-hero__motion">
          <div className="rj-hero__copy">
            <h1
              ref={logoRef}
              className="rj-hero__logo rj-hero__headline rj-awards-title"
              aria-label={hero.ariaLabel}
            >
              <span className="rj-hero__line">{hero.lines[0]}</span>{" "}
              <span className="rj-hero__line">{hero.lines[1]}</span>
            </h1>
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
                <ArrowLink
                  href={hero.secondaryCta.href}
                  className="rj-link-active rj-hero__cta rj-hero__cta--process"
                  onClick={onResultsClick}
                >
                  {hero.secondaryCta.label}
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>

        <div ref={logosRef} className="rj-hero__logos">
          <div className="rj-hero__logos-bar">
            <p className="rj-hero__logos-stat">
              {hero.logosStat.split("\n").map((line, index, arr) => (
                <span key={line}>
                  {line}
                  {index < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <LogoStrip variant="hero" />
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
        role="button"
        tabIndex={0}
        aria-label="Play showreel"
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
              preload={shouldPlay ? "auto" : "metadata"}
              eager={shouldPlay}
              autoPlayWhenVisible
              // Warm shortly before the showreel enters view — not on first paint.
              rootMargin="240px 0px"
            />
          </div>
        </div>
        <p className="rj-reel__mobile-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="110"
            height="135"
            fill="none"
            viewBox="0 0 110 135"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M21 35.12c0-5.566 6.121-8.964 10.871-6.058l53.727 32.875c4.535 2.778 4.535 9.348 0 12.125l-53.727 32.875c-4.75 2.906-10.871-.492-10.871-6.058z"
              clipRule="evenodd"
            />
          </svg>
          <span>Play Reel</span>
        </p>
      </div>
    </section>
  );
}
