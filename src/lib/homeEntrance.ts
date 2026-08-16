import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  // Rest matches CSS / scroll scrub start; from stays ~14pp more inset.
  const restClip = "21.5%";
  const restRadius = "2.4rem";
  const fromClip = desktop ? "35.5%" : "16%";
  const fromRadius = desktop ? "3rem" : "1.4rem";

  gsap.set(header, { autoAlpha: 0, y: -18 });
  gsap.set(reel, { autoAlpha: 0 });
  if (frame) {
    if (desktop) {
      gsap.set(frame, {
        scale: 1.06,
        "--rj-reel-clip": fromClip,
        "--rj-reel-radius": fromRadius,
        transformOrigin: "50% 50%",
      });
    } else {
      gsap.set(frame, {
        scale: 1.06,
        clipPath: `inset(${fromClip} round ${fromRadius})`,
        transformOrigin: "50% 50%",
      });
    }
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
        // Leave resting clip to CSS vars / scroll scrub; clear entrance transform.
        gsap.set(frame, { clearProps: "transform" });
        if (desktop) {
          gsap.set(frame, {
            "--rj-reel-clip": restClip,
            "--rj-reel-radius": restRadius,
          });
        } else {
          gsap.set(frame, { clipPath: "inset(0% round 0rem)" });
        }
      }
      // Recalculate scrub ranges after entrance layout settles.
      ScrollTrigger.refresh();
    },
  });

  // Sequence: header → video (clip + scale); title/description in HeroReel.
  tl.to(header, { autoAlpha: 1, y: 0, duration: 1.05 }, 0.05);
  tl.to(reel, { autoAlpha: 1, duration: 1.2 }, 0.22);
  if (frame) {
    if (desktop) {
      tl.to(
        frame,
        {
          scale: 1,
          "--rj-reel-clip": restClip,
          "--rj-reel-radius": restRadius,
          duration: 1.55,
        },
        0.22,
      );
    } else {
      tl.to(
        frame,
        {
          scale: 1,
          clipPath: "inset(0% round 0rem)",
          duration: 1.55,
        },
        0.22,
      );
    }
  }

  return () => {
    tl.kill();
    finish();
    gsap.set(clearables, {
      clearProps:
        "opacity,visibility,transform,clipPath,--rj-reel-clip,--rj-reel-radius",
    });
  };
}
