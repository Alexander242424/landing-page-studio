import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CLIENT_LOGOS,
  LOGO_STRIP_SEED_IDS,
  type ClientLogo,
} from "@/lib/clientLogos";

gsap.registerPlugin(ScrollTrigger);

const SLOT_COUNT = 8;

/** Match styles.css mobile band — marquee below this, even row at/above. */
const MARQUEE_MQ = "(max-width: 767px)";

/** Crossfade duration (seconds). */
const FADE_DURATION = 0.55;
/** Pause between slot swaps (seconds), plus random jitter. */
const SWAP_BASE = 2.1;
const SWAP_JITTER = 1.4;

type SlotLayer = "a" | "b";

type SlotState = {
  logo: ClientLogo;
  /** Logo currently painted on the idle buffer (may lag one swap). */
  bufferLogo: ClientLogo;
  active: SlotLayer;
};

function logoById(id: string): ClientLogo {
  return CLIENT_LOGOS.find((logo) => logo.id === id) ?? CLIENT_LOGOS[0]!;
}

function pickInitial(): SlotState[] {
  const seeded = LOGO_STRIP_SEED_IDS.map(logoById).slice(0, SLOT_COUNT);
  if (seeded.length < SLOT_COUNT) {
    const used = new Set(seeded.map((logo) => logo.id));
    const fillers = CLIENT_LOGOS.filter((logo) => !used.has(logo.id));
    while (seeded.length < SLOT_COUNT) {
      const next =
        fillers[seeded.length % Math.max(fillers.length, 1)] ??
        CLIENT_LOGOS[seeded.length % CLIENT_LOGOS.length]!;
      seeded.push(next);
      used.add(next.id);
    }
  }
  return seeded.map((logo) => ({
    logo,
    bufferLogo: logo,
    active: "a" as SlotLayer,
  }));
}

/**
 * Prefer a logo not currently visible and not adjacent to the target slot.
 * Never returns empty — falls back to any pool logo if needed.
 */
function pickNext(
  visible: ClientLogo[],
  slotIndex: number,
  pool: ClientLogo[],
): ClientLogo {
  const visibleIds = new Set(visible.map((logo) => logo.id));
  const left = visible[slotIndex - 1]?.id;
  const right = visible[slotIndex + 1]?.id;

  const notVisible = pool.filter((logo) => !visibleIds.has(logo.id));
  const notAdjacent = notVisible.filter(
    (logo) => logo.id !== left && logo.id !== right,
  );

  const bag =
    notAdjacent.length > 0
      ? notAdjacent
      : notVisible.length > 0
        ? notVisible
        : pool.filter((logo) => logo.id !== left && logo.id !== right).length > 0
          ? pool.filter((logo) => logo.id !== left && logo.id !== right)
          : pool;

  return bag[Math.floor(Math.random() * bag.length)] ?? pool[0]!;
}

function preloadLogo(logo: ClientLogo): Promise<ClientLogo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(logo);
    img.onerror = () => reject(new Error(`Failed to load ${logo.src}`));
    img.src = logo.src;
  });
}

async function preloadWithFallback(
  preferred: ClientLogo,
  visible: ClientLogo[],
  slotIndex: number,
  pool: ClientLogo[],
  attempts = 6,
): Promise<ClientLogo> {
  const tried = new Set<string>();
  let candidate: ClientLogo | undefined = preferred;

  for (let i = 0; i < attempts; i += 1) {
    if (!candidate || tried.has(candidate.id)) {
      candidate = pickNext(visible, slotIndex, pool);
    }
    if (tried.has(candidate.id)) break;
    tried.add(candidate.id);
    try {
      await preloadLogo(candidate);
      return candidate;
    } catch {
      candidate = undefined;
    }
  }

  return visible[slotIndex] ?? pool[0]!;
}

async function waitForDecode(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) return;
  try {
    if (typeof img.decode === "function") {
      await img.decode();
      return;
    }
  } catch {
    // fall through to load event
  }
  await new Promise<void>((resolve) => {
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      resolve();
    };
    img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
}

