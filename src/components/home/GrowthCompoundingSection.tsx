import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MQ = "(min-width: 1024px)";
const MOTION_MQ = "(prefers-reduced-motion: reduce)";

const PROBLEM_ITEMS = [
  "Limited internal bandwidth (time)",
  "Lack of clarity on what to test (know-how)",
  "You bought an A/B testing tool your team doesn't use (tech)",
] as const;

const NEED_ITEMS = [
  "A CRO partner to free up your time",
  "Proven experiments shipped by conversion specialists",
  "An AI-native stack designed for revenue",
] as const;

/** Figma 4994:5585 — frame 570 tall; step nodes widened for 24px labels + inset. */
const FIGMA_FRAME_H = 570;
const STEP_NODE_W = 280;
const STEP_NODE_H = 88;
const STEP_NODE_GAP = 64;
const FIGMA_NODE_RX = 4;
const FIGMA_LABEL_OFFSET_Y = 8;
const FIGMA_ROW_CY = 285;
const UX_NODE_SCALE = 1.5;
const UX_NODE_W = STEP_NODE_W * UX_NODE_SCALE;
const UX_NODE_H = STEP_NODE_H * UX_NODE_SCALE;
const UX_LOGO_W = 111.536 * UX_NODE_SCALE;
const UX_LOGO_H = 16 * UX_NODE_SCALE;
const RIGHT_COL_CENTER_FRAC = (35 + 65 / 2) / (35 + 65);

function layoutFlywheelChain() {
  let cursor = UX_NODE_W + STEP_NODE_GAP;
  const place = () => {
    const x = cursor;
    cursor += STEP_NODE_W + STEP_NODE_GAP;
    return x;
  };
  const revenueX = place();
  const dataX = place();
  const productX = place();
  const frictionX = place();
  const pillarX = place();
  const hypoX = place();
  const convX = place();
  const testX = place();
  const winnerX = place();
  const reportingX = place();
  const growthX = place();
  const frameW = growthX + STEP_NODE_W;
  return {
    revenueX,
    dataX,
    productX,
    frictionX,
    pillarX,
    hypoX,
    convX,
    testX,
    winnerX,
    reportingX,
    growthX,
    frameW,
  };
}

function spineX(leftNodeRight: number, rightNodeLeft: number) {
  return leftNodeRight + (rightNodeLeft - leftNodeRight) / 2;
}

