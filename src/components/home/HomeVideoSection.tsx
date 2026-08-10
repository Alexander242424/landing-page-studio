import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rejouice home-video: clip-path inset(10%) → inset(0%) scrubbed on scroll.
 * Mobile skips clip-path scrub (expensive / jittery on touch).
 */
export function HomeVideoSection() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!root || !wrap) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 1023px)", () => {
        gsap.set(wrap, { clipPath: "inset(0%)" });
      });

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "40% 50%",
            scrub: true,
          },
        });
        tl.set(wrap, { clipPath: "inset(10%)" });
        tl.to(wrap, { clipPath: "inset(0%)", ease: "none" });
      });
    }, root);

    const play = () => {
      void video?.play().catch(() => undefined);
    };
    play();
    video?.addEventListener("loadeddata", play);

    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      video?.removeEventListener("loadeddata", play);
      window.removeEventListener("orientationchange", onOrientation);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="rj-home-video"
      id="show"
      aria-label="Portfolio reel"
    >
      <div ref={wrapRef} className="rj-home-video__wrap">
        <div className="rj-home-video__media">
          <video
            ref={videoRef}
            className="rj-home-video__video"
            src="/video/portfolio-loop.mp4"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
