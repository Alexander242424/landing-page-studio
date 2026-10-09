import { type MouseEvent } from "react";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";

export type HomeIntroContent = {
  id?: string;
  ariaLabel?: string;
  taglineBefore: string;
  /** Optional second paragraph (homepage customers lead). */
  taglineSecond?: string;
  taglineLinkLabel: string;
  taglineLinkHref: string;
  taglineAfter?: string;
  taglineSecondLinkLabel?: string;
  taglineSecondLinkHref?: string;
};

export const DEFAULT_HOME_INTRO: HomeIntroContent = {
  id: "about",
  ariaLabel: "Results",
  taglineBefore:
    "We read user behaviour, find where your mobile app, SaaS, store or funnel loses money, and ship the fix that wins it back. Tested. Live. Paying for itself.",
  taglineLinkLabel: "",
  taglineLinkHref: "#glance",
  taglineAfter: "",
  taglineSecondLinkLabel: undefined,
  taglineSecondLinkHref: undefined,
};

/** Post-hero value-prop tagline (service landings). Homepage copy lives in CustomersSection. */
export function HomeIntro({
  content,
}: {
  content?: HomeIntroContent;
} = {}) {
  const intro = content ?? DEFAULT_HOME_INTRO;
  const { lenis } = useSmoothScroll();

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

  return (
    <section
      className="rj-intro theme-dark"
      id={intro.id ?? "about"}
      aria-label={intro.ariaLabel ?? "Introduction"}
    >
      <div className="rj-intro__tagline">
        <div className="rj-intro__tagline-inner">
          <div className="rj-intro__space" aria-hidden="true" />
          <div className="rj-intro__content rj-intro__content--static">
            <p>
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
    </section>
  );
}
