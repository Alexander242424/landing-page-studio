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
  // Page theme flips only for the process+ dark band; hero keeps light
  // tokens so mid-page sections don't inherit dark prematurely.
  page.classList.toggle("theme-dark", band === "dark");
  page.classList.toggle("theme-light", band !== "dark");
}

function resolveBand(hero: HTMLElement, process: HTMLElement): Band {
  const processTop = process.getBoundingClientRect().top;
  if (processTop <= window.innerHeight * 0.55) return "dark";

  const heroBottom = hero.getBoundingClientRect().bottom;
  // Still in the first section while any of the hero covers the viewport.
  if (heroBottom > window.innerHeight * 0.15) return "hero";

  return "light";
}

/**
 * Body bands:
 * - hero (first section): black
 * - mid page: light
 * - #process downward: dark (also flips .rj-page theme)
 * FAQ / blog keep their own theme-light scope.
 */
export function ScrollThemeBand() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    const process = document.getElementById("process");
    if (!hero || !process) return;

    const sync = () => setBand(resolveBand(hero, process));

    const heroTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom 15%",
      onEnter: sync,
      onLeave: sync,
      onEnterBack: sync,
      onLeaveBack: sync,
    });

    const processTrigger = ScrollTrigger.create({
      trigger: process,
      start: "top 55%",
      onEnter: sync,
      onLeaveBack: sync,
    });

    sync();

    return () => {
      heroTrigger.kill();
      processTrigger.kill();
      setBand("hero");
    };
  }, []);

  return null;
}
