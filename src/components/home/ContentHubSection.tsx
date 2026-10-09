import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock } from "lucide-react";
import { ArrowCue } from "@/components/ui/ArrowLink";
import { createAwardsCharReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type HubCard = {
  title: string;
  description: readonly [string, string];
  status: "free" | "soon";
  statusLabel: string;
  previewSrc: string;
  previewAlt: string;
  href?: string;
  route?: boolean;
  locked?: boolean;
  anchorId?: string;
  fan: "left" | "center" | "right";
};

const CARDS: HubCard[] = [
  {
    title: "CRO playbooks",
    description: [
      "Conversion playbooks, tests, and growth",
      "notes from the UXLAB team.",
    ],
    status: "free",
    statusLabel: "Free",
    previewSrc: "/challenges/testing-experimentation.jpg",
    previewAlt: "Abstract preview of experimentation and testing workflows",
    href: "/resources",
    route: true,
    fan: "left",
  },
  {
    title: "Toolverse",
    description: [
      "A curated directory of tools we use",
      "for research, design, and experimentation.",
    ],
    status: "free",
    statusLabel: "Free",
    previewSrc: "/challenges/ai-engineering.jpg",
    previewAlt: "Abstract preview of tools and integrations",
    href: "/resources",
    route: true,
    anchorId: "toolverse",
    fan: "center",
  },
  {
    title: "UXLAB Academy",
    description: [
      "Paid program on diagnosing leaks and",
      "shipping revenue-winning UX.",
    ],
    status: "soon",
    statusLabel: "Coming soon",
    previewSrc: "/challenges/product-metrics.jpg",
    previewAlt: "",
    locked: true,
    fan: "right",
  },
];

function HubCardSurface({ card }: { card: HubCard }) {
  const body = (
    <>
      <div
        className={cn(
          "rj-content-hub__preview",
          card.locked && "rj-content-hub__preview--locked",
        )}
      >
        <img
          src={card.previewSrc}
          alt={card.previewAlt}
          width={640}
          height={400}
          decoding="async"
          loading="lazy"
          draggable={false}
          className="rj-content-hub__preview-img"
        />
        {card.locked ? (
          <span className="rj-content-hub__lock" aria-hidden="true">
            <Lock strokeWidth={1.5} />
          </span>
        ) : null}
        <span
          className={cn(
            "rj-content-hub__status",
            card.status === "soon" && "rj-content-hub__status--soon",
          )}
        >
          {card.statusLabel}
        </span>
        <div className="rj-content-hub__card-body">
          <div className="rj-content-hub__card-copy">
            <h3 className="rj-content-hub__card-title">{card.title}</h3>
            <p className="rj-content-hub__card-desc">
              {card.description[0]}
              <br />
              {card.description[1]}
            </p>
          </div>
          <span className="rj-content-hub__card-arrow" aria-hidden="true">
            <ArrowCue />
          </span>
        </div>
      </div>
    </>
  );

  const fanClass = `rj-content-hub__card--${card.fan}`;
  const interactive = Boolean(card.href) && !card.locked;

  if (!interactive) {
    return (
      <article
        id={card.anchorId}
        className={cn("rj-content-hub__card", fanClass, "rj-content-hub__card--static")}
      >
        {body}
      </article>
    );
  }

  const className = cn("rj-content-hub__card", fanClass, "rj-content-hub__card--link");

  if (card.route && card.href) {
    return (
      <article id={card.anchorId} className={className}>
        <Link to={card.href} viewTransition className="rj-content-hub__card-link">
          {body}
        </Link>
      </article>
    );
  }

  return (
    <article id={card.anchorId} className={className}>
      <a href={card.href} className="rj-content-hub__card-link">
        {body}
      </a>
    </article>
  );
}

/**
 * Homepage knowledge hub — three fanned resource cards (Workflows LEARN layout, UXLAB tokens).
 * Reuses `#process` for header “Workflows” nav; `#toolverse` on the tools card.
 */
export function ContentHubSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    const cards = cardsRef.current;
    if (!root || !headline || !cards) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(headline, {
          start: "top 85%",
        }),
      );

      const items = cards.querySelectorAll(".rj-content-hub__card");
      gsap.fromTo(
        items,
        { opacity: 0, y: 48, rotate: 0 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="process"
      className="rj-content-hub theme-light"
      aria-label="Knowledge hub"
    >
      <div className="rj-content-hub__headline-wrap">
        <h2
          ref={headlineRef}
          className="rj-content-hub__headline rj-awards-title"
          aria-label="We share our expertise."
        >
          <span className="rj-hero__line">We share</span>
          <span className="rj-hero__line">our expertise.</span>
        </h2>
      </div>

      <div ref={cardsRef} className="rj-content-hub__cards">
        {CARDS.map((card) => (
          <HubCardSurface key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}
