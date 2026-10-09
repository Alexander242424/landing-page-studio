import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Band = "hero" | "light" | "dark";

const HERO_CLASS = "rj-scroll-hero";
const LIGHT_CLASS = "rj-scroll-light";
const DARK_CLASS = "rj-scroll-dark";

function setBand(band: Band) {
  document.body.classList.toggle(HERO_CLASS, band === "hero");
  document.body.classList.toggle(LIGHT_CLASS, band === "light");
  document.body.classList.toggle(DARK_CLASS, band === "dark");

  const page = document.querySelector(".rj-page");
  if (!page) return;
  // Page theme flips only for the solutions+ dark band; hero keeps light
  // tokens so mid-page sections don't inherit dark prematurely.
  page.classList.toggle("theme-dark", band === "dark");
  page.classList.toggle("theme-light", band !== "dark");
}

function setDarkProgress(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  document.documentElement.style.setProperty("--rj-dark-progress", t.toFixed(4));
}

function topBlackHold(): HTMLElement | null {
  return document.getElementById("customers");
}

function resolveHeroLight(hero: HTMLElement): Band {
  const hold = topBlackHold() ?? hero;
  if (hold.getBoundingClientRect().bottom > window.innerHeight * 0.15) {
    return "hero";
  }
  return "light";
}

/**
 * Body bands:
 * - hero + customers: black (no white jump after the reel)
 * - approach to dark trigger: latch dark (opening is already black)
 * - past dark trigger top: full dark (process+ stay dark)
 * FAQ / blog keep their own theme-light scope.
 *
 * Waits for lazy-mounted dark trigger so triggers still arm after Suspense.
 * Pass `darkTriggerId={null}` to skip the dark scrub (hero ↔ light only).
 */
export function ScrollThemeBand({
  darkTriggerId = "solutions",
}: {
  darkTriggerId?: string | null;
} = {}) {
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let attempts = 0;
    let heroTrigger: ScrollTrigger | null = null;
    let darkScrub: ScrollTrigger | null = null;
    let syncHero: (() => void) | null = null;

    const teardown = () => {
      heroTrigger?.kill();
      darkScrub?.kill();
      heroTrigger = null;
      darkScrub = null;
      if (syncHero) {
        window.removeEventListener("scroll", syncHero);
        syncHero = null;
      }
    };

    const attachHeroOnly = (hero: HTMLElement) => {
      teardown();
      setDarkProgress(0);
      syncHero = () => setBand(resolveHeroLight(hero));
      heroTrigger = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom 15%",
        onEnter: syncHero,
        onLeave: syncHero,
        onEnterBack: syncHero,
        onLeaveBack: syncHero,
      });
      window.addEventListener("scroll", syncHero, { passive: true });
      syncHero();
      ScrollTrigger.refresh();
    };

    const attach = () => {
      if (cancelled) return;
      const hero = document.getElementById("hero");
      if (!hero) {
        raf = requestAnimationFrame(attach);
        return;
      }

      if (!darkTriggerId) {
        attachHeroOnly(hero);
        return;
      }

      const solutions = document.getElementById(darkTriggerId);
      if (!solutions) {
        if (attempts++ < 90) {
          raf = requestAnimationFrame(attach);
          return;
        }
        attachHeroOnly(hero);
        return;
      }

      teardown();

      // Only owns the zone ABOVE the solutions scrub. While #solutions is in
      // (or above) the viewport, darkScrub alone drives band + progress —
      // otherwise syncHero forced "light" and left a charcoal mix on screen.
      syncHero = () => {
        const darkTop = solutions.getBoundingClientRect().top;
        if (darkTop <= window.innerHeight) return;
        const hold = topBlackHold() ?? hero;
        const holdBottom = hold.getBoundingClientRect().bottom;
        const heroBottom = hero.getBoundingClientRect().bottom;
        // Customers block stays black; don't drop to a white page behind it.
        if (holdBottom > window.innerHeight * 0.15) {
          setDarkProgress(
            heroBottom > window.innerHeight * 0.15 ? 0 : 1,
          );
          setBand("hero");
          return;
        }
        setDarkProgress(0);
        setBand(resolveHeroLight(hero));
      };

      heroTrigger = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom 15%",
        onEnter: syncHero,
        onLeave: syncHero,
        onEnterBack: syncHero,
        onLeaveBack: syncHero,
      });

      // Finish at full black before the section top hits the viewport top,
      // so the title band never sits on a stuck charcoal mix.
      darkScrub = ScrollTrigger.create({
        trigger: solutions,
        start: "top bottom",
        end: "top 18%",
        scrub: true,
        onUpdate: (self) => {
          const hold = topBlackHold();
          const openingBlack =
            hold != null &&
            hold.getBoundingClientRect().bottom > window.innerHeight * 0.15;
          // Opening run is already black — don't scrub through white.
          const progress = openingBlack ? 1 : self.progress;
          setDarkProgress(progress);
          if (progress >= 0.45) setBand("dark");
          else setBand("light");
        },
        onLeave: () => {
          setDarkProgress(1);
          setBand("dark");
        },
        onEnterBack: () => {
          // Re-enter scrub from below — onUpdate will resume.
        },
        onLeaveBack: () => {
          const hold = topBlackHold() ?? hero;
          const openingBlack =
            hold.getBoundingClientRect().bottom > window.innerHeight * 0.15;
          setDarkProgress(openingBlack ? 1 : 0);
          setBand(resolveHeroLight(hero));
        },
      });

      window.addEventListener("scroll", syncHero, { passive: true });
      syncHero();
      // Snap current state if we mounted mid-page
      if (darkScrub.progress > 0) {
        setDarkProgress(darkScrub.progress);
        if (darkScrub.progress >= 0.45) setBand("dark");
      }
      ScrollTrigger.refresh();
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      teardown();
      setDarkProgress(0);
      setBand("hero");
    };
  }, [darkTriggerId]);

  return null;
}
