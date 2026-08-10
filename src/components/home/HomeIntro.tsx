import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rejouice post-reel intro: large tagline + key-value row with split reveal.
 * Play Reel lives on the hero video, not this section.
 */
export function HomeIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const tagline = taglineRef.current;
    const split = splitRef.current;
    const title = titleRef.current;
    const body = bodyRef.current;
    if (!root || !tagline || !split || !title || !body) return;

    const ctx = gsap.context(() => {
      gsap.set([tagline, title, body], { autoAlpha: 0 });

      gsap.to(tagline, {
        autoAlpha: 1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: tagline,
          start: "top 97%",
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: split,
        start: "top 90%",
        once: true,
        onEnter: () => split.classList.add("is-shown"),
      });

      gsap.to([title, body], {
        autoAlpha: 1,
        duration: 1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: {
          trigger: title,
          start: "top 92%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
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
          <div ref={taglineRef} className="rj-intro__content">
            <p>
              We turn founders&apos; visions into remarkable brands by combining
              strategy, design, and performance marketing, all under one roof.
              Explore{" "}
              <a href="#services" className="rj-link-active-full">
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
              <h2 ref={titleRef}>Tomorrow&apos;s brands, today.</h2>
            </div>
            <div className="rj-intro__body">
              <div ref={bodyRef} className="rj-intro__body-inner">
                <div>
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
                <ArrowLink href="#services" underlined>
                  Learn more
                </ArrowLink>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
