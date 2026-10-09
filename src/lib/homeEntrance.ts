import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Homepage first-load entrance (header + showreel).
 * Ask dock is scroll-gated (see AiPromptInput) — not part of the hero entrance.
 * Hero copy entrance lives in HeroReel (plain GSAP fade — no SplitText).
 * CSS `.rj-page--enter` hides targets until this runs; `.rj-page--entered`
 * unlocks them after. Skips motion when prefers-reduced-motion.
 */
export function playHomeEntrance(root: HTMLElement): () => void {
  const header = root.querySelector<HTMLElement>(".rj-header");
  const reel = root.querySelector<HTMLElement>(".rj-reel");
  const frame = reel?.querySelector<HTMLElement>(".rj-reel__video-frame");

  const finish = () => {
    root.classList.add("rj-page--entered");
  };

  if (!header) {
    finish();
    return () => undefined;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    finish();
    return () => undefined;
  }

  gsap.set(header, { autoAlpha: 0, y: -18 });
  if (reel) gsap.set(reel, { autoAlpha: 0 });
  if (frame) {
    gsap.set(frame, {
      scale: 1.04,
      clipPath: "inset(0% round 0rem)",
      "--rj-reel-clip": "0%",
      "--rj-reel-radius": "0rem",
      transformOrigin: "50% 50%",
    });
  }

  let completed = false;
  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: () => {
      completed = true;
      finish();
      gsap.set(header, { clearProps: "opacity,visibility,transform" });
      if (reel) gsap.set(reel, { clearProps: "opacity,visibility" });
      if (frame) {
        gsap.set(frame, {
          clearProps: "transform",
          clipPath: "inset(0% round 0rem)",
          "--rj-reel-clip": "0%",
          "--rj-reel-radius": "0rem",
        });
      }
      ScrollTrigger.refresh();
    },
  });

  // Sequence: header → full-bleed video fade; title/description in HeroReel.
  tl.to(header, { autoAlpha: 1, y: 0, duration: 1.05 }, 0.05);
  if (reel) {
    tl.to(reel, { autoAlpha: 1, duration: 1.2 }, 0.22);
  }
  if (frame) {
    tl.to(frame, { scale: 1, duration: 1.55 }, 0.22);
  }

  return () => {
    // Kill only — do not unlock CSS or clearProps. Remounts (Strict Mode)
    // must not flash the finished page before the entrance plays again.
    // If the timeline already finished, keep the entered unlock.
    tl.kill();
    if (completed) finish();
  };
}
