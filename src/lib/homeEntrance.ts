import gsap from "gsap";

/**
 * Homepage first-load entrance (header, hero taglines, showreel, ask bar).
 * CSS `.rj-page--enter` hides targets until this runs; `.rj-page--entered`
 * unlocks them after. Skips motion when prefers-reduced-motion.
 */
export function playHomeEntrance(root: HTMLElement): () => void {
  const header = root.querySelector<HTMLElement>(".rj-header");
  const reel = root.querySelector<HTMLElement>(".rj-reel");
  const ask = root.querySelector<HTMLElement>(".rj-ask");
  const taglines = root.querySelector<HTMLElement>(".rj-hero__taglines");
  const taglineItems = taglines
    ? Array.from(
        taglines.querySelectorAll<HTMLElement>(".rj-hero__tagline"),
      )
    : [];

  const finish = () => {
    root.classList.add("rj-page--entered");
  };

  if (!header || !reel || !ask) {
    finish();
    return () => undefined;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    finish();
    return () => undefined;
  }

  const askFullWidth = ask.getBoundingClientRect().width;
  const askStartWidth = Math.max(
    Math.min(askFullWidth * 0.7, askFullWidth - 56),
    Math.min(300, askFullWidth),
  );

  gsap.set(header, { autoAlpha: 0, y: -18 });
  gsap.set(reel, {
    autoAlpha: 0,
    scale: 1.045,
    transformOrigin: "50% 50%",
  });
  gsap.set(ask, {
    autoAlpha: 0,
    y: 28,
    width: askStartWidth,
  });

  const taglineTargets =
    taglineItems.length > 0 ? taglineItems : taglines ? [taglines] : [];
  if (taglineTargets.length) {
    gsap.set(taglineTargets, { autoAlpha: 0, y: 18 });
  }

  const clearables: HTMLElement[] = [header, reel, ask, ...taglineTargets];

  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: () => {
      finish();
      gsap.set(header, { clearProps: "opacity,visibility,transform" });
      gsap.set(reel, { clearProps: "opacity,visibility,transform" });
      gsap.set(ask, {
        clearProps: "opacity,visibility,transform,width",
      });
      if (taglineTargets.length) {
        // Only clear opacity/visibility — leave transform free for ScrollTrigger
        // on `.rj-hero__bottom` (mobile parallax parent).
        gsap.set(taglineTargets, {
          clearProps: "opacity,visibility,transform",
        });
      }
    },
  });

  // Header + reel start together; ask follows ~220ms later.
  tl.to(header, { autoAlpha: 1, y: 0, duration: 1.05 }, 0.06);
  tl.to(reel, { autoAlpha: 1, scale: 1, duration: 1.4 }, 0.1);
  tl.to(
    ask,
    {
      autoAlpha: 1,
      y: 0,
      width: askFullWidth,
      duration: 1.1,
    },
    0.32,
  );

  // Taglines with / just after reel reveal (alongside bottom hero content).
  if (taglineTargets.length) {
    tl.to(
      taglineTargets,
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        stagger: 0.08,
      },
      0.55,
    );
  }

  return () => {
    tl.kill();
    finish();
    gsap.set(clearables, {
      clearProps: "opacity,visibility,transform,width",
    });
  };
}
