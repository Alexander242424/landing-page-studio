import gsap from "gsap";

/**
 * Homepage first-load entrance (header, showreel).
 * Ask dock is scroll-gated (see AiPromptInput) — not part of the hero entrance.
 * Hero title uses createAwardsCharReveal; description uses createTextReveal
 * (both in HeroReel). CSS `.rj-page--enter` hides targets until this runs;
 * `.rj-page--entered` unlocks them after. Skips motion when prefers-reduced-motion.
 */
export function playHomeEntrance(root: HTMLElement): () => void {
  const header = root.querySelector<HTMLElement>(".rj-header");
  const reel = root.querySelector<HTMLElement>(".rj-reel");
  const frame = reel?.querySelector<HTMLElement>(".rj-reel__video-frame");

  const finish = () => {
    root.classList.add("rj-page--entered");
  };

  if (!header || !reel) {
    finish();
    return () => undefined;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    finish();
    return () => undefined;
  }

  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const restClip = desktop
    ? "inset(12% round 2.4rem)"
    : "inset(0% round 0rem)";
  const fromClip = desktop
    ? "inset(26% round 3rem)"
    : "inset(16% round 1.4rem)";

  gsap.set(header, { autoAlpha: 0, y: -18 });
  gsap.set(reel, { autoAlpha: 0 });
  if (frame) {
    gsap.set(frame, {
      scale: 1.06,
      clipPath: fromClip,
      transformOrigin: "50% 50%",
    });
  }

  const clearables: HTMLElement[] = [header, reel];
  if (frame) clearables.push(frame);

  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: () => {
      finish();
      gsap.set(header, { clearProps: "opacity,visibility,transform" });
      gsap.set(reel, { clearProps: "opacity,visibility" });
      if (frame) {
        // Leave resting clip to CSS / scroll scrub; clear entrance transform.
        gsap.set(frame, { clearProps: "transform" });
        gsap.set(frame, { clipPath: restClip });
      }
    },
  });

  // Sequence: header → video (clip + scale); title/description in HeroReel.
  tl.to(header, { autoAlpha: 1, y: 0, duration: 1.05 }, 0.05);
  tl.to(reel, { autoAlpha: 1, duration: 1.2 }, 0.22);
  if (frame) {
    tl.to(
      frame,
      {
        scale: 1,
        clipPath: restClip,
        duration: 1.55,
      },
      0.22,
    );
  }

  return () => {
    tl.kill();
    finish();
    gsap.set(clearables, {
      clearProps: "opacity,visibility,transform,clipPath",
    });
  };
}
