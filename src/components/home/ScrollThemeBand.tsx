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

function resolveHeroLight(hero: HTMLElement): Band {
  const heroBottom = hero.getBoundingClientRect().bottom;
  if (heroBottom > window.innerHeight * 0.15) return "hero";
  return "light";
}

/**
 * Body bands:
 * - hero (first section): black
 * - mid page (intro / glance): light
 * - approach to #solutions: scrub white → black (same soft ease as theme flip)
 * - past #solutions top: full dark (process+ stay dark)
 * FAQ / blog keep their own theme-light scope.
 *
 * Waits for lazy-mounted #solutions so triggers still arm after Suspense.
 */
export function ScrollThemeBand() {
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
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

    const attach = () => {
      if (cancelled) return;
      const hero = document.getElementById("hero");
      const solutions = document.getElementById("solutions");
      if (!hero || !solutions) {
        raf = requestAnimationFrame(attach);
        return;
      }

      teardown();

      syncHero = () => {
        const darkTop = solutions.getBoundingClientRect().top;
        // While scrubbing / in dark zone, don't override with hero band.
        if (darkTop <= window.innerHeight) {
          if (darkTop <= 0) setBand("dark");
          else setBand("light");
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

      // Scrub page/body from white → black as #solutions rises through the
      // viewport — removes the hard section seam at invent-growth.
      darkScrub = ScrollTrigger.create({
        trigger: solutions,
        start: "top bottom",
        end: "top top",
        scrub: 0.65,
        onUpdate: (self) => {
          setDarkProgress(self.progress);
          if (self.progress >= 0.55) setBand("dark");
          else setBand("light");
        },
        onLeave: () => {
          setDarkProgress(1);
          setBand("dark");
        },
        onLeaveBack: () => {
          setDarkProgress(0);
          setBand(resolveHeroLight(hero));
        },
      });

      window.addEventListener("scroll", syncHero, { passive: true });
      syncHero();
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
  }, []);

  return null;
}
