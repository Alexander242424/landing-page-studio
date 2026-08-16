import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageReveal } from "@/lib/pageReveal";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["Growth", "product", "performance", "agency"] as const;
const MIN_VISIBLE_MS = 1800;
const MAX_WAIT_MS = 4500;
const MEDIA_GIVE_UP_MS = 3800;
const NO_HERO_MS = 360;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitForFonts() {
  if (!document.fonts?.ready) return Promise.resolve();
  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

function waitForHeroMedia() {
  return new Promise<void>((resolve) => {
    const giveUp = window.setTimeout(resolve, MEDIA_GIVE_UP_MS);
    let frames = 0;
    const maxFrames = Math.ceil(NO_HERO_MS / 16);

    const finish = () => {
      window.clearTimeout(giveUp);
      resolve();
    };

    const bind = (video: HTMLVideoElement) => {
      if (video.readyState >= 2) {
        finish();
        return;
      }
      const done = () => finish();
      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("error", done, { once: true });
    };

    const tick = () => {
      const video = document.querySelector<HTMLVideoElement>(".rj-reel__video");
      if (video) {
        bind(video);
        return;
      }
      if (frames++ >= maxFrames) {
        finish();
        return;
      }
      requestAnimationFrame(tick);
    };

    tick();
  });
}

async function waitUntilReady() {
  const started = performance.now();
  await Promise.race([
    Promise.all([waitForFonts(), waitForHeroMedia()]),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, MAX_WAIT_MS);
    }),
  ]);
  const elapsed = performance.now() - started;
  if (elapsed < MIN_VISIBLE_MS) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, MIN_VISIBLE_MS - elapsed);
    });
  }
}

/**
 * Rejouice-style first-load gate: lock scroll, wait for fonts + hero media,
 * then wipe away so entrance / ScrollTrigger / Lenis start on a settled page.
 */
export function Preloader() {
  const { shouldPlay, isRevealed, reveal } = usePageReveal();
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lenisRef = useRef(lenis);
  const exitStartedRef = useRef(false);
  const playExitRef = useRef<() => void>(() => undefined);
  const [mounted, setMounted] = useState(shouldPlay && !isRevealed);

  lenisRef.current = lenis;

  useLayoutEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const previousRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    root.classList.add("rj-preloading");
    lenisRef.current?.stop();

    const keepTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    window.addEventListener("scroll", keepTop, { passive: true });

    return () => {
      window.removeEventListener("scroll", keepTop);
      root.classList.remove("rj-preloading");
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousRestoration;
      }
    };
  }, [mounted]);

  useLayoutEffect(() => {
    if (mounted) {
      lenis?.stop();
    }
  }, [mounted, lenis]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;

    const words = title.querySelectorAll<HTMLElement>(".rj-preloader__word");
    const reduced = prefersReducedMotion();
    let cancelled = false;
    let intro: gsap.core.Timeline | null = null;
    let exit: gsap.core.Timeline | null = null;

    const finish = () => {
      if (cancelled) return;
      document.documentElement.classList.remove("rj-preloading");
      window.scrollTo(0, 0);
      const scroll = lenisRef.current;
      scroll?.scrollTo(0, { immediate: true });
      scroll?.start();
      scroll?.resize();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          ScrollTrigger.refresh();
        });
      });
      setMounted(false);
    };

    const playExit = () => {
      if (cancelled || exitStartedRef.current) return;
      exitStartedRef.current = true;
      // Start hero/header/video under the wipe — not after it.
      reveal();
      playExitRef.current = () => undefined;

      if (reduced) {
        finish();
        return;
      }

      exit = gsap.timeline({
        onComplete: finish,
      });
      exit.to(
        words,
        {
          yPercent: -110,
          duration: 0.72,
          ease: "expo.inOut",
          stagger: 0.045,
        },
        0,
      );
      exit.to(
        root,
        {
          yPercent: 100,
          duration: 0.95,
          ease: "expo.inOut",
        },
        0.1,
      );
    };

    if (!reduced) {
      gsap.set(words, { yPercent: 110 });
      intro = gsap.timeline();
      intro.to(words, {
        yPercent: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      });
    }

    void waitUntilReady().then(() => {
      if (cancelled) return;
      if (intro && intro.isActive()) {
        intro.eventCallback("onComplete", playExit);
        return;
      }
      playExit();
    });

    playExitRef.current = playExit;

    return () => {
      cancelled = true;
      playExitRef.current = () => undefined;
      intro?.kill();
      exit?.kill();
      gsap.killTweensOf([root, title, words]);
    };
  }, [mounted, reveal]);

  useLayoutEffect(() => {
    if (!mounted || !isRevealed) return;
    playExitRef.current();
  }, [mounted, isRevealed]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className="rj-preloader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if("scrollRestoration"in history)history.scrollRestoration="manual";window.scrollTo(0,0)}catch(e){}`,
        }}
      />
      <h2
        ref={titleRef}
        className="rj-preloader__title"
        aria-label="Growth product performance agency"
      >
        {WORDS.map((word) => (
          <span key={word} className="rj-preloader__word-wrap" aria-hidden="true">
            <span className="rj-preloader__word">{word}</span>
          </span>
        ))}
      </h2>
    </div>
  );
}
