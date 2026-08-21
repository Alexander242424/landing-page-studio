import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CLIENT_LOGOS,
  LOGO_STRIP_SEED_IDS,
  type ClientLogo,
} from "@/lib/clientLogos";

gsap.registerPlugin(ScrollTrigger);

const SLOT_COUNT = 10;

/** Match styles.css mobile band — marquee below this, even row at/above. */
const MARQUEE_MQ = "(max-width: 767px)";

/** ~px reserved for one hero mark (logo + padding). */
const HERO_SLOT_PX = 118;

/** Hero row: fill the bar as it widens — never leave a 3-logo hole on desktop. */
function heroVisibleCount(availablePx: number): number {
  if (availablePx < 280) return 2;
  if (availablePx < 400) return 3;
  return Math.max(3, Math.min(SLOT_COUNT, Math.floor(availablePx / HERO_SLOT_PX)));
}

/** Crossfade duration (seconds). */
const FADE_DURATION = 0.55;
/** Pause between slot swaps (seconds), plus random jitter. */
const SWAP_BASE = 2.1;
const SWAP_JITTER = 1.4;
/** Watchdog: force any blank active layer back to visible. */
const WATCHDOG_MS = 900;

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

/** Opacity only — never visibility:hidden (avoids blank in-flow slots). */
function showLayer(el: HTMLElement | null) {
  if (!el) return;
  gsap.killTweensOf(el);
  gsap.set(el, { opacity: 1, visibility: "visible" });
}

function hideLayer(el: HTMLElement | null) {
  if (!el) return;
  gsap.killTweensOf(el);
  gsap.set(el, { opacity: 0, visibility: "visible" });
}

