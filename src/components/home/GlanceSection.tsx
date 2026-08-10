import { useEffect, useRef, useState, type ReactNode } from "react";
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
  subtitle?: string;
  logos?: string[];
  backgroundImage?: string;
  backgroundVideo?: string;
  link?: { href: string; label: string };
  drive?: { title: string; subtitle: string; value: number };
  scroller?: string[];
  offices?: boolean;
};

const BRAND_LOGOS = [
  "/glance/tensr.svg",
  "/glance/moxion.svg",
  "/glance/rivian.svg",
  "/glance/hyperframe.svg",
  "/glance/oura.svg",
  "/glance/rappi.svg",
];

const AWARD_LOGOS = [
  "/glance/fwa.svg",
  "/glance/awwards.svg",
  "/glance/behance.svg",
  "/glance/webby.svg",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "E-commerce",
  "BioTech",
  "Automotive",
  "Healthcare",
  "Real Estate",
  "Fashion",
  "Energy",
  "Retail",
  "Manufacturing",
  "Software",
  "Consumer Goods",
  "Transportation",
  "Hospitality",
  "Defense",
  "Logistics",
];

const WIDGETS: GlanceWidget[] = [
  {
    id: "brands",
    size: "small",
    theme: "dark",
    title: (
      <p>
        60 brands
        <br />
        <em>successfully launched since 2013.</em>
      </p>
    ),
    logos: BRAND_LOGOS,
  },
  {
    id: "industries",
    size: "full",
    theme: "dark",
    title: null,
    scroller: INDUSTRIES,
    backgroundImage: "/glance/oura.jpg",
  },
  {
    id: "awards",
    size: "small",
    theme: "light",
    title: (
      <p>
        70+ industry-recognized
        <br />
        awards.
      </p>
    ),
    logos: AWARD_LOGOS,
  },
  {
    id: "ecommerce",
    size: "full",
    theme: "dark",
    title: (
      <p>
        E-commerce
        <br />
        <em>10+ years of expertise</em>
      </p>
    ),
    backgroundImage: "/glance/pergola.jpg",
  },
  {
    id: "models",
    size: "small",
    theme: "dark",
    title: (
      <p>
        2 Engagement Models
        <br />
        <em>Classic / Venture</em>
      </p>
    ),
    link: { href: "#services", label: "Learn more" },
  },
  {
    id: "ltv",
    size: "small",
    theme: "light",
    title: null,
    drive: {
      title: "Driving 150%",
      subtitle: "LTV:CAC in average",
      value: 15,
    },
  },
  {
    id: "rivian",
    size: "medium",
    theme: "dark",
    title: (
      <p>
        Catalyzed ~71,000
        <br />
        pre-orders <em>after brand reveal</em>
        <br />
        (approximately $5.68 billion).
      </p>
    ),
    logos: ["/glance/rivian.svg"],
    backgroundVideo: "/glance/rivian.mp4",
  },
  {
    id: "business",
    size: "small",
    theme: "light",
    title: (
      <p>
        $5M+ in new business
        <br />
        <em>generated within 90 days of launch</em>
      </p>
    ),
    logos: ["/glance/noovo.svg"],
    link: { href: "#work", label: "Case Study" },
  },
  {
    id: "offices",
    size: "full",
    theme: "light",
    title: null,
    offices: true,
  },
];

