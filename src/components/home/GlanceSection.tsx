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
/** Mouse: small lock so desktop drag stays snappy. */
const AXIS_LOCK_MOUSE_PX = 6;
/** Touch: wait for a clear axis so a thumb flick isn't stolen from page scroll. */
const AXIS_LOCK_TOUCH_PX = 10;
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

/** Card height follows the still: small 1488×1320, medium 1488×1482, full 1488×1725. */
const CASES: GlanceWidget[] = [
  {
    id: "bankrollu",
    caseSlug: "bankrollu",
    size: "full",
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
    backgroundImage: "/glance/grono.webp",
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
    backgroundImage: "/glance/foundrae.webp",
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
    size: "full",
    theme: "dark",
    title: caseHeadlineTitle("stan"),
    logo: "/glance/stan.svg",
    backgroundImage: "/glance/stan.webp",
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
  {
    id: "tradevision",
    caseSlug: "tradevision",
    size: "medium",
    theme: "dark",
    title: caseHeadlineTitle("tradevision"),
    logo: "/glance/tradevision.svg",
    backgroundImage: "/glance/tradevision.jpg",
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
            width={1488}
            height={
              widget.size === "small" ? 1320 : widget.size === "medium" ? 1482 : 1725
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
      /** Finger is down: freeze the marquee so the track doesn't slip. */
      held: false,
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
      const last = samples[samples.length - 1];
      if (last && t - last.t < 10 && Math.abs(last.x - clientX) < 1) return;
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

      // Hold still while the finger is down so auto-marquee never fights 1:1 drag.
      if (!drag.held) {
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

    const abortHold = () => {
      drag.tracking = false;
      drag.dragging = false;
      drag.held = false;
      drag.axis = "none";
      drag.pointerId = -1;
      samples.length = 0;
      vx = targetVx();
      widgets.classList.remove("is-dragging");
    };

    const endDrag = (applyInertia: boolean) => {
      if (!drag.tracking && !drag.dragging && !drag.held) return;
      const pointerId = drag.pointerId;
      if (drag.dragging) {
        vx = applyInertia ? sampleVelocity() : targetVx();
      } else {
        // Tap or abandoned hold: resume the marquee without a stall.
        vx = targetVx();
      }
      drag.tracking = false;
      drag.dragging = false;
      drag.held = false;
      drag.axis = "none";
      drag.pointerId = -1;
      samples.length = 0;
      widgets.classList.remove("is-dragging");
      releaseCapture(pointerId);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (drag.tracking || drag.held) return;
      suppressNavRef.current = false;
      drag.pointerId = e.pointerId;
      drag.tracking = true;
      drag.dragging = false;
      drag.held = true;
      drag.axis = "none";
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.scrollStart = x;
      vx = 0;
      samples.length = 0;
      pushSample(e.clientX);
    };

    const followPointer = (clientX: number) => {
      x = drag.scrollStart + (clientX - drag.startX);
      if (Math.abs(clientX - drag.startX) > DRAG_CLICK_THRESHOLD) {
        suppressNavRef.current = true;
      }
      pushSample(clientX);
      render();
    };

    const lockHorizontal = (clientX: number, pointerType: string, pointerId: number) => {
      drag.axis = "h";
      drag.dragging = true;
      vx = 0;
      suppressNavRef.current = true;
      widgets.classList.add("is-dragging");
      // Capture only for mouse — on touch it can cancel the gesture (iOS).
      if (pointerType === "mouse") {
        try {
          widgets.setPointerCapture(pointerId);
        } catch {
          /* capture is best-effort; window listeners still track the gesture */
        }
      }
      followPointer(clientX);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.tracking || e.pointerId !== drag.pointerId) return;
      if (drag.axis === "v") return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (drag.axis === "none") {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const lockPx =
          e.pointerType === "mouse" ? AXIS_LOCK_MOUSE_PX : AXIS_LOCK_TOUCH_PX;
        if (adx < lockPx && ady < lockPx) return;

        const isMouse = e.pointerType === "mouse";
        if (!isMouse && ady > adx) {
          drag.axis = "v";
          abortHold();
          return;
        }

        if (e.cancelable) e.preventDefault();
        lockHorizontal(e.clientX, e.pointerType, e.pointerId);
        return;
      }

      if (e.cancelable) e.preventDefault();
      followPointer(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      endDrag(true);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      endDrag(false);
    };

    // Touch path: 1:1 follow + preventDefault. iOS is unreliable with pointermove alone.
    const onTouchMove = (e: TouchEvent) => {
      if (!drag.held && !drag.tracking) return;
      if (drag.axis === "v") return;
      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - drag.startX;
      const dy = touch.clientY - drag.startY;

      if (drag.axis === "none") {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx < AXIS_LOCK_TOUCH_PX && ady < AXIS_LOCK_TOUCH_PX) return;
        if (ady > adx) {
          drag.axis = "v";
          abortHold();
          return;
        }
        if (e.cancelable) e.preventDefault();
        lockHorizontal(touch.clientX, "touch", drag.pointerId);
        return;
      }

      if (e.cancelable) e.preventDefault();
      followPointer(touch.clientX);
    };

    const onTouchEnd = () => {
      if (!drag.held && !drag.tracking && !drag.dragging) return;
      endDrag(true);
    };

    const onTouchCancel = () => {
      if (!drag.held && !drag.tracking && !drag.dragging) return;
      endDrag(false);
    };

    widgets.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);
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
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
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
