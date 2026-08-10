import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rejouice post-reel intro: word-reveal tagline + key-value row with split reveal.
 */
export function HomeIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const tagline = taglineRef.current;
    const split = splitRef.current;
    const title = titleRef.current;
    const bodyText = bodyTextRef.current;
    if (!root || !tagline || !split || !title || !bodyText) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createTextReveal(tagline, {
          trigger: tagline.closest(".rj-intro__content") ?? tagline,
          animateLinkScale: true,
        }),
      );

      cleanups.push(
        createTextReveal(title, {
          start: "top 92%",
        }),
      );

      cleanups.push(
        createTextReveal(bodyText, {
          start: "top 92%",
        }),
      );

      ScrollTrigger.create({
        trigger: split,
        start: "top 90%",
        once: true,
        onEnter: () => split.classList.add("is-shown"),
      });
    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="rj-intro"
      id="about"
      aria-label="Introduction"
    >
      <div className="rj-intro__tagline">
        <div className="rj-intro__tagline-inner">
          <div className="rj-intro__space" aria-hidden="true" />
          <div className="rj-intro__content">
            <p ref={taglineRef}>
              We help teams drive growth through product performance, UX,
              conversion, activations, and LTV lifts that compound. Explore{" "}
              <a href="#solutions" className="rj-link-active-full">
                our services
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="rj-intro__key-value">
        <ul className="rj-intro__list">
          <li className="rj-intro__item">
            <div ref={splitRef} className="rj-split" />
            <div className="rj-intro__title">
              <h2 ref={titleRef} className="rj-text-reveal">
                Your growth starts here.
              </h2>
            </div>
            <div className="rj-intro__body">
              <div className="rj-intro__body-inner">
                <div ref={bodyTextRef} className="rj-text-reveal">
                  <p>
                    Since 2013, we have been recognized globally for helping
                    founders build market-defining brands.
                  </p>
                  <p>
                    <br />
                    We partner with five clients a year to give each one the
                    focus and care they deserve.
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
