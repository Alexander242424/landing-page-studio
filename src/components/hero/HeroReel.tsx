import { useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LazyVideo } from "@/components/media/LazyVideo";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat } from "@/lib/askChat";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const HERO_VIDEO = "/video/hero.mp4";
const HERO_POSTER = "/video/hero-poster.jpg";
const MOBILE_MQ = "(max-width: 1023px)";
const DESKTOP_MQ = "(min-width: 1024px)";

/**
 * Rejouice-matched hero + showreel:
 * - Awards char reveal on 2-line static headline
 * - Description via createTextReveal (same masked word reveal as HomeIntro / approach)
 * - Scrubbed title+description parallax (shared y); reel clip-path grow (desktop)
 *   + video parallax
 * - Taglines sit in normal hero flow on all breakpoints (no mobile bottom scrub —
 *   that desynced them from the showreel while the video scrolled)
 * - Mobile uses a lighter animation budget to avoid touch scroll jitter
 *
 * Load sequence (with playHomeEntrance): header → video → title → description
 */
export function HeroReel() {
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
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

  const onProcessClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToHref("#process");
  };

  const onTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactChat();
  };

  useEffect(() => {
    const hero = heroRef.current;
    const logo = logoRef.current;
    const copy = copyRef.current;
    const description = descriptionRef.current;
    const actions = actionsRef.current;
    const icon = iconRef.current;
    const reel = reelRef.current;
    const videoWrap = videoWrapRef.current;
    const frame = frameRef.current;
    if (!hero || !logo || !copy || !reel || !videoWrap || !frame) return;

    // Title + description/CTAs share one scroll-linked y (move as one unit).
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
      }

      const mm = gsap.matchMedia();

      // Mobile: copy-unit parallax only; skip clip-path scrub (main jank source).
      // Taglines stay in document flow like desktop so they leave with the reel.
      mm.add(MOBILE_MQ, () => {
        gsap.set(frame, { clipPath: "inset(0% round 0rem)" });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              // Soft scrub damps finger-sample noise without feeling laggy.
              scrub: 0.45,
              start: "top top",
              end: "bottom top",
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            copyUnit,
            { y: 0 },
            {
              y: () => hero.offsetHeight * 0.16,
              duration: 1,
              ease: "none",
              force3D: true,
            },
          );

        // Mild video drift only — ±50% + clip-path fought native touch scroll.
        gsap.fromTo(
          videoWrap,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: reel,
              scrub: 0.45,
              start: "top bottom",
              end: "bottom top",
            },
          },
        );

        return () => {
          gsap.set([copyUnit, videoWrap, frame], {
            clearProps: "transform,clipPath",
          });
        };
      });

      // Desktop: keep full Rejouice scrub budget.
      mm.add(DESKTOP_MQ, () => {
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
              y: () => hero.offsetHeight * 0.5,
              duration: 1,
              ease: "none",
            },
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: reel,
              scrub: true,
              start: "top bottom",
              end: "top top",
            },
          })
          .fromTo(
            frame,
            { clipPath: "inset(21.5% round 2.4rem)" },
            { clipPath: "inset(0% round 0rem)", ease: "none", duration: 1 },
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: reel,
              scrub: true,
              start: "top bottom",
              end: "bottom top",
            },
          })
          .fromTo(
            videoWrap,
            { yPercent: -50 },
            { yPercent: 50, ease: "none", duration: 1 },
          );
      });

      cleanups.push(() => mm.revert());
    }, rootRef);

    // Avoid ScrollTrigger.refresh on mobile address-bar resize (layout thrash).
    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="rj-hero-reel" id="hero" aria-label="Hero">
      <div ref={heroRef} className="rj-hero">
        <div ref={copyRef} className="rj-hero__copy">
          <h1
            ref={logoRef}
            className="rj-hero__logo rj-hero__headline rj-awards-title"
            aria-label="We turn your product experience into revenue."
          >
            <span className="rj-hero__line">We turn your product</span>
            <span className="rj-hero__line">experience into revenue.</span>
          </h1>
          <div className="rj-hero__taglines">
            <p
              ref={descriptionRef}
              className="rj-hero__tagline rj-hero__description rj-text-reveal"
            >
              UXLab drives growth for your product through UX, AI
              transformation, conversions,
              <br className="rj-hero__description-break" />
              activations and retention that compound.
            </p>
            <div
              ref={actionsRef}
              className="rj-hero__actions"
              aria-label="Hero actions"
            >
              <ArrowLink
                href="#contact"
                className="rj-link-active rj-hero__cta rj-hero__cta--talk"
                onClick={onTalkClick}
              >
                Let&apos;s talk
              </ArrowLink>
              <ArrowLink
                href="#process"
                className="rj-link-active rj-hero__cta rj-hero__cta--process"
                onClick={onProcessClick}
              >
                Our process
              </ArrowLink>
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
              preload="metadata"
              autoPlayWhenVisible
              // Warm shortly before the showreel enters view — not on first paint.
              rootMargin="240px 0px"
            />
          </div>
        </div>
        <h2 className="rj-reel__label rj-link-active">Showreel</h2>
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
