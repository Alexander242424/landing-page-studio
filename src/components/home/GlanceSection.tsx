import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type WidgetSize = "small" | "medium" | "full";
type WidgetTheme = "dark" | "light";

type GlanceWidget = {
  id: string;
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
  link?: { href: string; label: string };
};

/** Heights alternate — no two neighbors share the same size (incl. loop seam). */
const CASES: GlanceWidget[] = [
  {
    id: "rivian",
    size: "medium",
    theme: "dark",
    title: (
      <p>
        +71,000 pre-orders
        <br />
        <em>after brand reveal — ~$5.68B.</em>
      </p>
    ),
    logo: "/glance/rivian.svg",
    logoInk: "light",
    backgroundVideo: "/glance/rivian.mp4",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "oura",
    size: "full",
    theme: "dark",
    title: (
      <p>
        Category-defining wearables
        <br />
        <em>brand & product experience.</em>
      </p>
    ),
    logo: "/glance/oura.svg",
    logoInk: "light",
    backgroundImage: "/glance/oura-case.jpg",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "tensr",
    size: "small",
    theme: "dark",
    title: (
      <p>
        +1799% activations
        <br />
        <em>performance-led redesign.</em>
      </p>
    ),
    logo: "/glance/tensr.svg",
    logoInk: "light",
    backgroundVideo: "/glance/work-01.mp4",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "moxion",
    size: "full",
    theme: "dark",
    title: (
      <p>
        +395% conversion rate
        <br />
        <em>in 3 weeks.</em>
      </p>
    ),
    logo: "/glance/moxion.svg",
    logoInk: "light",
    backgroundImage: "/glance/moxion.jpg",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "hyperframe",
    size: "small",
    theme: "dark",
    title: (
      <p>
        +150% LTV:CAC
        <br />
        <em>across launch funnels.</em>
      </p>
    ),
    logo: "/glance/hyperframe.svg",
    logoInk: "light",
    backgroundVideo: "/glance/work-02.mp4",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "rivian-still",
    size: "medium",
    theme: "dark",
    title: (
      <p>
        Market-defining launch
        <br />
        <em>strategy, design, performance.</em>
      </p>
    ),
    logo: "/glance/rivian.svg",
    logoInk: "light",
    backgroundImage: "/glance/rivian.jpg",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "noovo",
    size: "full",
    theme: "dark",
    title: (
      <p>
        End-to-end brand system
        <br />
        <em>from launch to scale.</em>
      </p>
    ),
    logo: "/glance/noovo.svg",
    logoInk: "dark",
    backgroundImage: "/glance/pergola.jpg",
    link: { href: "#solutions", label: "Case Study" },
  },
  {
    id: "rappi",
    size: "small",
    theme: "dark",
    title: (
      <p>
        $5M+ in new business
        <br />
        <em>in 90 days.</em>
      </p>
    ),
    logo: "/glance/rappi.svg",
    logoInk: "light",
    backgroundVideo: "/glance/work-03.mp4",
    link: { href: "#solutions", label: "Case Study" },
  },
];

function LogoMark({ src }: { src: string }) {
  return (
    <div className="rj-glance__logos">
      <div className="rj-glance__logo is-active">
        <img src={src} alt="" draggable={false} />
      </div>
    </div>
  );
}

function WidgetCard({ widget }: { widget: GlanceWidget }) {
  return (
    <div
      className={cn(
        "rj-glance__widget",
        `rj-glance__widget--${widget.size}`,
        `rj-glance__widget--${widget.theme}`,
      )}
    >
      {widget.backgroundImage ? (
        <div className="rj-glance__bg">
          <img src={widget.backgroundImage} alt="" draggable={false} />
        </div>
      ) : null}
      {widget.backgroundVideo ? (
        <div className="rj-glance__bg">
          <video
            src={widget.backgroundVideo}
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            draggable={false}
          />
        </div>
      ) : null}
      <div className="rj-glance__card">
        <div className="rj-glance__card-top">
          <div className="rj-glance__card-title">{widget.title}</div>
        </div>
        <div className="rj-glance__card-bottom">
          <div className="rj-glance__card-link">
            {widget.link ? (
              <ArrowLink href={widget.link.href} className="rj-link-active">
                {widget.link.label}
              </ArrowLink>
            ) : null}
          </div>
          <div className="rj-glance__card-logos">
            <LogoMark src={widget.logo} />
          </div>
        </div>
      </div>
    </div>
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
              <WidgetCard widget={widget} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
