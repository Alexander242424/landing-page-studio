import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BODY_CLASS = "rj-scroll-dark";

function setScrollDark(on: boolean) {
  document.body.classList.toggle(BODY_CLASS, on);

  const page = document.querySelector(".rj-page");
  if (!page) return;
  page.classList.toggle("theme-dark", on);
  page.classList.toggle("theme-light", !on);
}

/**
 * From #process downward the page flips to dark via body / .rj-page theme
 * classes. FAQ keeps its own theme-light scope.
 */
export function ScrollThemeBand() {
  useEffect(() => {
    const process = document.getElementById("process");
    if (!process) return;

    const trigger = ScrollTrigger.create({
      trigger: process,
      start: "top 55%",
      onEnter: () => setScrollDark(true),
      onLeaveBack: () => setScrollDark(false),
    });

    // Sync in case we land mid-page (hash / refresh)
    const sync = () => {
      const top = process.getBoundingClientRect().top;
      setScrollDark(top <= window.innerHeight * 0.55);
    };
    sync();

    return () => {
      trigger.kill();
      setScrollDark(false);
    };
  }, []);

  return null;
}
