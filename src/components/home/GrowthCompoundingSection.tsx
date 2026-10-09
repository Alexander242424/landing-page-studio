import { useEffect, useMemo, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MQ = "(min-width: 768px)";
const MOTION_MQ = "(prefers-reduced-motion: reduce)";

type ChartPoint = {
  label: string;
  value: number;
  caption: string;
};

const CHART_POINTS: ChartPoint[] = [
  { label: "Baseline", value: 2.1, caption: "Full-journey audit" },
  { label: "Sprint 1", value: 2.6, caption: "Checkout friction removed" },
  { label: "Sprint 2", value: 3.2, caption: "Onboarding variant wins" },
  { label: "Sprint 3", value: 3.9, caption: "Paywall test ships" },
  { label: "Sprint 4", value: 4.6, caption: "New default locked in" },
];

const STEPS = [
  {
    kicker: "01 — Baseline",
    title: "Measure what you have.",
    body: "Event tracking and funnel cuts around revenue — conversion rate, trial-to-paid, and revenue per visitor — so every sprint starts from the same truth.",
    metric: "2.1%",
    metricLabel: "Starting CVR",
  },
  {
    kicker: "02 — Ship",
    title: "Fix the highest-leak moment.",
    body: "The smallest shippable change goes live with clear owners. Winners stay; losers get replaced in the next loop — not buried in a deck.",
    metric: "+32%",
    metricLabel: "Trial-to-paid lift",
  },
  {
    kicker: "03 — Compound",
    title: "Every win becomes the default.",
    body: "Each round starts from a better product, so conversion and revenue keep stacking without buying more traffic.",
    metric: "2.2×",
    metricLabel: "RPV vs baseline",
  },
] as const;

const CHART_WIDTH = 920;
const CHART_HEIGHT = 320;
const CHART_PAD = { top: 28, right: 24, bottom: 52, left: 56 };

function buildLinePath(points: ChartPoint[]): string {
  const innerW = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value)) * 0.85;
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x =
      CHART_PAD.left + (index / Math.max(points.length - 1, 1)) * innerW;
    const y =
      CHART_PAD.top +
      innerH -
      ((point.value - min) / span) * innerH;
    return { x, y };
  });

  if (coords.length === 0) return "";
  if (coords.length === 1) {
    const { x, y } = coords[0]!;
    return `M ${x} ${y}`;
  }

  let d = `M ${coords[0]!.x} ${coords[0]!.y}`;
  for (let i = 1; i < coords.length; i += 1) {
    const prev = coords[i - 1]!;
    const curr = coords[i]!;
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildAreaPath(linePath: string, points: ChartPoint[]): string {
  if (!linePath || points.length === 0) return "";
  const innerW = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
  const baseY = CHART_HEIGHT - CHART_PAD.bottom;
  const lastX = CHART_PAD.left + innerW;
  const firstX = CHART_PAD.left;
  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

function GrowthChart({
  className,
  linePath,
  areaPath,
  points,
}: {
  className?: string;
  linePath: string;
  areaPath: string;
  points: ChartPoint[];
}) {
  const innerW = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
  const max = Math.max(...points.map((p) => p.value));

  return (
    <svg
      className={cn("rj-compounding__chart-svg", className)}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label="Conversion rate climbing across four sprints after baseline audit"
    >
      <defs>
        <linearGradient id="rj-compounding-line" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--rj-compounding-accent)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--rj-compounding-accent) 35%, transparent)" />
        </linearGradient>
        <linearGradient id="rj-compounding-fill" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--rj-compounding-accent) 42%, transparent)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          className="rj-compounding__grid-line"
          x1={CHART_PAD.left}
          x2={CHART_WIDTH - CHART_PAD.right}
          y1={CHART_PAD.top + (CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom) * t}
          y2={CHART_PAD.top + (CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom) * t}
        />
      ))}

      <path className="rj-compounding__area" d={areaPath} fill="url(#rj-compounding-fill)" />
      <path className="rj-compounding__line" d={linePath} fill="none" stroke="url(#rj-compounding-line)" />

      {points.map((point, index) => {
        const x =
          CHART_PAD.left + (index / Math.max(points.length - 1, 1)) * innerW;
        const innerH = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;
        const min = Math.min(...points.map((p) => p.value)) * 0.85;
        const span = max - min || 1;
        const y =
          CHART_PAD.top +
          innerH -
          ((point.value - min) / span) * innerH;

        return (
          <g key={point.label} className="rj-compounding__node">
            <circle className="rj-compounding__node-dot" cx={x} cy={y} r={5} />
            <text className="rj-compounding__node-value" x={x} y={y - 14} textAnchor="middle">
              {point.value.toFixed(1)}%
            </text>
            <text className="rj-compounding__node-label" x={x} y={CHART_HEIGHT - 18} textAnchor="middle">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Pinned compounding chart — desktop scrubs a wide timeline that draws R→L
 * while copy beats advance on the left (Figma frames 4994:5289 → 5676 → 5585).
 */
export function GrowthCompoundingSection({
  sectionId = "results",
  headline = (
    <>
      Revenue that
      <br />
      compounds.
    </>
  ),
  ariaLabel = "Revenue that compounds.",
}: {
  sectionId?: string;
  headline?: ReactNode;
  ariaLabel?: string;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const pinHeightRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const chartClipRef = useRef<HTMLDivElement>(null);
  const chartTrackRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  const linePath = useMemo(() => buildLinePath(CHART_POINTS), []);
  const areaPath = useMemo(() => buildAreaPath(linePath, CHART_POINTS), [linePath]);

  useEffect(() => {
    const root = rootRef.current;
    const headline = headlineRef.current;
    const pinHeight = pinHeightRef.current;
    const pin = pinRef.current;
    const chartClip = chartClipRef.current;
    const chartTrack = chartTrackRef.current;
    if (!root || !headline || !pinHeight || !pin || !chartClip || !chartTrack) {
      return;
    }

    const cleanups: Array<() => void> = [];
    cleanups.push(createAwardsCharReveal(headline, { start: "top 85%" }));

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const motionMq = window.matchMedia(MOTION_MQ);
    let stackCtx: gsap.Context | null = null;

    const teardownStack = () => {
      stackCtx?.revert();
      stackCtx = null;
    };

    const setupStack = () => {
      teardownStack();

      const steps = stepRefs.current.filter(Boolean) as HTMLElement[];
      const enablePin = desktopMq.matches && !motionMq.matches;

      if (!enablePin) {
        pinHeight.style.removeProperty("height");
        gsap.set(chartClip, { clearProps: "clipPath" });
        gsap.set(chartTrack, { clearProps: "x" });
        gsap.set(steps, { clearProps: "opacity,y" });

        stackCtx = gsap.context(() => {
          steps.forEach((step, index) => {
            gsap.set(step, { opacity: index === 0 ? 1 : 0.92, y: 0 });
            ScrollTrigger.create({
              trigger: step,
              start: "top 88%",
              once: true,
              onEnter: () => {
                gsap.to(step, { opacity: 1, duration: 0.6, ease: "power2.out" });
              },
            });
          });
        }, root);
        return;
      }

      stackCtx = gsap.context(() => {
        const segmentCount = STEPS.length;
        const introHold = 0.45;
        const segmentDuration = 1;
        const outroHold = 0.35;
        const timelineUnits = introHold + segmentCount * segmentDuration + outroHold;

        pinHeight.style.height = `${Math.round(timelineUnits * 100 * 1.02)}vh`;

        const measurePan = () => {
          const overflow = Math.max(0, chartTrack.scrollWidth - chartClip.clientWidth);
          return overflow;
        };

        gsap.set(chartClip, { clipPath: "inset(0 100% 0 0 round 0.4rem)" });
        gsap.set(chartTrack, { x: 0, force3D: true });
        steps.forEach((step, index) => {
          gsap.set(step, {
            opacity: index === 0 ? 1 : 0.28,
            y: index === 0 ? 0 : 12,
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: "top top",
            end: "bottom bottom",
            pin,
            pinSpacing: false,
            anticipatePin: 0,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        tl.to({}, { duration: introHold });

        for (let i = 0; i < segmentCount; i += 1) {
          const at = introHold + i * segmentDuration;
          const reveal = ((i + 1) / segmentCount) * 100;
          const panTarget = () => -measurePan() * ((i + 1) / segmentCount);

          tl.to(
            chartClip,
            {
              clipPath: `inset(0 ${100 - reveal}% 0 0 round 0.4rem)`,
              ease: "none",
              duration: segmentDuration,
            },
            at,
          );

          tl.to(
            chartTrack,
            {
              x: panTarget,
              ease: "none",
              duration: segmentDuration,
            },
            at,
          );

          steps.forEach((step, stepIndex) => {
            tl.to(
              step,
              {
                opacity: stepIndex === i ? 1 : stepIndex < i ? 0.22 : 0.28,
                y: stepIndex === i ? 0 : 10,
                ease: "none",
                duration: segmentDuration * 0.35,
              },
              at + segmentDuration * 0.12,
            );
          });
        }

        tl.to({}, { duration: outroHold });
      }, root);
    };

    setupStack();

    const onChange = () => {
      setupStack();
      ScrollTrigger.refresh();
    };

    desktopMq.addEventListener("change", onChange);
    motionMq.addEventListener("change", onChange);
    cleanups.push(() => {
      desktopMq.removeEventListener("change", onChange);
      motionMq.removeEventListener("change", onChange);
      teardownStack();
    });

    const onOrientation = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onOrientation);
    cleanups.push(() =>
      window.removeEventListener("orientationchange", onOrientation),
    );

    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id={sectionId}
      className="rj-compounding"
      aria-label={ariaLabel}
    >
      <div ref={pinHeightRef} className="rj-compounding__pin-height">
        <div ref={pinRef} className="rj-compounding__pin">
          <div className="rj-compounding__heading">
            <h2 ref={headlineRef} className="rj-compounding__headline rj-awards-title">
              {headline}
            </h2>
            <p className="rj-compounding__lede">
              Measured against your baseline — conversion, activation, and revenue per visitor
              on the same chart, sprint after sprint.
            </p>
          </div>

          <div className="rj-compounding__layout">
            <div className="rj-compounding__copy" aria-live="polite">
              {STEPS.map((step, index) => (
                <article
                  key={step.kicker}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className={cn(
                    "rj-compounding__step",
                    index === 0 && "is-active",
                  )}
                >
                  <p className="rj-compounding__kicker">{step.kicker}</p>
                  <h3 className="rj-compounding__step-title">{step.title}</h3>
                  <p className="rj-compounding__step-body">{step.body}</p>
                  <div className="rj-compounding__step-metric">
                    <span className="rj-compounding__metric-value">{step.metric}</span>
                    <span className="rj-compounding__metric-label">{step.metricLabel}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="rj-compounding__chart-panel">
              <div ref={chartClipRef} className="rj-compounding__chart-clip">
                <div ref={chartTrackRef} className="rj-compounding__chart-track">
                  <GrowthChart
                    linePath={linePath}
                    areaPath={areaPath}
                    points={CHART_POINTS}
                  />
                  <ul className="rj-compounding__captions">
                    {CHART_POINTS.map((point) => (
                      <li key={point.label}>
                        <span>{point.label}</span>
                        <span>{point.caption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
