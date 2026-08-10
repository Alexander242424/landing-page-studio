import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/brand/Logo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rejouice hero-reel: oversized brand mark + dual taglines + scroll cue,
 * then full-viewport showreel with scrubbed parallax on the mark and video.
 */
export function HeroReel() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const logo = logoRef.current;
    const reel = reelRef.current;
    const videoWrap = videoWrapRef.current;
    const video = videoRef.current;
    if (!hero || !logo || !reel || !videoWrap) return;

    const ctx = gsap.context(() => {
      gsap.set(logo, { autoAlpha: 1 });
      gsap.fromTo(
        logo,
        { yPercent: -18, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 2.3,
          ease: "expo.out",
          delay: 0.2,
        },
      );

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
    refresh();

    return () => {
      video?.removeEventListener("loadeddata", play);
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="rj-hero-reel" id="hero" aria-label="Hero">
      <div ref={heroRef} className="rj-hero">
        <div ref={logoRef} className="rj-hero__logo">
          <Logo
            href="#hero"
            className="rj-hero__logo-link"
            markClassName="rj-logo__mark--hero"
            title="UXLAB"
          />
        </div>

        <div className="rj-hero__bottom">
          <div className="rj-hero__taglines">
            <p className="rj-hero__tagline">
              Strategy, Design,
              <br /> Performance.
            </p>
            <p className="rj-hero__tagline">
              Global Creative
              <br /> &amp; Technology Agency.
            </p>
          </div>
          <div className="rj-hero__controls">
            <div className="rj-hero__icon-wrap" aria-hidden="true">
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

      <div ref={reelRef} id="home-reel" className="rj-reel">
        <div ref={videoWrapRef} className="rj-reel__videos">
          <div className="rj-reel__video-frame">
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
        <h2 className="rj-reel__label">Showreel</h2>
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
