import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Challenge = {
  num: string;
  title: string;
  body: string;
  video: string;
};

const CHALLENGES: Challenge[] = [
  {
    num: "01/",
    title: "Conversion Rate optimization (CRO)",
    body: "Systematic improvement of conversion across key product and funnel touchpoints through UX changes grounded in user behavior and data.",
    video: "/challenges/c1.mp4",
  },
  {
    num: "02/",
    title: "Experience-led revenue optimization",
    body: "Revenue growth driven by improving user journeys, decision points, and product experience across conversion, monetization, and retention.",
    video: "/challenges/c2.mp4",
  },
  {
    num: "03/",
    title: "End-to-end product design",
    body: "Holistic design and redesign of products from structure and flows to interaction and visual systems, built for scale and monetization.",
    video: "/challenges/c3.mp4",
  },
  {
    num: "04/",
    title: "Monetization & funnel architecture",
    body: "Design of pricing, trials, paywalls, and funnels as a single monetization system that increases predictability and revenue efficiency.",
    video: "/challenges/c4.mp4",
  },
  {
    num: "05/",
    title: "System-level UX transformation",
    body: "Unification of fragmented UX decisions into a coherent, scalable product experience aligned with business and growth goals.",
    video: "/challenges/c5.mp4",
  },
];

function CropMarks() {
  return (
    <svg
      className="rj-challenges__crop"
      viewBox="0 0 708 386"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 8V8.74206e-08H8M698 0L706 3.4969e-07V8M8 384H0V376M706 376V384H698M132 92L572 292M132 292L572 92"
        stroke="currentColor"
      />
    </svg>
  );
}

/**
 * Framer "Challenges We Solve" — letter-blur headline reveal, stacked rows,
 * crop-mark media with hover video fade (matches witty-quicker Framer motion).
 */
export function ChallengesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    if (!root || !headline) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const chars = headline.querySelectorAll(".rj-challenges__char");
      gsap.set(chars, {
        opacity: 0.001,
        filter: "blur(10px)",
        y: 60,
      });

      gsap.to(chars, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.1,
        stagger: 0.028,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headline,
          start: "top 85%",
          once: true,
        },
      });

      const rows = root.querySelectorAll(".rj-challenges__row");
      rows.forEach((row) => {
        const media = row.querySelector(".rj-challenges__media-video");
        const video = row.querySelector("video");
        const content = row.querySelector(".rj-challenges__content");

        gsap.fromTo(
          content,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              once: true,
            },
          },
        );

        if (media && video instanceof HTMLVideoElement) {
          gsap.set(media, { opacity: 0 });

          const play = () => {
            void video.play().catch(() => undefined);
            gsap.to(media, { opacity: 1, duration: 0.45, ease: "power2.out" });
          };
          const pause = () => {
            gsap.to(media, {
              opacity: 0,
              duration: 0.35,
              ease: "power2.inOut",
              onComplete: () => video.pause(),
            });
          };

          row.addEventListener("mouseenter", play);
          row.addEventListener("mouseleave", pause);
          row.addEventListener("focusin", play);
          row.addEventListener("focusout", pause);
          cleanups.push(() => {
            row.removeEventListener("mouseenter", play);
            row.removeEventListener("mouseleave", pause);
            row.removeEventListener("focusin", play);
            row.removeEventListener("focusout", pause);
          });

          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: play,
            onEnterBack: play,
            onLeave: pause,
            onLeaveBack: pause,
          });
        }
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  const renderHeadline = () => (
    <>
      <span className="rj-challenges__word">
        {"Challenges".split("").map((ch, ci) => (
          <span key={`c-${ci}`} className="rj-challenges__char">
            {ch}
          </span>
        ))}
      </span>
      <br />
      <span className="rj-challenges__word">
        {"We".split("").map((ch, ci) => (
          <span key={`w-${ci}`} className="rj-challenges__char">
            {ch}
          </span>
        ))}
      </span>{" "}
      <span className="rj-challenges__word">
        {"Solve".split("").map((ch, ci) => (
          <span key={`s-${ci}`} className="rj-challenges__char">
            {ch}
          </span>
        ))}
      </span>
    </>
  );

  return (
    <section
      ref={rootRef}
      className="rj-challenges"
      id="solutions"
      aria-label="Challenges We Solve"
    >
      <div className="rj-challenges__headline-wrap">
        <h2 ref={headlineRef} className="rj-challenges__headline">
          {renderHeadline()}
        </h2>
      </div>

      <div className="rj-challenges__list">
        {CHALLENGES.map((item) => (
          <article key={item.num} className="rj-challenges__row" tabIndex={0}>
            <div className="rj-challenges__content">
              <div className="rj-challenges__meta">
                <span className="rj-challenges__num">{item.num}</span>
                <h3 className="rj-challenges__title">{item.title}</h3>
                <p className="rj-challenges__body">{item.body}</p>
              </div>
              <a href="#contact" className="rj-challenges__cta">
                <span>Let&apos;s talk</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <g opacity="0.6">
                    <path d="M5.833 14.165 14.166 5.832" stroke="currentColor" />
                    <path
                      d="M5.833 5.832h8.333v8.333"
                      stroke="currentColor"
                      strokeLinecap="square"
                    />
                  </g>
                </svg>
              </a>
            </div>
            <div className="rj-challenges__media">
              <CropMarks />
              <div className="rj-challenges__media-video">
                <video
                  src={item.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
