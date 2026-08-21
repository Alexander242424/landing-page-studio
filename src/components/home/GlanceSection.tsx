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
/** px before locking to horizontal drag vs vertical page scroll */
const AXIS_LOCK_PX = 6;
const VELOCITY_WINDOW_MS = 90;
const MAX_RELEASE_PX_PER_SEC = 3200;
/** 1/e toward auto-speed in ~360ms; a flick coasts ~1s then becomes the marquee */
const INERTIA_LAMBDA = 2.8;
const HOVER_PX_PER_TICK = 0.15;

type WidgetSize = "small" | "medium" | "full";
type WidgetTheme = "dark" | "light";

type GlanceWidget = {
  id: string;
  /** Case study slug for `/work/$slug` (rivian-still → rivian). */
  caseSlug: string;
  size: WidgetSize;
  theme: WidgetTheme;
  title: ReactNode;
  /** Brand mark bottom-right (light/white ink for dark cards). */
  logo: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  linkLabel?: string;
};

function glanceHeadline(headline: CaseHeadline): ReactNode {
  return (
    <p>
      {headline.line}
      <br />
      <span>{headline.emphasis}</span>
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
    id: "bankrollu",
    caseSlug: "bankrollu",
    size: "small",
    theme: "dark",
    title: caseHeadlineTitle("bankrollu"),
    logo: "/glance/bankrollu.svg",
    backgroundImage: "/glance/bankrollu.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "grono",
    caseSlug: "grono",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("grono"),
    logo: "/glance/grono.svg",
    backgroundImage: "/glance/grono.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "nespresso",
    caseSlug: "nespresso",
    size: "medium",
    theme: "dark",
    title: caseHeadlineTitle("nespresso"),
    logo: "/glance/nespresso.svg",
    backgroundImage: "/glance/nespresso.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "foundrae",
    caseSlug: "foundrae",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("foundrae"),
    logo: "/glance/foundrae.svg",
    backgroundImage: "/glance/foundrae.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "boostra",
    caseSlug: "boostra",
    size: "small",
    theme: "dark",
    title: caseHeadlineTitle("boostra"),
    logo: "/glance/boostra.svg",
    backgroundImage: "/glance/boostra.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "stan",
    caseSlug: "stan",
    size: "medium",
    theme: "dark",
    title: caseHeadlineTitle("stan"),
    logo: "/glance/stan.svg",
    backgroundImage: "/glance/stan.jpg",
    linkLabel: "Case Study",
  },
  {
    id: "forbes",
    caseSlug: "forbes",
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("forbes"),
    logo: "/glance/forbes.svg",
    backgroundImage: "/glance/forbes.jpg",
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
            width={992}
            height={
              widget.size === "small" ? 880 : widget.size === "medium" ? 988 : 1150
            }
            decoding="async"
            // Eager: transform-based marquees are unreliable with native lazy-load.
            loading="eager"
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

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function wrapX(value: number, half: number) {
  if (half <= 0) return value;
  let next = value;
  while (next <= -half) next += half;
  while (next > 0) next -= half;
  return next;
}

type DragAxis = "none" | "h" | "v";
type VelocitySample = { x: number; t: number };

/**
 * Horizontal case-study marquee (Rejouice glance structure, cases only).
 */
export function GlanceSection() {
  const rootRef = useRef<HTMLElement>(null);
  const widgetsRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const suppressNavRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const widgets = widgetsRef.current;
    const track = trackRef.current;
    if (!root || !widgets || !track) return;

    let x = 0;
    let vx = 0;
    let tickSpeed = 0.4;
    let hovering = false;
    let inView = false;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const samples: VelocitySample[] = [];
    const drag = {
      pointerId: -1,
      tracking: false,
      dragging: false,
      axis: "none" as DragAxis,
      startX: 0,
      startY: 0,
      scrollStart: 0,
    };

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
          inView = self.isActive;
        },
      });
    }, root);

    const targetVx = () => -(hovering ? HOVER_PX_PER_TICK : tickSpeed) * 60;

    const pushSample = (clientX: number) => {
      const t = performance.now();
      samples.push({ x: clientX, t });
      while (samples.length > 1 && t - samples[0].t > VELOCITY_WINDOW_MS) {
        samples.shift();
      }
    };

    const sampleVelocity = () => {
      const now = performance.now();
      const last = samples[samples.length - 1];
      if (!last || now - last.t > 40) return 0;
      const recent = samples.filter((s) => last.t - s.t <= VELOCITY_WINDOW_MS);
      if (recent.length < 2) return 0;
      const first = recent[0];
      const dt = last.t - first.t;
      if (dt < 12) return 0;
      const raw = ((last.x - first.x) / dt) * 1000;
      return Math.max(-MAX_RELEASE_PX_PER_SEC, Math.min(MAX_RELEASE_PX_PER_SEC, raw));
    };

    const render = () => {
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      x = wrapX(x, half);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const ticker = (_time: number, deltaTime: number) => {
      if (!inView) return;
      const dt = Math.min(0.064, Math.max(0, deltaTime) / 1000);

      if (!drag.dragging) {
        const target = targetVx();
        const lambda = Math.abs(vx - target) > 120 ? INERTIA_LAMBDA : 6.5;
        vx = damp(vx, target, lambda, dt);
        x += vx * dt;
      }

      render();
    };

    gsap.ticker.add(ticker);

    const onEnter = () => {
      if (!coarsePointer) hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const releaseCapture = (pointerId: number) => {
      if (pointerId !== -1 && widgets.hasPointerCapture(pointerId)) {
        widgets.releasePointerCapture(pointerId);
      }
    };

    const endDrag = (applyInertia: boolean) => {
      if (!drag.tracking && !drag.dragging) return;
      const pointerId = drag.pointerId;
      if (drag.dragging) {
        vx = applyInertia ? sampleVelocity() : targetVx();
      }
      drag.tracking = false;
      drag.dragging = false;
      drag.axis = "none";
      drag.pointerId = -1;
      samples.length = 0;
      widgets.classList.remove("is-dragging");
      releaseCapture(pointerId);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (drag.tracking) return;
      suppressNavRef.current = false;
      drag.pointerId = e.pointerId;
      drag.tracking = true;
      drag.dragging = false;
      drag.axis = "none";
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.scrollStart = x;
      samples.length = 0;
      pushSample(e.clientX);
    };

    const followPointer = (e: PointerEvent) => {
      x = drag.scrollStart + (e.clientX - drag.startX);
      if (Math.abs(e.clientX - drag.startX) > DRAG_CLICK_THRESHOLD) {
        suppressNavRef.current = true;
      }
      pushSample(e.clientX);
      render();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.tracking || e.pointerId !== drag.pointerId) return;
      if (drag.axis === "v") return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (drag.axis === "none") {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx < AXIS_LOCK_PX && ady < AXIS_LOCK_PX) return;

        const isMouse = e.pointerType === "mouse";
        if (!isMouse && ady > adx) {
          drag.axis = "v";
          drag.tracking = false;
          return;
        }

        drag.axis = "h";
        drag.dragging = true;
        vx = 0;
        widgets.classList.add("is-dragging");
        try {
          widgets.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort; window listeners still track the gesture */
        }
        if (e.cancelable) e.preventDefault();
        followPointer(e);
        return;
      }

      if (e.cancelable) e.preventDefault();
      followPointer(e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      endDrag(true);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      endDrag(false);
    };

    widgets.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    widgets.addEventListener("lostpointercapture", onPointerCancel);

    const mq = window.matchMedia("(min-width: 1024px)");
    const syncVel = () => {
      tickSpeed = mq.matches ? 0.8 : 0.4;
      if (!drag.dragging) vx = targetVx();
    };
    syncVel();
    mq.addEventListener("change", syncVel);

    return () => {
      gsap.ticker.remove(ticker);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      widgets.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      widgets.removeEventListener("lostpointercapture", onPointerCancel);
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
      <div ref={widgetsRef} className="rj-glance__widgets">
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