function LogoSwitcher({ logos }: { logos: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (logos.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % logos.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [logos.length]);

  return (
    <div className="rj-glance__logos">
      {logos.map((src, i) => (
        <div
          key={src}
          className={cn(
            "rj-glance__logo",
            i === active && "is-active",
            i === (active === 0 ? logos.length - 1 : active - 1) && "is-last",
          )}
        >
          <img src={src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
}

function IndustryScroller({ titles }: { titles: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const opacityFor = (mod: number) => {
      if (mod === 1) return "1";
      if (mod === 2) return "0.66";
      if (mod === 3) return "0.33";
      return "0";
    };

    const paint = () => {
      const nodes = root.querySelectorAll<HTMLElement>(".rj-glance__scroller-title");
      nodes.forEach((node, i) => {
        const mod =
          ((i + offsetRef.current) % titles.length + titles.length) %
          titles.length;
        node.style.setProperty("--rj-scroll-y", `${(mod - 1) * 100}%`);
        node.style.setProperty("--rj-scroll-opacity", opacityFor(mod));
      });
    };

    paint();
    const id = window.setInterval(() => {
      offsetRef.current -= 1;
      paint();
    }, 1200);
    return () => window.clearInterval(id);
  }, [titles.length]);

  return (
    <div ref={rootRef} className="rj-glance__scroller">
      {titles.map((title) => (
        <div key={title} className="rj-glance__scroller-title">
          {title}
        </div>
      ))}
    </div>
  );
}

function DriveCard({
  title,
  subtitle,
  value,
}: {
  title: string;
  subtitle: string;
  value: number;
}) {
  const [shown, setShown] = useState(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(value / 10);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    const target = shown ? value : value / 2;
    const start = currentRef.current;
    const t0 = performance.now();
    const dur = shown ? 1000 : 1500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = shown ? 1 - Math.pow(1 - t, 3) : t;
      currentRef.current = start + (target - start) * eased;
      el.textContent = `${Math.round(currentRef.current)}%`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, value]);

  return (
    <div
      className="rj-glance__drive"
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
    >
      <div className="rj-glance__drive-top">
        <span className="rj-glance__drive-title">{title}</span>
        <span className="rj-glance__drive-sub">{subtitle}</span>
      </div>
      <div
        ref={valueRef}
        className={cn("rj-glance__drive-value", shown && "is-shown")}
      >
        {Math.round(value / 10)}%
      </div>
    </div>
  );
}

function OfficesCard() {
  const format = (tz: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date());
    } catch {
      return "00:00:00PM";
    }
  };

  const [times, setTimes] = useState({
    sd: "00:00:00PM",
    paris: "00:00:00PM",
  });

  useEffect(() => {
    const tick = () =>
      setTimes({
        sd: format("America/Los_Angeles"),
        paris: format("Europe/Paris"),
      });
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rj-glance__offices">
      <div className="rj-glance__offices-top">
        <span>2 Offices</span>
        <div className="rj-glance__office">
          <span>San Diego, USA</span>
          <span>{times.sd}</span>
        </div>
        <div className="rj-glance__office">
          <span>Paris, France</span>
          <span>{times.paris}</span>
        </div>
      </div>
      <div className="rj-glance__clock" aria-hidden="true">
        <svg viewBox="0 0 270 270" fill="none">
          <circle
            cx="135"
            cy="135"
            r="115"
            stroke="currentColor"
            strokeOpacity="0.42"
            strokeWidth="27"
            strokeDasharray="0.5 14.55"
          />
          <circle
            cx="135"
            cy="135"
            r="8.5"
            stroke="currentColor"
            strokeWidth="15"
          />
        </svg>
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
      <div className="rj-glance__card">
        <div className="rj-glance__card-top">
          {widget.scroller ? (
            <IndustryScroller titles={widget.scroller} />
          ) : widget.drive ? (
            <DriveCard {...widget.drive} />
          ) : widget.offices ? (
            <OfficesCard />
          ) : (
            <div className="rj-glance__card-title">{widget.title}</div>
          )}
        </div>
        {!widget.drive && !widget.offices && !widget.scroller && (
          <div className="rj-glance__card-bottom">
            <div className="rj-glance__card-right">
              {widget.link ? (
                <ArrowLink href={widget.link.href}>{widget.link.label}</ArrowLink>
              ) : null}
            </div>
            <div className="rj-glance__card-logos">
              {widget.logos ? <LogoSwitcher logos={widget.logos} /> : null}
            </div>
          </div>
        )}
      </div>
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
    </div>
  );
}

/**
 * Rejouice "at a Glance" horizontal marquee — black chrome (exception vs white on rejouice).
 */
export function GlanceSection() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollStart: 0,
    moved: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const split = splitRef.current;
    if (!root || !track || !split) return;

    let x = 0;
    let dragOffset = 0;
    let vel = 0.4;
    let hovering = false;
    let active = false;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: split,
        start: "top 90%",
        once: true,
        onEnter: () => split.classList.add("is-shown"),
      });

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

  const sequence = [...WIDGETS, ...WIDGETS];

  return (
    <section
      ref={rootRef}
      className="rj-glance"
      id="glance"
      aria-label="UXLAB at a Glance"
    >
      <div className="rj-glance__split-wrap">
        <div ref={splitRef} className="rj-split" />
      </div>
      <div className="rj-glance__header">
        <span>UXLAB at a Glance.</span>
        <a href="mailto:hello@uxlab.digital" className="rj-link-active">
          hello@uxlab.digital
        </a>
      </div>
      <div className="rj-glance__widgets">
        <div ref={trackRef} className="rj-glance__track">
          {sequence.map((widget, i) => (
            <div
              key={`${widget.id}-${i}`}
              className="rj-glance__enter"
            >
              <WidgetCard widget={widget} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
