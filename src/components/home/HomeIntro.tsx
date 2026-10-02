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
  taglineSecondLinkLabel?: string;
  taglineSecondLinkHref?: string;
  title: string;
  paragraphs: (string | ReactNode)[];
};

const DEFAULT_INTRO: HomeIntroContent = {
  id: "about",
  ariaLabel: "Results",
  taglineBefore:
    "Better products, higher conversion and real revenue growth for the teams we work with. Across mobile apps, SaaS, e-commerce and web funnels.",
  taglineLinkLabel: "",
  taglineLinkHref: "#glance",
  taglineAfter: "",
  taglineSecondLinkLabel: undefined,
  taglineSecondLinkHref: undefined,
  title: "Our results speak for themselves.",
  paragraphs: [],
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

  const onAnchorClick =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
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
              {intro.taglineBefore}
              {intro.taglineLinkLabel ? (
                <>
                  {" "}
                  <a
                    href={intro.taglineLinkHref}
                    className="rj-link-active-full"
                    onClick={onAnchorClick(intro.taglineLinkHref)}
                  >
                    {intro.taglineLinkLabel}
                  </a>
                  {intro.taglineAfter ?? ""}
                </>
              ) : null}
              {intro.taglineSecondLinkLabel && intro.taglineSecondLinkHref ? (
                <a
                  href={intro.taglineSecondLinkHref}
                  className="rj-link-active-full"
                  onClick={onAnchorClick(intro.taglineSecondLinkHref)}
                >
                  {intro.taglineSecondLinkLabel}
                </a>
              ) : null}
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
