import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageReveal } from "@/lib/pageReveal";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const PRELOADER_MESSAGES = [
  {
    words: ["Your", "growth", "starts", "here."],
    ariaLabel: "Your growth starts here.",
  },
  {
    words: ["Growth", "product", "performance", "agency."],
    ariaLabel: "Growth product performance agency.",
  },
] as const;

type PreloaderMessage = (typeof PRELOADER_MESSAGES)[number];

const PRELOADER_MESSAGE_KEY = "rj-preloader-message";

/** Cache so Strict Mode / effect re-entry cannot advance the rotation twice. */
let pickedMessage: PreloaderMessage | null = null;

function pickPreloaderMessage(): PreloaderMessage {
  if (pickedMessage) return pickedMessage;
  try {
    const raw = Number(sessionStorage.getItem(PRELOADER_MESSAGE_KEY) ?? "0");
    const index =
      (Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0) %
      PRELOADER_MESSAGES.length;
    sessionStorage.setItem(
      PRELOADER_MESSAGE_KEY,
      String((index + 1) % PRELOADER_MESSAGES.length),
    );
    pickedMessage = PRELOADER_MESSAGES[index]!;
    return pickedMessage;
  } catch {
    pickedMessage = PRELOADER_MESSAGES[0]!;
    return pickedMessage;
  }
}

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

function preloaderWords(title: HTMLElement) {
  return gsap.utils.toArray<HTMLElement>(title.querySelectorAll(".rj-preloader__word"));
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
  // SSR + first hydrate always use message[0] so markup matches. The client
  // swaps (if needed) in layout before paint, then arms CSS intro once.
  const [message, setMessage] = useState<PreloaderMessage>(
    PRELOADER_MESSAGES[0],
  );

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

    const chosen = pickPreloaderMessage();
    if (chosen !== message) {
      setMessage(chosen);
      return;
    }

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
  }, [mounted, message, reveal]);

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
        aria-label={message.ariaLabel}
      >
        {message.words.map((word, index) => (
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
