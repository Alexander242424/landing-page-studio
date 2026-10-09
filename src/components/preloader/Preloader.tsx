import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageReveal } from "@/lib/pageReveal";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const PRELOADER_MESSAGE = {
  words: ["#1", "Conversion", "Rate", "Optimisation", "Agency"],
  ariaLabel: "#1 Conversion Rate Optimisation Agency",
} as const;

const MIN_VISIBLE_MS = 1800;
const MAX_WAIT_MS = 4500;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitForFonts() {
  if (!document.fonts?.ready) return Promise.resolve();
  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

async function waitUntilReady() {
  const started = performance.now();
  await Promise.race([
    waitForFonts(),
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

function preloaderWords(title: HTMLElement) {
  return gsap.utils.toArray<HTMLElement>(title.querySelectorAll(".rj-preloader__word"));
}

/**
 * Rejouice-style first-load gate: lock scroll, wait for fonts,
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

    const reduced = prefersReducedMotion();
    let cancelled = false;
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
      reveal();
      playExitRef.current = () => undefined;

      const words = preloaderWords(title);

      if (reduced) {
        finish();
        return;
      }

      root.classList.add("rj-preloader--exiting");
      root.classList.remove("rj-preloader--in");
      if (words.length) {
        gsap.set(words, {
          overwrite: true,
          x: 0,
          xPercent: 0,
          y: 0,
          yPercent: 0,
        });
      }

      exit = gsap.timeline({
        onComplete: finish,
      });
      if (words.length) {
        exit.to(
          words,
          {
            yPercent: -110,
            duration: 0.72,
            ease: "expo.inOut",
            stagger: 0.045,
            overwrite: true,
          },
          0,
        );
      }
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

    if (reduced) {
      root.classList.remove("rj-preloader--in");
    } else if (!root.classList.contains("rj-preloader--in")) {
      // Arm once after hydrate. Do not toggle off/on — that replays the reveal.
      root.classList.add("rj-preloader--in");
    }

    void waitUntilReady().then(() => {
      if (cancelled) return;
      playExit();
    });

    playExitRef.current = playExit;

    return () => {
      cancelled = true;
      playExitRef.current = () => undefined;
      exit?.kill();
      gsap.killTweensOf(root);
      gsap.killTweensOf(title);
      gsap.killTweensOf(preloaderWords(title));
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
        aria-label={PRELOADER_MESSAGE.ariaLabel}
      >
        {PRELOADER_MESSAGE.words.map((word, index) => (
          <span
            key={`${index}-${word}`}
            className="rj-preloader__word-wrap"
            aria-hidden="true"
          >
            <span
              className="rj-preloader__word"
              style={{ animationDelay: `${0.06 + index * 0.06}s` }}
            >
              {word}
            </span>
          </span>
        ))}
      </h2>
    </div>
  );
}
