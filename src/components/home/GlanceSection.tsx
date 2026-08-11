import {
  useEffect,
  useRef,
  type MouseEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LazyVideo } from "@/components/media/LazyVideo";
import { ArrowCue } from "@/components/ui/ArrowLink";
import {
  getCase,
  type CaseHeadline,
} from "@/lib/cases";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const DRAG_CLICK_THRESHOLD = 8;

type WidgetSize = "small" | "medium" | "full";
type WidgetTheme = "dark" | "light";

type GlanceWidget = {
  id: string;
  /** Case study slug for `/work/$slug` (rivian-still → rivian). */
  caseSlug: string;
  size: WidgetSize;
  theme: WidgetTheme;
  title: ReactNode;
  /** Brand mark bottom-right. */
  logo: string;
  /**
   * Native logo ink. White/"light" assets invert on light cards;
   * black/"dark" assets stay as-is on light cards.
   */
  logoInk?: "light" | "dark";
  backgroundImage?: string;
  backgroundVideo?: string;
  linkLabel?: string;
};

function glanceHeadline(headline: CaseHeadline): ReactNode {
  return (
    <p>
      {headline.line}
      <br />
      <em>{headline.emphasis}</em>
    </p>
  );
}

function caseHeadlineTitle(slug: string): ReactNode {
  const study = getCase(slug);
  if (!study) return null;
  return glanceHeadline(study.headline);
}

/** Heights alternate — no two neighbors share the same size (incl. loop seam). */
const CASES: GlanceWidget[] = [
  {
    id: "rivian",
    caseSlug: "rivian",
    size: "medium",
    theme: "dark",
    title: caseHeadlineTitle("rivian"),
    logo: "/glance/rivian.svg",
    logoInk: "light",
    backgroundImage: "/glance/rivian-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "oura",
    caseSlug: "oura",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("oura"),
    logo: "/glance/oura.svg",
    logoInk: "light",
    backgroundImage: "/glance/oura-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "tensr",
    caseSlug: "tensr",
    size: "small",
    theme: "dark",
    title: caseHeadlineTitle("tensr"),
    logo: "/glance/tensr.svg",
    logoInk: "light",
    backgroundImage: "/glance/tensr-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "moxion",
    caseSlug: "moxion",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("moxion"),
    logo: "/glance/moxion.svg",
    logoInk: "light",
    backgroundImage: "/glance/moxion-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "hyperframe",
    caseSlug: "hyperframe",
    size: "small",
    theme: "dark",
    title: caseHeadlineTitle("hyperframe"),
    logo: "/glance/hyperframe.svg",
    logoInk: "light",
    backgroundImage: "/glance/hyperframe-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "rivian-still",
    caseSlug: "rivian",
    size: "medium",
    theme: "dark",
    // Alternate card — intentionally not the primary case headline.
    title: glanceHeadline({
      line: "Market-defining launch",
      emphasis: "strategy, design, performance.",
    }),
    logo: "/glance/rivian.svg",
    logoInk: "light",
    backgroundImage: "/glance/rivian-still-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "noovo",
    caseSlug: "noovo",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("noovo"),
    logo: "/glance/noovo.svg",
    logoInk: "dark",
    backgroundImage: "/glance/noovo-metalab.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "rappi",
    caseSlug: "rappi",
    size: "small",
    theme: "dark",
    title: caseHeadlineTitle("rappi"),
    logo: "/glance/rappi.svg",
    logoInk: "light",
    backgroundImage: "/glance/rappi-metalab.jpg",
    linkLabel: "Case Study",
  },
];

function LogoMark({ src }: { src: string }) {
  return (
    <div className="rj-glance__logos">
      <div className="rj-glance__logo is-active">
        <img
          src={src}
          alt=""
          width={96}
          height={28}
          decoding="async"
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}

function WidgetCard({
  widget,
  suppressNavRef,
}: {
  widget: GlanceWidget;
  suppressNavRef: MutableRefObject<boolean>;
}) {
  const label = widget.linkLabel ?? "Case Study";

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (suppressNavRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Link
      to="/work/$slug"
      params={{ slug: widget.caseSlug }}
      viewTransition
      className={cn(
        "rj-glance__widget",
        `rj-glance__widget--${widget.size}`,
        `rj-glance__widget--${widget.theme}`,
      )}
      aria-label={`${widget.caseSlug} case study`}
      onClick={onClick}
      draggable={false}
    >
      {widget.backgroundImage ? (
        <div className="rj-glance__bg">
          <img
            src={widget.backgroundImage}
            alt=""
            width={880}
            height={650}
            decoding="async"
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : null}
      {widget.backgroundVideo ? (
        <div className="rj-glance__bg">
          <LazyVideo
            src={widget.backgroundVideo}
            muted
            playsInline
            loop
            preload="metadata"
            autoPlayWhenVisible
            rootMargin="280px 0px"
          />
        </div>
      ) : null}
      <div className="rj-glance__card">
        <div className="rj-glance__card-top">
          <div className="rj-glance__card-title">{widget.title}</div>
        </div>
        <div className="rj-glance__card-bottom">
          <div className="rj-glance__card-link">
            <ArrowCue className="rj-link-active">{label}</ArrowCue>
          </div>
          <div className="rj-glance__card-logos">
            <LogoMark src={widget.logo} />
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Horizontal case-study marquee (Rejouice glance structure, cases only).
 */
export function GlanceSection() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollStart: 0,
    moved: 0,
  });
  const suppressNavRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    let x = 0;
    let dragOffset = 0;
    let vel = 0.4;
    let hovering = false;
    let active = false;

    const ctx = gsap.context(() => {
      const cards = track.querySelectorAll(".rj-glance__enter");
      gsap.fromTo(
        cards,
        { opacity: 0, yPercent: 40, rotateX: 45, rotateY: 12 },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: track,
            start: "top 90%",
            once: true,
          },
        },
      );

      ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          active = self.isActive;
        },
      });
    }, root);

    const ticker = () => {
      if (!active) return;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      if (!dragRef.current.active) {
        const speed = hovering ? 0.15 : vel;
        x -= speed;
      } else {
        x = dragOffset;
      }
      while (x <= -half) x += half;
      while (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    gsap.ticker.add(ticker);

    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const onPointerDown = (e: PointerEvent) => {
      suppressNavRef.current = false;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        scrollStart: x,
        moved: 0,
      };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      dragRef.current.moved = dx;
      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD) {
        suppressNavRef.current = true;
      }
      dragOffset = dragRef.current.scrollStart + dx;
    };
    const onPointerUp = () => {
      if (!dragRef.current.active) return;
      x = dragOffset;
      dragRef.current.active = false;
    };

    track.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const mq = window.matchMedia("(min-width: 1024px)");
    const syncVel = () => {
      vel = mq.matches ? 0.8 : 0.4;
    };
    syncVel();
    mq.addEventListener("change", syncVel);

    return () => {
      gsap.ticker.remove(ticker);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      mq.removeEventListener("change", syncVel);
      ctx.revert();
    };
  }, []);

  const sequence = [...CASES, ...CASES];

  return (
    <section
      ref={rootRef}
      className="rj-glance"
      id="glance"
      aria-label="Selected case studies"
    >
      <div className="rj-glance__header" aria-hidden="true" />
      <div className="rj-glance__widgets">
        <div ref={trackRef} className="rj-glance__track">
          {sequence.map((widget, i) => (
            <div key={`${widget.id}-${i}`} className="rj-glance__enter">
              <WidgetCard widget={widget} suppressNavRef={suppressNavRef} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
