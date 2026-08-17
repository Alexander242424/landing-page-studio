import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

export type HomeIntroContent = {
  id?: string;
  ariaLabel?: string;
  taglineBefore: string;
  taglineLinkLabel: string;
  taglineLinkHref: string;
  taglineAfter?: string;
  title: string;
  paragraphs: (string | ReactNode)[];
};

const DEFAULT_INTRO: HomeIntroContent = {
  id: "about",
  ariaLabel: "Introduction",
  taglineBefore:
    "A senior product studio for teams that need a partner in the work, not another agency deck.",
  taglineLinkLabel: "Explore our solutions",
  taglineLinkHref: "#solutions",
  taglineAfter: ".",
  title: "Your growth starts here.",
  paragraphs: [
    "Since 2014 we have worked with product teams at every stage, from early funded startups to brands already in market.",
    <>
      We also build products of our own.{" "}
      <a
        href="https://getboostra.com"
        target="_blank"
        rel="noopener noreferrer"
        className="rj-link-active-full"
      >
        Boostra
      </a>
      ,{" "}
      <a
        href="https://grono.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="rj-link-active-full"
      >
        Grono
      </a>
      , and{" "}
      <a
        href="https://tapmy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="rj-link-active-full"
      >
        Tapmy
      </a>
      , tools shaped by the same product thinking we bring to every engagement.
    </>,
  ],
};

/**
 * Rejouice post-reel intro: word-reveal tagline + key-value row with split reveal.
 */
export function HomeIntro({
  content,
}: {
  content?: HomeIntroContent;
} = {}) {
  const intro = content ?? DEFAULT_INTRO;
  const { lenis } = useSmoothScroll();
  const rootRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyTextRef = useRef<HTMLDivElement>(null);

  const scrollToHref = (href: string) => {
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = intro.taglineLinkHref;
    if (!href.startsWith("#")) return;
    event.preventDefault();
    scrollToHref(href);
  };

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
      id={intro.id ?? "about"}
      aria-label={intro.ariaLabel ?? "Introduction"}
    >
      <div className="rj-intro__tagline">
        <div className="rj-intro__tagline-inner">
          <div className="rj-intro__space" aria-hidden="true" />
          <div className="rj-intro__content">
            <p ref={taglineRef}>
              {intro.taglineBefore}{" "}
              <a
                href={intro.taglineLinkHref}
                className="rj-link-active-full"
                onClick={onLinkClick}
              >
                {intro.taglineLinkLabel}
              </a>
              {intro.taglineAfter ?? ""}
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
                {intro.title}
              </h2>
            </div>
            <div className="rj-intro__body">
              <div className="rj-intro__body-inner">
                <div ref={bodyTextRef} className="rj-text-reveal">
                  {intro.paragraphs.map((paragraph, index) => (
                    <p key={index}>
                      {index > 0 ? <br /> : null}
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