function forceSlotVisible(
  layers: { a: HTMLImageElement | null; b: HTMLImageElement | null } | undefined,
  active: SlotLayer,
) {
  if (!layers) return;
  showLayer(layers[active]);
  hideLayer(layers[active === "a" ? "b" : "a"]);
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
 * Client logo strip: fixed slots with staggered crossfade from a larger pool.
 * Double-buffered so a slot is never blank during swap.
 * On narrow viewports: infinite right→left marquee instead of the even row.
 *
 * Variants:
 * - `band` — standalone light section (legacy / reusable)
 * - `hero` — AngelList-style bar in the dark hero (desktop: random slot crossfade)
 */
export function LogoStrip({ variant = "band" }: { variant?: "band" | "hero" }) {
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
  const [visibleCount, setVisibleCount] = useState(SLOT_COUNT);
  const visibleCountRef = useRef(SLOT_COUNT);
  const enteredRef = useRef(false);
  const isHero = variant === "hero";

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const marqueeMq = window.matchMedia(MARQUEE_MQ);
    const syncMotion = () => setReducedMotion(motionMq.matches);
    const syncMarquee = () => setIsMarquee(marqueeMq.matches);
    const measureAvailable = () => {
      const strip = rootRef.current;
      if (strip && strip.clientWidth > 0) return strip.clientWidth;
      return Math.round(window.innerWidth * 0.5);
    };
    const syncVisible = () => {
      const next = isHero ? heroVisibleCount(measureAvailable()) : SLOT_COUNT;
      visibleCountRef.current = next;
      setVisibleCount(next);
    };
    syncMotion();
    syncMarquee();
    syncVisible();
    motionMq.addEventListener("change", syncMotion);
    marqueeMq.addEventListener("change", syncMarquee);
    window.addEventListener("resize", syncVisible);
    const strip = rootRef.current;
    const ro =
      strip && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncVisible)
        : null;
    if (strip && ro) ro.observe(strip);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      marqueeMq.removeEventListener("change", syncMarquee);
      window.removeEventListener("resize", syncVisible);
      ro?.disconnect();
    };
  }, [isHero]);

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

  // Entrance: stagger fade/slide up — opacity + transform only (never autoAlpha).
  // Hero: bar fades in with CTAs; slots start visible so the swap loop can run.
  useEffect(() => {
    if (isHero) {
      enteredRef.current = true;
      const items = slotRefs.current.filter(Boolean) as HTMLLIElement[];
      if (items.length) {
        gsap.set(items, {
          opacity: 1,
          visibility: "visible",
          clearProps: "transform",
        });
      }
      return;
    }

    if (isMarquee) {
      enteredRef.current = true;
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const items = slotRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!items.length) return;

    const forceItemsVisible = () => {
      gsap.set(items, {
        opacity: 1,
        visibility: "visible",
        clearProps: "transform",
      });
    };

    if (reducedMotion) {
      forceItemsVisible();
      enteredRef.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, visibility: "visible", y: 18 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: {
          trigger: root,
          start: "top 92%",
          once: true,
          onEnter: () => {
            enteredRef.current = true;
          },
        },
        onComplete: () => {
          forceItemsVisible();
          enteredRef.current = true;
        },
        onInterrupt: () => {
          forceItemsVisible();
          enteredRef.current = true;
        },
      });
    }, root);

    return () => {
      ctx.revert();
      // After revert, items must stay visible (swap loop may already be running).
      forceItemsVisible();
    };
  }, [reducedMotion, isMarquee, isHero, visibleCount]);

  // Crossfade swap loop — random slot replaces its mark (band + desktop hero).
  useEffect(() => {
    // Mobile hero uses marquee; skip swap there.
    if (isMarquee || CLIENT_LOGOS.length <= 1) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setInterval> | undefined;
    let lastSlot = -1;
    let activeTween: gsap.core.Timeline | null = null;
    let swapping = false;

    const assertAllSlotsVisible = () => {
      const count = visibleCountRef.current;
      slotsRef.current.slice(0, count).forEach((slot, i) => {
        const item = slotRefs.current[i];
        if (
          item &&
          (Number(gsap.getProperty(item, "opacity")) < 0.95 ||
            getComputedStyle(item).visibility === "hidden")
        ) {
          gsap.set(item, {
            opacity: 1,
            visibility: "visible",
            clearProps: "transform",
          });
        }

        const layers = layerRefs.current[i];
        if (!layers) return;
        const shown = layers[slot.active];
        // If the active in-flow layer is blank, force it back — never leave a hole.
        if (
          shown &&
          (Number(gsap.getProperty(shown, "opacity")) < 0.95 ||
            getComputedStyle(shown).visibility === "hidden")
        ) {
          forceSlotVisible(layers, slot.active);
        }
      });
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
      const activeCount = Math.min(
        visibleCountRef.current,
        currentSlots.length,
      );
      if (activeCount < 1) {
        swapping = false;
        schedule();
        return;
      }
      let slotIndex = Math.floor(Math.random() * activeCount);
      if (activeCount > 1) {
        let guard = 0;
        while (slotIndex === lastSlot && guard < 6) {
          slotIndex = Math.floor(Math.random() * activeCount);
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

      // Guarantee the current mark stays fully visible before any buffer work.
      forceSlotVisible(layers, slot.active);

      const visible = currentSlots.slice(0, activeCount).map((s) => s.logo);
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
        forceSlotVisible(layers, outgoingLayer);
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
        forceSlotVisible(layers, slotsRef.current[slotIndex]?.active ?? outgoingLayer);
        swapping = false;
        schedule();
        return;
      }

      showLayer(outgoing);
      hideLayer(incoming);

      const finish = (committed: boolean) => {
        activeTween = null;
        swapping = false;
        if (cancelled) return;

        if (committed) {
          showLayer(incoming);
          hideLayer(outgoing);
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
          // Post-swap assert after React className flip.
          requestAnimationFrame(() => {
            forceSlotVisible(layerRefs.current[slotIndex], incomingLayer);
          });
        } else {
          // Interrupted — restore previous buffer and keep outgoing visible.
          setSlots((prev) =>
            prev.map((s, i) =>
              i === slotIndex ? { ...s, bufferLogo: previousLogo } : s,
            ),
          );
          forceSlotVisible(layers, outgoingLayer);
        }
        schedule();
      };

      activeTween = gsap.timeline({
        onComplete: () => finish(true),
        onInterrupt: () => finish(false),
      });

      // Overlapping opacity crossfade — both layers stay visibility:visible.
      activeTween.to(
        incoming,
        {
          opacity: 1,
          duration: FADE_DURATION,
          ease: "power2.inOut",
        },
        0,
      );
      activeTween.to(
        outgoing,
        {
          opacity: 0,
          duration: FADE_DURATION,
          ease: "power2.inOut",
        },
        0,
      );
    };

    waitForEntrance();
    watchdog = setInterval(assertAllSlotsVisible, WATCHDOG_MS);

    return () => {
      cancelled = true;
      swapping = false;
      if (timer) clearTimeout(timer);
      if (watchdog) clearInterval(watchdog);
      activeTween?.kill();
      layerRefs.current.forEach((layers) => {
        if (!layers) return;
        if (layers.a) gsap.killTweensOf(layers.a);
        if (layers.b) gsap.killTweensOf(layers.b);
      });
      // Ensure every slot ends visible with its active layer.
      slotsRef.current.forEach((slot, i) => {
        forceSlotVisible(layerRefs.current[i], slot.active);
      });
      // Also force every slot <li> visible after entrance interrupt.
      const items = slotRefs.current.filter(Boolean) as HTMLLIElement[];
      if (items.length) {
        gsap.set(items, {
          opacity: 1,
          visibility: "visible",
          clearProps: "transform",
        });
      }
    };
  }, [reducedMotion, isMarquee, isHero]);

  // After React commits which layer is active, clear GSAP leftovers on the
  // in-flow mark so a parent re-render can never leave both layers hidden.
  useEffect(() => {
    slots.forEach((slot, i) => {
      forceSlotVisible(layerRefs.current[i], slot.active);
    });
  }, [slots]);

  const marqueeLogos = LOGO_STRIP_SEED_IDS.map(logoById);

  return (
    <section
      ref={rootRef}
      className={
        isHero ? "rj-logo-strip rj-logo-strip--hero" : "rj-logo-strip"
      }
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
        {slots.slice(0, visibleCount).map((slot, index) => {
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
