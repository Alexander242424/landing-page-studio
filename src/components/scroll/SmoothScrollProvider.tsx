import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Smooth inertia scrolling matching Rejouice (Nuxt site uses Lenis
 * with default lerp ≈ 0.1, smoothWheel, GSAP-synced RAF).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      autoRaf: false,
      overscroll: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return children;
}
