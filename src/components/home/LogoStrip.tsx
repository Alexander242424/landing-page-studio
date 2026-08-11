import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  CLIENT_LOGOS,
  LOGO_STRIP_SEED_IDS,
  type ClientLogo,
} from "@/lib/clientLogos";

const SLOT_COUNT = 8;

/** Fade out → swap → fade in duration (seconds). */
const FADE_DURATION = 0.55;
/** Pause between slot swaps (seconds), plus random jitter. */
const SWAP_BASE = 2.1;
const SWAP_JITTER = 1.4;

function logoById(id: string): ClientLogo {
  return CLIENT_LOGOS.find((logo) => logo.id === id) ?? CLIENT_LOGOS[0]!;
}

function pickInitial(): ClientLogo[] {
  return LOGO_STRIP_SEED_IDS.map(logoById).slice(0, SLOT_COUNT);
}

function pickNext(visible: ClientLogo[], pool: ClientLogo[]): ClientLogo {
  const visibleIds = new Set(visible.map((logo) => logo.id));
  const candidates = pool.filter((logo) => !visibleIds.has(logo.id));
  const bag = candidates.length > 0 ? candidates : pool;
  return bag[Math.floor(Math.random() * bag.length)]!;
}

/**
 * Rejouice-style client logo strip: fixed slots on a light band,
 * logos fade-swap from a larger pool (staggered, one at a time).
 */
export function LogoStrip() {
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const visibleRef = useRef<ClientLogo[]>(pickInitial());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => motionMq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (CLIENT_LOGOS.length <= SLOT_COUNT) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastSlot = -1;
    let activeTween: gsap.core.Timeline | null = null;

    const schedule = () => {
      const delay = (SWAP_BASE + Math.random() * SWAP_JITTER) * 1000;
      timer = setTimeout(runSwap, delay);
    };

    const runSwap = () => {
      if (cancelled) return;

      const visible = visibleRef.current;
      let slotIndex = Math.floor(Math.random() * visible.length);
      if (visible.length > 1) {
        let guard = 0;
        while (slotIndex === lastSlot && guard < 6) {
          slotIndex = Math.floor(Math.random() * visible.length);
          guard += 1;
        }
      }
      lastSlot = slotIndex;

      const img = imgRefs.current[slotIndex];
      const nextLogo = pickNext(visible, CLIENT_LOGOS);
      if (!img) {
        schedule();
        return;
      }

      activeTween = gsap.timeline({
        onComplete: () => {
          activeTween = null;
          if (cancelled) return;
          schedule();
        },
      });

      activeTween.to(img, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: "power2.inOut",
      });
      activeTween.add(() => {
        if (cancelled) return;
        img.src = nextLogo.src;
        img.alt = nextLogo.alt;
        visibleRef.current = visible.map((logo, i) =>
          i === slotIndex ? nextLogo : logo,
        );
      });
      activeTween.to(img, {
        opacity: 1,
        duration: FADE_DURATION,
        ease: "power2.inOut",
      });
    };

    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      activeTween?.kill();
      imgRefs.current.forEach((img) => {
        if (img) gsap.killTweensOf(img);
      });
    };
  }, [reducedMotion]);

  const initial = visibleRef.current;

  return (
    <section className="rj-logo-strip" aria-label="Clients and partners">
      <ul className="rj-logo-strip__row">
        {initial.map((logo, index) => (
          <li key={`slot-${index}`} className="rj-logo-strip__item">
            <img
              ref={(el) => {
                imgRefs.current[index] = el;
              }}
              className="rj-logo-strip__logo"
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={28}
              decoding="async"
              loading={index < 4 ? "eager" : "lazy"}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