function CheckPanel({
  title,
  items,
  iconVariant,
}: {
  title: string;
  items: readonly string[];
  iconVariant: "negative" | "positive";
}) {
  return (
    <div className="rj-compounding__subpanel">
      <p className="rj-compounding__subpanel-title">{title}</p>
      <ul className="rj-compounding__checklist">
        {items.map((item) => (
          <li key={item} className="rj-compounding__checklist-item">
            <span
              className={`rj-compounding__check rj-compounding__check--${iconVariant}`}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function nodeCenterY(top: number) {
  return top + STEP_NODE_H / 2;
}

function DiagramNode({
  x,
  y,
  label,
  variant = "primary",
}: {
  x: number;
  y: number;
  label: string;
  variant?: "primary" | "ghost";
}) {
  const cx = x + STEP_NODE_W / 2;
  const cy = nodeCenterY(y);
  const nodeClass =
    variant === "ghost"
      ? "rj-compounding__diagram-node rj-compounding__diagram-node--ghost"
      : "rj-compounding__diagram-node rj-compounding__diagram-node--primary";
  const labelClass =
    variant === "ghost"
      ? "rj-compounding__diagram-label rj-compounding__diagram-label--ghost"
      : "rj-compounding__diagram-label";

  return (
    <g className="rj-compounding__diagram-shape rj-compounding__diagram-fade">
      <rect
        className={nodeClass}
        x={x}
        y={y}
        width={STEP_NODE_W}
        height={STEP_NODE_H}
        rx={FIGMA_NODE_RX}
      />
      <text
        className={labelClass}
        x={cx}
        y={cy + FIGMA_LABEL_OFFSET_Y}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function DiagramLine({ d }: { d: string }) {
  return (
    <g className="rj-compounding__diagram-fade">
      <path
        className="rj-compounding__diagram-line rj-compounding__diagram-line--base"
        d={d}
      />
      <path
        className="rj-compounding__diagram-line rj-compounding__diagram-line--draw"
        d={d}
      />
    </g>
  );
}

/** Inline wordmark — external `<image>` ignores CSS fill/filter in many browsers. */
function UxlabDiagramLogo({ x, y }: { x: number; y: number }) {
  return (
    <svg
      className="rj-compounding__diagram-logo"
      x={x}
      y={y}
      width={UX_LOGO_W}
      height={UX_LOGO_H}
      viewBox="0 0 104 14.919"
      aria-hidden="true"
    >
      <path
        fill="#ffffff"
        d="M 3.116 8.458 C 3.116 9.138 3.206 9.769 3.422 10.321 C 3.671 10.951 4.121 11.433 4.698 11.78 L 4.715 11.79 L 4.733 11.8 C 5.316 12.118 6.061 12.317 6.914 12.438 L 6.923 12.44 L 6.932 12.441 C 7.785 12.545 8.867 12.594 10.167 12.594 C 11.159 12.594 12.018 12.535 12.729 12.409 C 13.448 12.281 14.094 12.06 14.619 11.705 C 15.146 11.347 15.545 10.867 15.78 10.271 C 16.012 9.724 16.111 9.111 16.111 8.458 L 16.111 0.187 L 19.275 0.187 L 19.275 8.458 C 19.275 10.683 18.538 12.223 17.149 13.248 C 15.704 14.313 13.426 14.919 10.167 14.919 C 8.271 14.919 6.672 14.768 5.36 14.477 C 4.048 14.186 3.011 13.76 2.217 13.224 C 1.445 12.692 0.895 12.054 0.539 11.309 C 0.189 10.528 0 9.585 0 8.458 L 0 0.187 L 3.116 0.187 L 3.116 8.458 Z"
      />
      <path
        fill="#ffffff"
        d="M 29.017 5.716 L 29.656 5.086 L 34.561 0.268 L 38.26 0.268 L 34.941 3.351 C 34.387 3.865 33.92 4.3 33.537 4.656 C 33.212 4.945 32.887 5.235 32.562 5.525 C 32.296 5.748 32.068 5.94 31.877 6.101 C 31.705 6.244 31.551 6.37 31.414 6.478 L 30.402 7.278 L 31.469 8 C 31.582 8.076 31.717 8.179 31.877 8.312 C 32.029 8.438 32.244 8.632 32.526 8.904 L 32.536 8.914 L 32.546 8.923 C 32.828 9.178 33.184 9.507 33.615 9.912 L 35.25 11.449 L 38.69 14.732 L 34.368 14.732 L 28.524 8.979 L 22.5 14.732 L 19.042 14.732 L 22.546 11.451 L 22.546 11.451 C 23.05 10.978 23.559 10.51 24.071 10.047 L 24.086 10.034 C 24.422 9.718 24.762 9.405 25.105 9.096 C 25.315 8.906 25.528 8.72 25.745 8.538 C 25.93 8.397 26.096 8.269 26.239 8.155 L 27.178 7.415 L 26.239 6.673 C 26.081 6.549 25.922 6.427 25.76 6.308 C 25.552 6.133 25.346 5.954 25.143 5.772 C 24.866 5.506 24.521 5.189 24.11 4.819 C 23.589 4.329 23.071 3.835 22.556 3.338 L 22.552 3.334 L 19.329 0.268 L 23.523 0.268 L 29.017 5.716 Z M 42.031 0.268 L 42.031 12.406 L 53.157 12.406 L 51.373 14.731 L 38.891 14.731 L 38.891 0.268 L 42.031 0.268 Z M 64.453 0 C 65.062 0 65.49 0.143 65.798 0.365 L 65.811 0.375 L 65.825 0.384 C 66.237 0.659 66.592 1.013 66.87 1.427 L 66.872 1.428 L 75.923 14.732 L 60.778 14.732 L 62.442 12.406 L 67.506 12.406 C 68.019 12.406 68.449 12.421 68.801 12.451 L 70.895 12.629 L 69.601 10.939 C 69.337 10.591 69.081 10.237 68.833 9.877 C 68.697 9.661 68.559 9.447 68.418 9.234 L 67.991 8.605 L 64.372 3.184 L 56.331 14.732 L 52.697 14.732 L 61.973 1.446 C 62.246 1.063 62.598 0.708 63.039 0.386 C 63.362 0.151 63.811 0 64.453 0 Z"
      />
      <path
        fill="#ffffff"
        d="M 89.819 0.188 C 90.721 0.188 91.511 0.28 92.195 0.453 L 92.216 0.459 C 92.908 0.616 93.456 0.858 93.884 1.166 L 93.897 1.175 L 93.909 1.183 C 94.347 1.475 94.659 1.829 94.87 2.245 L 94.878 2.26 L 94.886 2.274 C 95.1 2.664 95.225 3.152 95.225 3.768 C 95.225 4.175 95.171 4.499 95.084 4.754 C 94.994 5.024 94.865 5.28 94.703 5.513 L 94.696 5.522 C 94.567 5.708 94.407 5.87 94.224 6.002 C 94.047 6.127 93.854 6.228 93.651 6.302 L 90.962 7.266 L 93.696 8.087 C 94.209 8.241 94.645 8.54 95.015 9.015 L 95.019 9.022 L 95.024 9.027 C 95.358 9.443 95.561 10.016 95.561 10.826 C 95.561 11.408 95.473 11.931 95.306 12.404 C 95.159 12.808 94.905 13.173 94.52 13.501 C 94.152 13.815 93.608 14.099 92.841 14.32 L 92.836 14.321 C 92.113 14.532 91.156 14.651 89.939 14.651 L 76.718 14.651 L 76.718 6.586 L 90.035 6.586 C 90.524 6.586 90.998 6.489 91.426 6.258 L 91.442 6.249 C 92.102 5.877 92.349 5.211 92.35 4.55 C 92.35 3.889 92.088 3.226 91.406 2.88 C 90.979 2.663 90.516 2.562 90.035 2.562 L 77.724 2.562 L 79.605 0.188 Z M 79.883 12.326 L 89.964 12.326 C 90.573 12.326 91.226 12.225 91.714 11.829 C 92.217 11.42 92.422 10.839 92.422 10.24 C 92.422 9.655 92.214 9.089 91.714 8.701 C 91.705 8.694 91.694 8.686 91.685 8.678 L 91.683 8.678 C 91.198 8.301 90.561 8.204 89.964 8.204 L 79.883 8.204 Z"
      />
      <path
        fill="#ffffff"
        d="M 101.07 6 C 100.553 6.004 100.044 5.864 99.598 5.596 C 99.158 5.333 98.792 4.958 98.535 4.508 C 98.274 4.051 98.137 3.53 98.141 3 C 98.141 2.456 98.272 1.956 98.535 1.5 C 98.791 1.046 99.157 0.669 99.598 0.404 C 100.044 0.136 100.553 -0.004 101.07 0 C 101.602 0 102.09 0.135 102.535 0.404 C 102.98 0.667 103.349 1.045 103.606 1.5 C 103.868 1.954 104.004 2.473 104 3 C 104 3.544 103.869 4.047 103.606 4.508 C 103.347 4.96 102.978 5.335 102.535 5.596 C 102.092 5.865 101.586 6.005 101.07 6 Z M 101.07 5.399 C 101.481 5.402 101.884 5.291 102.238 5.077 C 102.591 4.869 102.883 4.567 103.083 4.203 C 103.291 3.839 103.4 3.423 103.397 3 C 103.397 2.561 103.292 2.156 103.083 1.789 C 102.883 1.425 102.591 1.123 102.238 0.915 C 101.884 0.701 101.481 0.59 101.07 0.593 C 100.655 0.59 100.246 0.701 99.887 0.915 C 99.536 1.126 99.245 1.427 99.042 1.789 C 98.838 2.158 98.733 2.576 98.736 3 C 98.736 3.434 98.839 3.835 99.042 4.203 C 99.245 4.565 99.536 4.866 99.887 5.077 C 100.246 5.291 100.655 5.402 101.07 5.399 Z M 99.92 4.64 L 99.92 1.36 L 101.216 1.36 C 101.57 1.36 101.843 1.451 102.036 1.632 C 102.23 1.808 102.326 2.044 102.326 2.341 C 102.326 2.582 102.251 2.789 102.101 2.959 C 101.956 3.124 101.763 3.236 101.521 3.297 L 102.294 4.64 L 101.642 4.64 L 100.893 3.321 L 100.515 3.321 L 100.515 4.64 Z M 101.199 2.819 C 101.382 2.819 101.518 2.777 101.61 2.695 C 101.701 2.607 101.746 2.489 101.746 2.341 C 101.746 2.192 101.701 2.08 101.61 2.003 C 101.518 1.92 101.382 1.879 101.199 1.879 L 100.515 1.879 L 100.515 2.819 Z"
      />
    </svg>
  );
}

/** CRO flywheel — fork/join branches match product flow screenshot. */
function CroFlywheelDiagram() {
  const {
    revenueX,
    dataX,
    productX,
    frictionX,
    pillarX,
    hypoX,
    convX,
    testX,
    winnerX,
    reportingX,
    growthX,
    frameW: figmaFrameW,
  } = layoutFlywheelChain();

  const uxX = 0;
  const uxY = FIGMA_ROW_CY - UX_NODE_H / 2;
  const uxRight = uxX + UX_NODE_W;

  const productTops = [89, 241, 393] as const;
  const productCenters = productTops.map(nodeCenterY);

  const pillarTops = [1, 121, 241, 361, 481] as const;
  const pillarCenters = pillarTops.map(nodeCenterY);

  const testTops = [89, 241, 393] as const;
  const testCenters = testTops.map(nodeCenterY);

  const nodeRight = (x: number) => x + STEP_NODE_W;

  const b1EnterCx = spineX(nodeRight(dataX), productX);
  const b1ExitCx = spineX(nodeRight(productX), frictionX);
  const b2EnterCx = spineX(nodeRight(frictionX), pillarX);
  const b2ExitCx = spineX(nodeRight(pillarX), hypoX);
  const b3EnterCx = spineX(nodeRight(convX), testX);
  const b3ExitCx = spineX(nodeRight(testX), winnerX);

  const hRow = (fromRight: number, toLeft: number) =>
    `M ${fromRight - 1} ${FIGMA_ROW_CY} H ${toLeft + 1}`;

  const stubIn = (spineX: number, nodeLeft: number, cy: number) =>
    `M ${spineX} ${cy} H ${nodeLeft - 1}`;

  const stubOut = (nodeRight: number, spineX: number, cy: number) =>
    `M ${nodeRight + 1} ${cy} H ${spineX}`;

  const vertSpine = (spineX: number, centers: readonly number[]) =>
    `M ${spineX} ${centers[0]} V ${centers[centers.length - 1]}`;

  return (
    <svg
      className="rj-compounding__diagram-svg"
      viewBox={`0 0 ${figmaFrameW} ${FIGMA_FRAME_H}`}
      width={figmaFrameW}
      height={FIGMA_FRAME_H}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label="CRO flywheel from revenue goals through experimentation to compounding growth"
    >
      <DiagramLine d={hRow(uxRight, revenueX)} />
      <DiagramLine d={hRow(nodeRight(revenueX), dataX)} />

      {/* Data → product fork → merge → Friction */}
      <DiagramLine d={hRow(nodeRight(dataX), b1EnterCx)} />
      <DiagramLine d={vertSpine(b1EnterCx, productCenters)} />
      <DiagramLine d={stubIn(b1EnterCx, productX, productCenters[0])} />
      <DiagramLine d={stubIn(b1EnterCx, productX, productCenters[1])} />
      <DiagramLine d={stubIn(b1EnterCx, productX, productCenters[2])} />
      <DiagramLine d={stubOut(nodeRight(productX), b1ExitCx, productCenters[0])} />
      <DiagramLine d={stubOut(nodeRight(productX), b1ExitCx, productCenters[1])} />
      <DiagramLine d={stubOut(nodeRight(productX), b1ExitCx, productCenters[2])} />
      <DiagramLine d={vertSpine(b1ExitCx, productCenters)} />
      <DiagramLine d={hRow(b1ExitCx, frictionX)} />

      {/* Friction → pillar fork → merge → Hypothesis */}
      <DiagramLine d={hRow(nodeRight(frictionX), b2EnterCx)} />
      <DiagramLine d={vertSpine(b2EnterCx, pillarCenters)} />
      <DiagramLine d={stubIn(b2EnterCx, pillarX, pillarCenters[0])} />
      <DiagramLine d={stubIn(b2EnterCx, pillarX, pillarCenters[1])} />
      <DiagramLine d={stubIn(b2EnterCx, pillarX, pillarCenters[2])} />
      <DiagramLine d={stubIn(b2EnterCx, pillarX, pillarCenters[3])} />
      <DiagramLine d={stubIn(b2EnterCx, pillarX, pillarCenters[4])} />
      <DiagramLine d={stubOut(nodeRight(pillarX), b2ExitCx, pillarCenters[0])} />
      <DiagramLine d={stubOut(nodeRight(pillarX), b2ExitCx, pillarCenters[1])} />
      <DiagramLine d={stubOut(nodeRight(pillarX), b2ExitCx, pillarCenters[2])} />
      <DiagramLine d={stubOut(nodeRight(pillarX), b2ExitCx, pillarCenters[3])} />
      <DiagramLine d={stubOut(nodeRight(pillarX), b2ExitCx, pillarCenters[4])} />
      <DiagramLine d={vertSpine(b2ExitCx, pillarCenters)} />
      <DiagramLine d={hRow(b2ExitCx, hypoX)} />

      <DiagramLine d={hRow(nodeRight(hypoX), convX)} />

      {/* Conversion → test fork → merge → Winner */}
      <DiagramLine d={hRow(nodeRight(convX), b3EnterCx)} />
      <DiagramLine d={vertSpine(b3EnterCx, testCenters)} />
      <DiagramLine d={stubIn(b3EnterCx, testX, testCenters[0])} />
      <DiagramLine d={stubIn(b3EnterCx, testX, testCenters[1])} />
      <DiagramLine d={stubIn(b3EnterCx, testX, testCenters[2])} />
      <DiagramLine d={stubOut(nodeRight(testX), b3ExitCx, testCenters[0])} />
      <DiagramLine d={stubOut(nodeRight(testX), b3ExitCx, testCenters[1])} />
      <DiagramLine d={stubOut(nodeRight(testX), b3ExitCx, testCenters[2])} />
      <DiagramLine d={vertSpine(b3ExitCx, testCenters)} />
      <DiagramLine d={hRow(b3ExitCx, winnerX)} />

      <DiagramLine d={hRow(nodeRight(winnerX), reportingX)} />
      <DiagramLine d={hRow(nodeRight(reportingX), growthX)} />

      <g className="rj-compounding__diagram-shape rj-compounding__diagram-fade">
        <rect
          className="rj-compounding__diagram-node rj-compounding__diagram-node--primary rj-compounding__diagram-node--ux"
          x={uxX}
          y={uxY}
          width={UX_NODE_W}
          height={UX_NODE_H}
          rx={FIGMA_NODE_RX}
        />
        <UxlabDiagramLogo
          x={uxX + (UX_NODE_W - UX_LOGO_W) / 2}
          y={uxY + (UX_NODE_H - UX_LOGO_H) / 2}
        />
      </g>

      <DiagramNode
        x={revenueX}
        y={241}
        label="Revenue Goals"
       
      />
      <DiagramNode
        x={dataX}
        y={241}
        label="Data & Analytics"
       
      />

      <DiagramNode
        x={productX}
        y={productTops[0]}
        label="Landing Pages"
       
      />
      <DiagramNode
        x={productX}
        y={productTops[1]}
        label="Signup & Onboarding"
       
      />
      <DiagramNode
        x={productX}
        y={productTops[2]}
        label="Checkout & Pricing"
       
      />

      <DiagramNode
        x={frictionX}
        y={241}
        label="Friction Scoring"
       
      />

      <DiagramNode
        x={pillarX}
        y={pillarTops[0]}
        label="Clarity"
       
      />
      <DiagramNode
        x={pillarX}
        y={pillarTops[1]}
        label="Trust"
       
      />
      <DiagramNode
        x={pillarX}
        y={pillarTops[2]}
        label="Motivation"
       
      />
      <DiagramNode
        x={pillarX}
        y={pillarTops[3]}
        label="Usability"
       
      />
      <DiagramNode
        x={pillarX}
        y={pillarTops[4]}
        label="Speed"
       
      />

      <DiagramNode
        x={hypoX}
        y={241}
        label="Hypothesis Backlog"
       
      />
      <DiagramNode
        x={convX}
        y={241}
        label="Conversion Design"
       
      />

      <DiagramNode
        x={testX}
        y={testTops[0]}
        label="Landing Page Tests"
       
      />
      <DiagramNode
        x={testX}
        y={testTops[1]}
        label="Product Flow Tests"
       
      />
      <DiagramNode
        x={testX}
        y={testTops[2]}
        label="Pricing Tests"
       
      />

      <DiagramNode
        x={winnerX}
        y={241}
        label="Winner Rollout"
       
      />
      <DiagramNode
        x={reportingX}
        y={241}
        label="Revenue Reporting"
       
      />
      <DiagramNode
        x={growthX}
        y={241}
        label="Compounding Growth"
       
      />
    </svg>
  );
}

export function GrowthCompoundingSection({
  sectionId = "results",
  ariaLabel = "The problem with CRO and the modern CRO flywheel",
}: {
  sectionId?: string;
  ariaLabel?: string;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const pinHeightRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const problemTitleRef = useRef<HTMLHeadingElement>(null);
  const flywheelTitleRef = useRef<HTMLHeadingElement>(null);
  const flywheelLedeRef = useRef<HTMLParagraphElement>(null);
  const diagramClipRef = useRef<HTMLDivElement>(null);
  const diagramTrackRef = useRef<HTMLDivElement>(null);
  const flywheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pinHeight = pinHeightRef.current;
    const pin = pinRef.current;
    const problemTitle = problemTitleRef.current;
    const flywheelTitle = flywheelTitleRef.current;
    const flywheelLede = flywheelLedeRef.current;
    const diagramClip = diagramClipRef.current;
    const diagramTrack = diagramTrackRef.current;
    const flywheel = flywheelRef.current;
    if (
      !root ||
      !pinHeight ||
      !pin ||
      !problemTitle ||
      !flywheelTitle ||
      !flywheelLede ||
      !diagramClip ||
      !diagramTrack ||
      !flywheel
    ) {
      return;
    }

    const cleanups: Array<() => void> = [];
    cleanups.push(createAwardsCharReveal(problemTitle, { start: "top 88%" }));
    cleanups.push(
      createAwardsCharReveal(flywheelTitle, {
        start: "top 88%",
        delay: 0.12,
      }),
    );
    cleanups.push(
      createTextReveal(flywheelLede, {
        start: "top 88%",
        delay: 0.55,
        duration: 1,
      }),
    );

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const motionMq = window.matchMedia(MOTION_MQ);
    let stackCtx: gsap.Context | null = null;

    const getDiagramScale = () => {
      const svg = diagramTrack.querySelector<SVGSVGElement>(
        ".rj-compounding__diagram-svg",
      );
      const { frameW } = layoutFlywheelChain();
      if (!svg || frameW <= 0) return 1;
      return svg.getBoundingClientRect().width / frameW;
    };

    const getRightColCenterX = (clipRect: DOMRect) => {
      const inner = root.querySelector<HTMLElement>(".rj-compounding__inner");
      if (inner) {
        const innerRect = inner.getBoundingClientRect();
        return innerRect.left + innerRect.width * RIGHT_COL_CENTER_FRAC;
      }
      return clipRect.left + clipRect.width * RIGHT_COL_CENTER_FRAC;
    };

    /** Center the UXLAB node in the right column at scroll 0; stay clear of the card. */
    const panStart = () => {
      const clipRect = diagramClip.getBoundingClientRect();
      const rightColCenterX = getRightColCenterX(clipRect);
      const scale = getDiagramScale();
      let startX =
        rightColCenterX - (UX_NODE_W / 2) * scale - clipRect.left;
      const card = root.querySelector<HTMLElement>(
        ".rj-compounding__problem-card",
      );
      if (card) {
        const cardRect = card.getBoundingClientRect();
        startX = Math.max(startX, cardRect.right + 16 - clipRect.left);
      }
      return Math.max(0, startX);
    };

    const updateDiagramFade = () => {
      const clip = diagramClip.getBoundingClientRect();
      if (clip.width <= 0) return;
      const fadeZone = gsap.utils.clamp(100, 240, clip.width * 0.2);
      const targets = getDiagramFadeTargets();
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < clip.top || r.top > clip.bottom) return;
        if (r.right < clip.left) {
          gsap.set(el, { opacity: 1 });
          return;
        }
        if (r.left > clip.right) {
          gsap.set(el, { opacity: 0.08 });
          return;
        }
        const reveal = (clip.right - r.left) / fadeZone;
        gsap.set(el, { opacity: gsap.utils.clamp(0.08, 1, reveal) });
      });
    };

    /** Center Compounding Growth in the right column at scroll 1 (same axis as UXLAB at 0). */
    const panEnd = () => {
      const clipRect = diagramClip.getBoundingClientRect();
      const rightColCenterX = getRightColCenterX(clipRect);
      const { growthX } = layoutFlywheelChain();
      const scale = getDiagramScale();
      const growthCenterPx = (growthX + STEP_NODE_W / 2) * scale;
      return rightColCenterX - clipRect.left - growthCenterPx;
    };

    /** Mobile: UXLAB flush left at scroll 0. */
    const panStartMobile = () => 0;

    /** Mobile: pan until Compounding Growth is in view at the right edge. */
    const panEndMobile = () => {
      const clipRect = diagramClip.getBoundingClientRect();
      const svg = diagramTrack.querySelector<SVGSVGElement>(
        ".rj-compounding__diagram-svg",
      );
      if (!svg || clipRect.width <= 0) return 0;
      const trackWidth = svg.getBoundingClientRect().width;
      const pan = clipRect.width - trackWidth;
      return pan < 0 ? pan : 0;
    };

    const getDiagramFadeTargets = () =>
      diagramTrack.querySelectorAll<SVGElement>(".rj-compounding__diagram-fade");

    const teardownStack = () => {
      stackCtx?.revert();
      stackCtx = null;
    };

    const setupStack = () => {
      teardownStack();
      pinHeight.style.removeProperty("height");

      if (motionMq.matches) {
        gsap.set(diagramTrack, { clearProps: "transform" });
        gsap.set(getDiagramFadeTargets(), { opacity: 1 });
        return;
      }

      const fadeTargets = getDiagramFadeTargets();

      if (desktopMq.matches) {
        stackCtx = gsap.context(() => {
          const scrollDuration = 1;
          pinHeight.style.height = `${Math.round(140 * 1.4)}vh`;

          gsap.set(fadeTargets, { opacity: 0.08 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinHeight,
              start: "top top",
              end: "bottom bottom",
              pin,
              pinSpacing: false,
              anticipatePin: 0,
              scrub: 1.1,
              invalidateOnRefresh: true,
              onUpdate: updateDiagramFade,
            },
          });

          tl.fromTo(
            diagramTrack,
            {
              x: () => panStart(),
              y: 0,
              force3D: true,
            },
            {
              x: () => panEnd(),
              ease: "none",
              duration: scrollDuration,
            },
            0,
          );

          requestAnimationFrame(updateDiagramFade);
        }, root);
        return;
      }

      stackCtx = gsap.context(() => {
        const scrollDuration = 1;
        const mobileScrollVh = 92;

        gsap.set(fadeTargets, { opacity: 0.08 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: flywheel,
            start: "top top",
            end: `+=${mobileScrollVh}%`,
            pin,
            pinSpacing: true,
            anticipatePin: 0,
            scrub: 0.85,
            invalidateOnRefresh: true,
            onUpdate: updateDiagramFade,
          },
        });

        tl.fromTo(
          diagramTrack,
          {
            x: () => panStartMobile(),
            y: 0,
            force3D: true,
          },
          {
            x: () => panEndMobile(),
            ease: "none",
            duration: scrollDuration,
          },
          0,
        );

        requestAnimationFrame(updateDiagramFade);
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

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(() => requestAnimationFrame(refresh));
    if (document.fonts?.ready) {
      void document.fonts.ready.then(refresh);
    }

    return () => {
      cleanups.forEach((fn) => fn());
      teardownStack();
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
          <div className="rj-compounding__inner">
            <div className="rj-compounding__diagram-layer">
              <div className="rj-compounding__diagram-panel">
                <div ref={diagramClipRef} className="rj-compounding__diagram-wrap">
                  <div ref={diagramTrackRef} className="rj-compounding__diagram-track">
                    <CroFlywheelDiagram />
                  </div>
                  <div
                    className="rj-compounding__diagram-edge-fade"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <article className="rj-compounding__problem-card">
              <div className="rj-compounding__problem-header">
                <h2
                  ref={problemTitleRef}
                  className="rj-compounding__problem-title rj-awards-title"
                >
                  <span className="rj-compounding__problem-title-line rj-compounding__problem-title-line--lead">
                    The problem with
                  </span>
                  <span className="rj-compounding__problem-title-line rj-compounding__problem-title-line--punch">
                    CRO in 2026
                  </span>
                </h2>
                <p className="rj-compounding__problem-lede">
                  More traffic no longer means revenue. Teams stall on
                  guesswork and idle tools.
                </p>
              </div>
              <div className="rj-compounding__problem-panels">
                <CheckPanel
                  title="What your problems are:"
                  items={PROBLEM_ITEMS}
                  iconVariant="negative"
                />
                <CheckPanel
                  title="What you need:"
                  items={NEED_ITEMS}
                  iconVariant="positive"
                />
              </div>
            </article>

            <div ref={flywheelRef} className="rj-compounding__flywheel">
              <div className="rj-compounding__flywheel-copy">
                <h2
                  ref={flywheelTitleRef}
                  className="rj-compounding__flywheel-title rj-awards-title"
                >
                  <span className="rj-compounding__flywheel-title-line">
                    The modern
                  </span>
                  <span className="rj-compounding__flywheel-title-line">
                    CRO flywheel
                  </span>
                </h2>
                <p
                  ref={flywheelLedeRef}
                  className="rj-compounding__flywheel-lede rj-text-reveal"
                >
                  Finds leaks, tests fixes, and ships winners. Each round starts
                  from a better product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
