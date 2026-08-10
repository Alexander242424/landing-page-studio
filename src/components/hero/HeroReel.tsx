import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rejouice-matched hero + showreel:
 * - Awards char reveal on 2-line static headline (Grow revenue… / right UX solutions.)
 * - Description + scroll-cue entrance
 * - Scrubbed headline + reel clip-path grow + video parallax
 * - Showreel label: mix-blend difference, permanent underline, pointer
 */
export function HeroReel() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const logo = logoRef.current;
    const description = descriptionRef.current;
    const icon = iconRef.current;
    const reel = reelRef.current;
    const videoWrap = videoWrapRef.current;
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!hero || !logo || !reel || !videoWrap || !frame) return;

    const cleanups: Array<() => void> = [];

    // SplitText outside gsap.context so ctx.revert() cannot double-revert it.
    cleanups.push(
      createAwardsCharReveal(logo, {
        playOnLoad: true,
        delay: 0.2,
        duration: 1.5,
        stagger: 0.05,
        yStagger: 0.016,
      }),
    );

    if (description) {
      cleanups.push(
        createTextReveal(description, {
          playOnLoad: true,
          delay: 0.8,
          direction: 1,
          linesStagger: 0.08,
          duration: 1.6,
        }),
      );
    }

    const ctx = gsap.context(() => {
      if (icon) {
        gsap.set(icon, { autoAlpha: 0, y: -14 });
        gsap.to(icon, {
          autoAlpha: 1,
          y: 0,
          delay: 1.05,
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
          logo,
          { y: 0 },
          {
            y: () => hero.offsetHeight * 0.5,
            duration: 1,
            ease: "none",
          },
        );

      // Appear + grow (Rejouice home-video style), on the hero showreel.
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
          { clipPath: "inset(12% round 2.4rem)" },
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
    }, rootRef);

    const play = () => {
      void video?.play().catch(() => undefined);
    };
    play();
    video?.addEventListener("loadeddata", play);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    requestAnimationFrame(refresh);

    return () => {
      video?.removeEventListener("loadeddata", play);
      window.removeEventListener("resize", refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="rj-hero-reel" id="hero" aria-label="Hero">
      <div ref={heroRef} className="rj-hero">
        <div className="rj-hero__headline-stage">
          <h1
            ref={logoRef}
            className="rj-hero__logo rj-hero__headline rj-awards-title"
            aria-label="Growth product performance agency"
          >
            Growth product
            <br />
            performance agency
          </h1>
        </div>

        <div className="rj-hero__bottom">
          <div className="rj-hero__taglines">
            <p ref={descriptionRef} className="rj-hero__tagline rj-hero__description">
              We grow your product and revenue by boosting user experience,
              journeys, and metrics that drive conversion, activation, trials.
            </p>
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
            <video
              ref={videoRef}
              className="rj-reel__video"
              src="/video/hero.mp4"
              muted
              loop
              playsInline
              preload="auto"
              autoPlay
              draggable={false}
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
