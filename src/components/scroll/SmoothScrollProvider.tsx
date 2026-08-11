import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  stop: () => undefined,
  start: () => undefined,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

function prefersNativeTouchScroll() {
  if (typeof window === "undefined") return false;
  // Touch / coarse pointers: native scroll only — Lenis RAF + ST updates fight finger scroll.
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/**
 * Lenis + GSAP ScrollTrigger sync matching Rejouice
 * (lerp 0.1, scrubbed hero parallax driven by Lenis scroll).
 * On touch devices Lenis is skipped so ScrollTrigger rides native scroll.
 * Lenis is dynamically imported so mobile never downloads the chunk.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersNativeTouchScroll()) {
      setLenis(null);
      return;
    }

    let cancelled = false;
    let instance: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;

      instance = new LenisCtor({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        autoRaf: false,
        overscroll: true,
      });

      instance.on("scroll", ScrollTrigger.update);

      ticker = (time: number) => {
        instance?.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      setLenis(instance);
    });

    return () => {
      cancelled = true;
      if (ticker) gsap.ticker.remove(ticker);
      instance?.destroy();
      setLenis(null);
    };
  }, []);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      lenis,
      stop: () => lenis?.stop(),
      start: () => lenis?.start(),
    }),
    [lenis],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