function LogoMarqueeItem({
  logo,
  index,
  duplicate,
}: {
  logo: ClientLogo;
  index: number;
  duplicate?: boolean;
}) {
  return (
    <li
      className="rj-logo-strip__item"
      aria-hidden={duplicate ? true : undefined}
    >
      <span className="rj-logo-strip__slot">
        <img
          className="rj-logo-strip__logo"
          src={logo.src}
          alt={duplicate ? "" : logo.alt}
          width={120}
          height={28}
          decoding="async"
          loading={index < 4 && !duplicate ? "eager" : "lazy"}
          fetchPriority="low"
          draggable={false}
        />
      </span>
    </li>
  );
}

/**
 * Rejouice-style client logo strip: fixed slots on a light band,
 * logos crossfade from a larger pool (staggered, one at a time).
 * Double-buffered so a slot is never blank during swap.
 * On narrow viewports: infinite right→left marquee instead of the even row.
 */
export function LogoStrip() {
  const rootRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<Array<HTMLLIElement | null>>([]);
  const layerRefs = useRef<
    Array<{ a: HTMLImageElement | null; b: HTMLImageElement | null }>
  >([]);
  const [slots, setSlots] = useState<SlotState[]>(() => pickInitial());
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMarquee, setIsMarquee] = useState(false);
  const enteredRef = useRef(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const marqueeMq = window.matchMedia(MARQUEE_MQ);
    const syncMotion = () => setReducedMotion(motionMq.matches);
    const syncMarquee = () => setIsMarquee(marqueeMq.matches);
    syncMotion();
    syncMarquee();
    motionMq.addEventListener("change", syncMotion);
    marqueeMq.addEventListener("change", syncMarquee);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      marqueeMq.removeEventListener("change", syncMarquee);
    };
  }, []);

  // Preload the full pool only once the strip is near the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      CLIENT_LOGOS.forEach((logo) => {
        void preloadLogo(logo).catch(() => undefined);
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        run();
        io.disconnect();
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  // Entrance: stagger fade/slide up when the strip enters the viewport.
  useEffect(() => {
    if (isMarquee) {
      enteredRef.current = true;
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const items = slotRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!items.length) return;

    if (reducedMotion) {
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
      enteredRef.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, y: 18 });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: {
          trigger: root,
          start: "top 92%",
          once: true,
          // Already in view on load — still mark entered so swaps can start.
          onEnter: () => {
            enteredRef.current = true;
          },
        },
        onComplete: () => {
          gsap.set(items, { clearProps: "transform" });
          enteredRef.current = true;
        },
      });
    }, root);

    return () => {
      ctx.revert();
      // After revert, items must stay visible (swap loop may already be running).
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, [reducedMotion, isMarquee]);

  // Crossfade swap loop — desktop only, after entrance (or immediately if reduced motion).
  useEffect(() => {
    if (isMarquee || CLIENT_LOGOS.length <= 1) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastSlot = -1;
    let activeTween: gsap.core.Timeline | null = null;
    let swapping = false;

    const revealActive = (slotIndex: number, active: SlotLayer) => {
      const layers = layerRefs.current[slotIndex];
      if (!layers) return;
      const shown = layers[active];
      const hidden = layers[active === "a" ? "b" : "a"];
      if (shown) {
        gsap.set(shown, { autoAlpha: 1 });
      }
      if (hidden) {
        gsap.set(hidden, { autoAlpha: 0 });
      }
    };

    const schedule = () => {
      if (cancelled || reducedMotion) return;
      const delay = (SWAP_BASE + Math.random() * SWAP_JITTER) * 1000;
      timer = setTimeout(() => {
        void runSwap();
      }, delay);
    };

    const waitForEntrance = () => {
      if (cancelled) return;
      if (reducedMotion || enteredRef.current) {
        schedule();
        return;
      }
      timer = setTimeout(waitForEntrance, 120);
    };

    const runSwap = async () => {
      if (cancelled || swapping || reducedMotion) return;
      swapping = true;

      const currentSlots = slotsRef.current;
      let slotIndex = Math.floor(Math.random() * currentSlots.length);
      if (currentSlots.length > 1) {
        let guard = 0;
        while (slotIndex === lastSlot && guard < 6) {
          slotIndex = Math.floor(Math.random() * currentSlots.length);
          guard += 1;
        }
      }
      lastSlot = slotIndex;

      const layers = layerRefs.current[slotIndex];
      const slot = currentSlots[slotIndex];
      if (!layers || !slot) {
        swapping = false;
        schedule();
        return;
      }

      const visible = currentSlots.map((s) => s.logo);
      const preferred = pickNext(visible, slotIndex, CLIENT_LOGOS);
      const nextLogo = await preloadWithFallback(
        preferred,
        visible,
        slotIndex,
        CLIENT_LOGOS,
      );

      if (cancelled) {
        swapping = false;
        return;
      }

      // Same logo (or failed pool) — skip without blanking.
      if (nextLogo.id === slot.logo.id && nextLogo.src === slot.logo.src) {
        swapping = false;
        schedule();
        return;
      }

      const outgoingLayer = slot.active;
      const incomingLayer: SlotLayer = outgoingLayer === "a" ? "b" : "a";
      const outgoing = layers[outgoingLayer];
      const incoming = layers[incomingLayer];

      if (!outgoing || !incoming) {
        swapping = false;
        schedule();
        return;
      }

      // Paint next mark on the idle buffer via React (keeps src in sync on re-render),
      // then wait for decode before crossfading. Outgoing stays in-flow the whole time.
      const previousLogo = slot.logo;
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, bufferLogo: nextLogo } : s,
        ),
      );

      // Let React commit the new buffer src before decoding.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      await waitForDecode(incoming);

      if (cancelled) {
        swapping = false;
        return;
      }

      // Abort if this slot's active layer changed while we were loading.
      if (slotsRef.current[slotIndex]?.active !== outgoingLayer) {
        swapping = false;
        schedule();
        return;
      }

      gsap.set(outgoing, { autoAlpha: 1 });
      gsap.set(incoming, { autoAlpha: 0 });

      const finish = (committed: boolean) => {
        activeTween = null;
        swapping = false;
        if (cancelled) return;

        if (committed) {
          gsap.set(incoming, { autoAlpha: 1 });
          gsap.set(outgoing, { autoAlpha: 0 });
          // Promote idle → active; park the previous mark on the new idle buffer.
          setSlots((prev) =>
            prev.map((s, i) =>
              i === slotIndex
                ? {
                    logo: nextLogo,
                    bufferLogo: previousLogo,
                    active: incomingLayer,
                  }
                : s,
            ),
          );
        } else {
          // Interrupted — restore previous buffer and keep outgoing visible.
          setSlots((prev) =>
            prev.map((s, i) =>
              i === slotIndex ? { ...s, bufferLogo: previousLogo } : s,
            ),
          );
          revealActive(slotIndex, outgoingLayer);
        }
        schedule();
      };

      activeTween = gsap.timeline({
        onComplete: () => finish(true),
        onInterrupt: () => finish(false),
      });

      activeTween.to(
        incoming,
        {
          autoAlpha: 1,
          duration: FADE_DURATION,
          ease: "power2.inOut",
        },
        0,
      );
      activeTween.to(
        outgoing,
        {
          autoAlpha: 0,
          duration: FADE_DURATION,
          ease: "power2.inOut",
        },
        0,
      );
    };

    waitForEntrance();

    return () => {
      cancelled = true;
      swapping = false;
      if (timer) clearTimeout(timer);
      activeTween?.kill();
      layerRefs.current.forEach((layers) => {
        if (!layers) return;
        if (layers.a) gsap.killTweensOf(layers.a);
        if (layers.b) gsap.killTweensOf(layers.b);
      });
      // Ensure every slot ends visible with its active layer.
      slotsRef.current.forEach((slot, i) => {
        revealActive(i, slot.active);
      });
    };
  }, [reducedMotion, isMarquee]);

  // After React commits which layer is active, clear GSAP leftovers on the
  // in-flow mark so a parent re-render can never leave both layers hidden.
  useEffect(() => {
    slots.forEach((slot, i) => {
      const layers = layerRefs.current[i];
      if (!layers) return;
      const active = layers[slot.active];
      const idle = layers[slot.active === "a" ? "b" : "a"];
      if (active) gsap.set(active, { autoAlpha: 1 });
      if (idle) gsap.set(idle, { autoAlpha: 0 });
    });
  }, [slots]);

  const marqueeLogos = LOGO_STRIP_SEED_IDS.map(logoById);

  return (
    <section
      ref={rootRef}
      className="rj-logo-strip"
      aria-label="Clients and partners"
    >
      {/* Mobile marquee — visibility via CSS (max-width: 767px); both trees avoid hydration flash */}
      <div
        className="rj-logo-strip__viewport"
        aria-hidden={isMarquee ? undefined : true}
      >
        <ul
          className={
            reducedMotion
              ? "rj-logo-strip__track rj-logo-strip__track--static"
              : "rj-logo-strip__track"
          }
        >
          {marqueeLogos.map((logo, index) => (
            <LogoMarqueeItem
              key={`m1-${logo.id}`}
              logo={logo}
              index={index}
            />
          ))}
          {marqueeLogos.map((logo, index) => (
            <LogoMarqueeItem
              key={`m2-${logo.id}`}
              logo={logo}
              index={index}
              duplicate
            />
          ))}
        </ul>
      </div>

      {/* Desktop / tablet even row */}
      <ul
        className="rj-logo-strip__row"
        aria-hidden={isMarquee ? true : undefined}
      >
        {slots.map((slot, index) => {
          const logoA = slot.active === "a" ? slot.logo : slot.bufferLogo;
          const logoB = slot.active === "b" ? slot.logo : slot.bufferLogo;
          const aActive = slot.active === "a";
          const bActive = slot.active === "b";

          return (
            <li
              key={`slot-${index}`}
              ref={(el) => {
                slotRefs.current[index] = el;
              }}
              className="rj-logo-strip__item"
            >
              <span className="rj-logo-strip__slot">
                <img
                  ref={(el) => {
                    if (!layerRefs.current[index]) {
                      layerRefs.current[index] = { a: null, b: null };
                    }
                    layerRefs.current[index]!.a = el;
                  }}
                  className={
                    aActive
                      ? "rj-logo-strip__logo"
                      : "rj-logo-strip__logo rj-logo-strip__logo--idle"
                  }
                  src={logoA.src}
                  alt={aActive ? slot.logo.alt : ""}
                  width={120}
                  height={28}
                  decoding="async"
                  loading={index < 4 ? "eager" : "lazy"}
                  fetchPriority="low"
                  aria-hidden={aActive ? undefined : true}
                  draggable={false}
                  onError={(event) => {
                    const img = event.currentTarget;
                    const fallback =
                      CLIENT_LOGOS.find((logo) => logo.src !== img.src) ??
                      CLIENT_LOGOS[0];
                    if (fallback && img.src !== fallback.src) {
                      img.src = fallback.src;
                      img.alt = fallback.alt;
                    }
                  }}
                />
                <img
                  ref={(el) => {
                    if (!layerRefs.current[index]) {
                      layerRefs.current[index] = { a: null, b: null };
                    }
                    layerRefs.current[index]!.b = el;
                  }}
                  className={
                    bActive
                      ? "rj-logo-strip__logo"
                      : "rj-logo-strip__logo rj-logo-strip__logo--idle"
                  }
                  src={logoB.src}
                  alt={bActive ? slot.logo.alt : ""}
                  width={120}
                  height={28}
                  decoding="async"
                  loading="lazy"
                  aria-hidden={bActive ? undefined : true}
                  draggable={false}
                  onError={(event) => {
                    const img = event.currentTarget;
                    const fallback =
                      CLIENT_LOGOS.find((logo) => logo.src !== img.src) ??
                      CLIENT_LOGOS[0];
                    if (fallback && img.src !== fallback.src) {
                      img.src = fallback.src;
                      img.alt = fallback.alt;
                    }
                  }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
