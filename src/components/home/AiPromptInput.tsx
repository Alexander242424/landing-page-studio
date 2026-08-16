import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/brand/Logo";
import {
  OPEN_LEAD_CHAT_EVENT,
  OPEN_NEWSLETTER_CHAT_EVENT,
  askPlaceholderForService,
  leadCompanyPromptForService,
  leadGoalForService,
  leadIntroForService,
  serviceSystemContext,
  type AskChatServiceContext,
  type OpenLeadChatDetail,
} from "@/lib/askChat";
import { generateWithGeminiFlash } from "@/lib/ai.functions";
import { logChatEvent } from "@/lib/chatPersistence";
import { trackEvent } from "@/lib/analytics/tracker";
import { mountCalInline } from "@/lib/cal";
import {
  CRO,
  CRO_PLACEHOLDER,
  CRO_SCAN_DURATION_MS,
  CRO_SCAN_STEPS,
  type CroAuditAnswers,
  type CroAuditStep,
  faviconUrlForDomain,
  normalizeAuditUrl,
} from "@/lib/croAudit";
import {
  resolveChatActions,
  resolveGeneralActionIntent,
  type ChatAction,
  type ChatActionId,
} from "@/lib/chatActions";
import { UXLAB_SYSTEM_PROMPT } from "@/lib/uxlabKnowledge";
import { ChatMarkdown } from "@/lib/chatMarkdown";

gsap.registerPlugin(ScrollTrigger);

/** Show dock around the middle of the showreel (#home-reel). */
const DOCK_REEL_PROGRESS = 0.45;

const TIPS = [
  "Book a call",
  "Help me pick a service",
  "Ballpark on pricing",
  "CRO Audit",
] as const;

const PLACEHOLDER_PROMPTS = [
  "Ask about UXLAB…",
  "How do you improve conversion?",
  "Share a URL for a quick look",
] as const;

const TYPE_MS = 38;
const DELETE_MS = 22;
const HOLD_MS = 2200;
const GAP_MS = 480;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  streaming?: boolean;
};

/** Scripted “Let’s talk” lead capture. */
type LeadStep = "email" | "goal" | "company" | "done";

const LEAD = {
  emailRetry: "Please share a valid email so we can reach you.",
  goal: "Thanks. What’s your main goal right now?",
  company: "Got it. Which company are you with?",
  done: "Perfect. An expert from UXLAB will reach out within 12 hours.",
} as const;

const LEAD_PLACEHOLDER: Record<LeadStep, string> = {
  email: "Your email…",
  goal: "Your goal…",
  company: "Company name…",
  done: "Ask anything…",
};

/** Scripted newsletter subscribe capture. */
type NewsletterStep = "email" | "done";

const NEWSLETTER = {
  intro:
    "Happy to keep you in the loop. What’s the best email for our newsletter?",
  emailRetry: "Please share a valid email so we can subscribe you.",
  done: "You’re on the list — thanks. We’ll send thoughtful updates, not noise.",
} as const;

const NEWSLETTER_PLACEHOLDER: Record<NewsletterStep, string> = {
  email: "Your email…",
  done: "Ask anything…",
};

const PRICING_REPLY = [
  "Directional ranges, not quotes — but enough to know if we’re in the same universe:",
  "",
  "Brand — $15K–$40K. Identity, positioning, marketing sites.",
  "Product Design — $35K–$75K. UI/UX, design systems, user testing.",
  "Design + Build — $75K minimum. End-to-end design and engineering.",
  "MVP Sprint — $40K fixed. Fast, focused build to validate.",
  "Ongoing Partnership — Retainer-based. Consistent design and dev support.",
  "",
  "But I’m just an AI — you’d have to talk to the team for real numbers.",
].join("\n");

type ScanCardState = {
  domain: string;
  favicon: string;
  progress: number;
  stepIndex: number;
  done: boolean;
};

function isPricingIntent(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t === "pricing" || t === "ballpark on pricing") return true;
  return /\b(pric(?:e|ing)|costs?|budget|ballpark)\b/i.test(t);
}

function isCroAuditIntent(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t === "cro audit" || t === "cro") return true;
  return /\b(cro\s*audit|conversion\s*(rate\s*)?audit|audit\s*(my\s*)?(funnel|site|page|landing))\b/i.test(
    t,
  );
}

/** Call / calendar booking intents (CTA + free text). */
function isCallIntent(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (
    /^(book\s+(a\s+)?call|schedule(\s+a\s+(call|meeting))?|meeting|call|zoom|cal)$/i.test(
      t,
    )
  ) {
    return true;
  }
  return /\b(book\s+(a\s+)?call|schedule(\s+a)?\s+(call|meeting)|book\s+(a\s+)?meeting|(hop|jump)\s+on\s+(a\s+)?call|set\s+up\s+(a\s+)?(call|meeting)|zoom(\s+call|\s+meeting)?|calendly|cal\.com)\b/i.test(
    t,
  );
}

const CAL_INTRO =
  "Pick a time that works — the calendar is right here in chat.";

function SendIcon() {
  return (
    <svg
      className="rj-ask__icon rj-ask__icon--send"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 19V7M7.5 11.5 12 7l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatCloseIcon() {
  return (
    <svg className="rj-ask__chat-x" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Progressive reveal — ~2× slower / finer than before. */
async function revealAssistantText(
  fullText: string,
  onFrame: (partial: string) => void,
  signal: { cancelled: boolean },
) {
  const text = fullText.trim();
  if (!text) {
    onFrame("I couldn’t generate a reply. Try again in a moment.");
    return;
  }

  onFrame("");
  let i = 0;
  while (i < text.length) {
    if (signal.cancelled) return;
    // Prefer 1 char; only nudge to 2 on very long replies so it stays fluid
    const chunk = text.length > 480 ? 2 : 1;
    i = Math.min(i + chunk, text.length);
    onFrame(text.slice(0, i));
    const ch = text[i - 1];
    const pause =
      ch === "." || ch === "?" || ch === "!"
        ? 56 + Math.random() * 18
        : ch === "," || ch === ";" || ch === ":"
          ? 28 + Math.random() * 12
          : ch === "\n"
            ? 40 + Math.random() * 16
            : 14 + Math.random() * 18;
    await sleep(pause);
  }
}

function ThinkingIndicator() {
  return (
    <div
      className="rj-ask__thinking"
      role="status"
      aria-live="polite"
      aria-label="Thinking"
    >
      <span className="rj-ask__thinking-label">Thinking</span>
      <span className="rj-ask__thinking-dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}

function CroScanCard({ scan }: { scan: ScanCardState }) {
  const label = scan.done
    ? "Scan complete"
    : CRO_SCAN_STEPS[scan.stepIndex] ?? CRO_SCAN_STEPS[0];
  const pct = Math.min(100, Math.round(scan.progress * 100));

  return (
    <div
      className={`rj-ask__scan${scan.done ? " is-done" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Scanning ${scan.domain}`}
    >
      <div className="rj-ask__scan-top">
        <div className="rj-ask__scan-favicon-wrap">
          <img
            className="rj-ask__scan-favicon"
            src={scan.favicon}
            alt=""
            width={28}
            height={28}
            loading="eager"
            decoding="async"
          />
          {!scan.done ? (
            <span className="rj-ask__scan-ring" aria-hidden="true" />
          ) : null}
        </div>
        <div className="rj-ask__scan-meta">
          <span className="rj-ask__scan-domain">{scan.domain}</span>
          <span className="rj-ask__scan-label">{label}</span>
        </div>
      </div>

      <div
        className="rj-ask__scan-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <span
          className="rj-ask__scan-bar-fill"
          style={{ transform: `scaleX(${scan.progress})` }}
        />
      </div>

      <ul className="rj-ask__scan-checklist">
        {CRO_SCAN_STEPS.map((step, i) => {
          const complete = scan.done || i < scan.stepIndex;
          const active = !scan.done && i === scan.stepIndex;
          return (
            <li
              key={step}
              className={`rj-ask__scan-item${complete ? " is-complete" : ""}${active ? " is-active" : ""}`}
            >
              <span className="rj-ask__scan-check" aria-hidden="true" />
              <span>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function useTypewriterPlaceholder(paused: boolean) {
  const [placeholder, setPlaceholder] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      const phrase = PLACEHOLDER_PROMPTS[indexRef.current];
      const deleting = deletingRef.current;

      if (!deleting) {
        charRef.current = Math.min(charRef.current + 1, phrase.length);
        setPlaceholder(phrase.slice(0, charRef.current));

        if (charRef.current === phrase.length) {
          deletingRef.current = true;
          timerRef.current = setTimeout(tick, HOLD_MS);
          return;
        }

        timerRef.current = setTimeout(tick, TYPE_MS);
        return;
      }

      charRef.current = Math.max(charRef.current - 1, 0);
      setPlaceholder(phrase.slice(0, charRef.current));

      if (charRef.current === 0) {
        deletingRef.current = false;
        indexRef.current = (indexRef.current + 1) % PLACEHOLDER_PROMPTS.length;
        timerRef.current = setTimeout(tick, GAP_MS);
        return;
      }

      timerRef.current = setTimeout(tick, DELETE_MS);
    };

    timerRef.current = setTimeout(tick, GAP_MS);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused]);

  return paused ? "" : placeholder;
}

/**
 * Fixed bottom Apple-style ask bar + chat panel (same width as input).
 * Gemini 3 Flash via Lovable gateway, grounded on UXLAB.
 * “Let’s talk” / footer “Get in touch” runs scripted lead capture.
 * Footer “Subscribe” runs a newsletter email capture in the same ask bar.
 * CRO Audit runs a scripted URL → scan → name → email flow.
 * Call / “Book a call” opens an inline Cal.com calendar in the chat.
 */
export function AiPromptInput() {
  const inputId = useId();
  const calContainerId = `my-cal-inline-30min-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLFormElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef({ cancelled: false });
  const leadStepRef = useRef<LeadStep | null>(null);
  const leadAnswersRef = useRef({ email: "", goal: "", company: "" });
  const newsletterStepRef = useRef<NewsletterStep | null>(null);
  const newsletterEmailRef = useRef("");
  const croStepRef = useRef<CroAuditStep | null>(null);
  const croAnswersRef = useRef<CroAuditAnswers>({
    url: "",
    domain: "",
    name: "",
    email: "",
  });
  const scanRafRef = useRef<number | null>(null);
  const dockShownPrevRef = useRef(false);
  const dockTlRef = useRef<gsap.core.Timeline | null>(null);
  /** CTA strip already shown once in this general thread. */
  const actionsShownRef = useRef(false);
  /** Cal / lead / CRO capture already in play this session. */
  const commercialStartedRef = useRef(false);
  /** Solutions card that opened this contact session (if any). */
  const leadServiceRef = useRef<AskChatServiceContext | null>(null);

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  /** Past ~mid showreel — toggles dock visibility. */
  const [pastDockGate, setPastDockGate] = useState(false);
  /** First-section (hero copy) is in view — hide tip chips, keep the input. */
  const [inFirstSection, setInFirstSection] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep | null>(null);
  const [newsletterStep, setNewsletterStep] = useState<NewsletterStep | null>(
    null,
  );
  const [croStep, setCroStep] = useState<CroAuditStep | null>(null);
  const [scanCard, setScanCard] = useState<ScanCardState | null>(null);
  const [chatActions, setChatActions] = useState<ChatAction[]>([]);
  const [showCal, setShowCal] = useState(false);
  const [inputHint, setInputHint] = useState<string | null>(null);

  function clearChatActions() {
    setChatActions([]);
  }

  function showResolvedActions(
    input: Parameters<typeof resolveChatActions>[0],
  ) {
    const actions = resolveChatActions(input);
    if (actions.length === 0) return;
    setChatActions(actions);
    actionsShownRef.current = true;
  }

  const scanning = croStep === "scanning";
  const canSend = Boolean(value.trim()) && !pending && !scanning;
  const animationPaused = open || focused || Boolean(value.trim());
  const rotatingPlaceholder = useTypewriterPlaceholder(animationPaused);

  const placeholder = open
    ? croStep
      ? CRO_PLACEHOLDER[croStep]
      : leadStep
        ? LEAD_PLACEHOLDER[leadStep]
        : newsletterStep
          ? NEWSLETTER_PLACEHOLDER[newsletterStep]
          : (inputHint ?? "Ask anything…")
    : rotatingPlaceholder;

  function focusAskInput() {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function resetNewsletterFlow() {
    newsletterEmailRef.current = "";
    newsletterStepRef.current = null;
    setNewsletterStep(null);
  }

  useEffect(() => {
    leadStepRef.current = leadStep;
  }, [leadStep]);

  useEffect(() => {
    newsletterStepRef.current = newsletterStep;
  }, [newsletterStep]);

  useEffect(() => {
    croStepRef.current = croStep;
  }, [croStep]);

  // Dock: appear once around mid-showreel, then stay (no hide on scroll back).
  // Also visible while chat is open (e.g. Let's talk from the hero).
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let trigger: ScrollTrigger | null = null;

    const latch = () => {
      setPastDockGate(true);
      trigger?.kill();
      trigger = null;
    };

    const attach = () => {
      if (cancelled) return;
      const reel = document.getElementById("home-reel");
      if (!reel) {
        raf = requestAnimationFrame(attach);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: reel,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.progress >= DOCK_REEL_PROGRESS) latch();
        },
        onRefresh: (self) => {
          if (self.progress >= DOCK_REEL_PROGRESS) latch();
        },
      });
      if (trigger.progress >= DOCK_REEL_PROGRESS) latch();
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      trigger?.kill();
    };
  }, []);

  // Tip chips collapse while the hero copy band is on screen; input stays.
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let trigger: ScrollTrigger | null = null;

    const attach = () => {
      if (cancelled) return;
      const hero = document.querySelector<HTMLElement>(".rj-hero");
      if (!hero) {
        raf = requestAnimationFrame(attach);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        onToggle: (self) => setInFirstSection(self.isActive),
        onRefresh: (self) => setInFirstSection(self.isActive),
      });
      setInFirstSection(trigger.isActive);
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      trigger?.kill();
    };
  }, []);

  const dockShown = pastDockGate || open;
  const tipsCollapsed = inFirstSection && !open;

  // Entrance: narrow bar rises (opacity + scale) → stretch to full → chips stagger in.
  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;
    if (dockShown === dockShownPrevRef.current) return;

    const showing = dockShown;
    dockShownPrevRef.current = dockShown;

    const tips = tipsRef.current;
    const chips = chipRefs.current.filter(Boolean) as HTMLButtonElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    dockTlRef.current?.kill();
    dockTlRef.current = null;

    if (showing) {
      root.classList.add("is-shown");

      // Measure dock from tip-chip row natural width (bar must match pills).
      gsap.set(root, { width: "", autoAlpha: 0 });
      if (tips) {
        // Expand tip row for measure without flashing (opacity 0).
        gsap.set(tips, { autoAlpha: 0, gridTemplateRows: "1fr" });
      }
      gsap.set(chips, { autoAlpha: 0 });

      const tipRow = tips?.querySelector<HTMLElement>(".rj-ask__row");
      // Temporarily uncap so scrollWidth reflects all chips + gaps.
      const prevRootWidth = root.style.width;
      const prevDockVar = root.style.getPropertyValue("--rj-ask-dock-width");
      root.style.width = "max-content";
      root.style.maxWidth = "none";
      root.style.setProperty("--rj-ask-dock-width", "max-content");
      if (tipRow) {
        tipRow.style.width = "max-content";
        tipRow.style.maxWidth = "none";
      }
      const chipsNatural =
        tipRow?.scrollWidth ??
        tips?.scrollWidth ??
        chips.reduce((sum, el) => sum + el.offsetWidth, 0) +
          Math.max(0, chips.length - 1) * 8;
      if (tipRow) {
        tipRow.style.width = "";
        tipRow.style.maxWidth = "";
      }
      root.style.width = prevRootWidth;
      root.style.maxWidth = "";
      if (prevDockVar) {
        root.style.setProperty("--rj-ask-dock-width", prevDockVar);
      } else {
        root.style.removeProperty("--rj-ask-dock-width");
      }

      const gutter = window.matchMedia("(max-width: 767px)").matches ? 20 : 32;
      const maxAllowed = Math.max(280, window.innerWidth - gutter);
      const fullWidth = Math.min(Math.max(chipsNatural, 280), maxAllowed);
      const startWidth = Math.max(fullWidth * 0.7, Math.min(280, fullWidth));
      root.style.setProperty("--rj-ask-dock-width", `${Math.round(fullWidth)}px`);

      if (reduced) {
        gsap.set(root, { autoAlpha: 1, width: fullWidth, clearProps: "transform" });
        gsap.set(bar, { autoAlpha: 1, clearProps: "transform" });
        if (tips) gsap.set(tips, { autoAlpha: 1, clearProps: "transform" });
        gsap.set(chips, { autoAlpha: 1, clearProps: "transform" });
        return () => {
          dockShownPrevRef.current = false;
        };
      }

      // Collapse tip row so it doesn’t leave a gap above the bar during phase 1–2.
      if (tips) {
        gsap.set(tips, { autoAlpha: 0, gridTemplateRows: "0fr" });
      }
      gsap.set(chips, { autoAlpha: 0, y: 10, scale: 0.94 });
      gsap.set(root, {
        autoAlpha: 1,
        width: startWidth,
      });
      gsap.set(bar, {
        autoAlpha: 0,
        y: 28,
        scale: 0.9,
        transformOrigin: "50% 100%",
      });

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          gsap.set(root, { clearProps: "width" });
          gsap.set(bar, { clearProps: "transform" });
          if (tips) gsap.set(tips, { clearProps: "gridTemplateRows" });
        },
      });
      dockTlRef.current = tl;

      // 1) Input rises from below with opacity + small scale (already at −30% width)
      tl.to(
        bar,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
        },
        0,
      );
      // 2) Stretch dock to tip-chip width
      tl.to(
        root,
        {
          width: fullWidth,
          duration: 0.6,
        },
        0.32,
      );
      // 3) Tip buttons one-by-one
      if (tips) {
        tl.to(
          tips,
          { autoAlpha: 1, gridTemplateRows: "1fr", duration: 0.28 },
          0.68,
        );
      }
      tl.to(
        chips,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.09,
        },
        0.72,
      );

      return () => {
        tl.kill();
        dockShownPrevRef.current = false;
      };
    }

    if (reduced) {
      root.classList.remove("is-shown");
      gsap.set(root, { autoAlpha: 0, clearProps: "width,transform" });
      gsap.set(bar, { autoAlpha: 0, clearProps: "transform" });
      if (tips) gsap.set(tips, { autoAlpha: 0, clearProps: "transform" });
      gsap.set(chips, { autoAlpha: 0, clearProps: "transform" });
      return () => {
        dockShownPrevRef.current = true;
      };
    }

    const tl = gsap.timeline({
      onComplete: () => {
        root.classList.remove("is-shown");
        gsap.set(root, { autoAlpha: 0, clearProps: "width,transform" });
        gsap.set(bar, { autoAlpha: 0, clearProps: "transform" });
        if (tips) gsap.set(tips, { autoAlpha: 0, clearProps: "transform" });
        gsap.set(chips, { autoAlpha: 0, clearProps: "transform" });
      },
    });
    dockTlRef.current = tl;
    tl.to(
      chips,
      { autoAlpha: 0, y: 8, duration: 0.18, stagger: 0.03, ease: "power2.in" },
      0,
    );
    if (tips) {
      tl.to(tips, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0.1);
    }
    tl.to(
      bar,
      {
        autoAlpha: 0,
        y: 18,
        scale: 0.94,
        duration: 0.28,
        ease: "power2.in",
      },
      0.06,
    );
    tl.to(root, { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, 0.12);

    return () => {
      tl.kill();
      dockShownPrevRef.current = true;
    };
  }, [dockShown]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [
    messages,
    open,
    pending,
    chatActions,
    showCal,
    scanCard,
  ]);

  useEffect(() => {
    return () => {
      revealRef.current.cancelled = true;
      dockTlRef.current?.kill();
      if (scanRafRef.current != null) {
        cancelAnimationFrame(scanRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showCal || !open) return;
    const el = calRef.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;
    try {
      cleanup = mountCalInline(el);
    } catch (error) {
      console.error("[AiPromptInput] Cal embed failed", error);
    }

    return () => {
      cleanup?.();
    };
  }, [showCal, open]);

  function resetCroFlow() {
    if (scanRafRef.current != null) {
      cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }
    croAnswersRef.current = { url: "", domain: "", name: "", email: "" };
    croStepRef.current = null;
    setCroStep(null);
    setScanCard(null);
  }

  async function pushScriptedReply(text: string, intent?: Parameters<typeof logChatEvent>[0]["intent"]) {
    const assistantId = uid();
    setPending(true);
    await sleep(520 + Math.random() * 280);
    if (revealRef.current.cancelled) {
      setPending(false);
      return;
    }

    setPending(false);
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        text: "",
        streaming: true,
      },
    ]);

    await revealAssistantText(
      text,
      (partial) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: partial } : m,
          ),
        );
      },
      revealRef.current,
    );

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, streaming: false } : m,
      ),
    );

    if (!revealRef.current.cancelled) {
      logChatEvent({
        eventType: "assistant_message",
        intent: intent ?? null,
        role: "assistant",
        content: text.trim(),
        metadata: { messageId: assistantId, scripted: true },
      });
    }
  }

  async function startLeadFlow(service?: AskChatServiceContext | null) {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    resetCroFlow();
    resetNewsletterFlow();
    leadServiceRef.current = service?.title ? service : null;
    leadAnswersRef.current = {
      email: "",
      goal: leadServiceRef.current
        ? leadGoalForService(leadServiceRef.current)
        : "",
      company: "",
    };
    setLeadStep("email");
    commercialStartedRef.current = true;
    clearChatActions();
    setShowCal(false);
    setInputHint(
      leadServiceRef.current
        ? askPlaceholderForService(leadServiceRef.current)
        : null,
    );
    setPending(false);
    setValue("");
    setMessages([]);
    setOpen(true);
    focusAskInput();

    logChatEvent({
      eventType: "intent_open",
      intent: "contact",
      metadata: {
        source: "open_lead_chat",
        ...(leadServiceRef.current
          ? {
              service: leadServiceRef.current.slug,
              serviceTitle: leadServiceRef.current.title,
            }
          : {}),
      },
    });
    trackEvent("chat_open", {
      intent: "contact",
      ...(leadServiceRef.current
        ? { service: leadServiceRef.current.slug }
        : {}),
    });

    await pushScriptedReply(
      leadIntroForService(leadServiceRef.current),
      "contact",
    );
  }

  async function startNewsletterFlow() {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    resetCroFlow();
    leadServiceRef.current = null;
    setLeadStep(null);
    leadStepRef.current = null;
    leadAnswersRef.current = { email: "", goal: "", company: "" };
    newsletterEmailRef.current = "";
    setNewsletterStep("email");
    newsletterStepRef.current = "email";
    clearChatActions();
    setShowCal(false);
    setInputHint(null);
    setPending(false);
    setValue("");
    setMessages([]);
    setOpen(true);
    focusAskInput();

    logChatEvent({
      eventType: "intent_open",
      intent: "newsletter",
      metadata: { source: "open_newsletter_chat" },
    });
    trackEvent("chat_open", { intent: "newsletter" });

    await pushScriptedReply(NEWSLETTER.intro, "newsletter");
  }

  async function startCalBookingFlow(userText?: string) {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    setLeadStep(null);
    leadStepRef.current = null;
    leadServiceRef.current = null;
    resetNewsletterFlow();
    resetCroFlow();
    commercialStartedRef.current = true;
    clearChatActions();
    setShowCal(false);
    setInputHint(null);
    setPending(false);
    setValue("");
    setOpen(true);
    focusAskInput();

    if (userText?.trim()) {
      const text = userText.trim();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text,
      };
      setMessages((prev) => [...prev, userMsg]);
      logChatEvent({
        eventType: "user_message",
        intent: "cal",
        role: "user",
        content: text,
        metadata: { messageId: userMsg.id },
      });
    } else {
      logChatEvent({
        eventType: "intent_open",
        intent: "cal",
        metadata: { source: "cal_booking" },
      });
      trackEvent("chat_open", { intent: "cal" });
    }

    await pushScriptedReply(CAL_INTRO, "cal");
    if (!revealRef.current.cancelled) {
      setShowCal(true);
    }
  }

  async function runPricingFlow(userText: string) {
    clearChatActions();
    resetCroFlow();
    resetNewsletterFlow();
    setShowCal(false);
    setInputHint(null);
    revealRef.current.cancelled = false;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setOpen(true);
    logChatEvent({
      eventType: "user_message",
      intent: "pricing",
      role: "user",
      content: userText,
      metadata: { messageId: userMsg.id },
    });

    await pushScriptedReply(PRICING_REPLY, "pricing");
    if (!revealRef.current.cancelled) {
      showResolvedActions({
        intent: "pricing",
        messageCount: 1,
        userText,
      });
    }
  }

  async function startCroAuditFlow(userText?: string) {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    setLeadStep(null);
    leadStepRef.current = null;
    leadServiceRef.current = null;
    resetNewsletterFlow();
    resetCroFlow();
    commercialStartedRef.current = true;
    clearChatActions();
    setShowCal(false);
    setInputHint(null);
    setPending(false);
    setValue("");
    setOpen(true);
    focusAskInput();

    if (userText?.trim()) {
      const text = userText.trim();
      const userMsg = { id: uid(), role: "user" as const, text };
      setMessages((prev) => [...prev, userMsg]);
      logChatEvent({
        eventType: "user_message",
        intent: "cro",
        role: "user",
        content: text,
        metadata: { messageId: userMsg.id },
      });
    } else {
      logChatEvent({
        eventType: "intent_open",
        intent: "cro",
        metadata: { source: "cro_audit" },
      });
      trackEvent("chat_open", { intent: "cro" });
    }

    croStepRef.current = "url";
    setCroStep("url");
    await pushScriptedReply(CRO.intro, "cro");
  }

  async function runCroScan(domain: string) {
    const favicon = faviconUrlForDomain(domain);
    const started = performance.now();
    setScanCard({
      domain,
      favicon,
      progress: 0,
      stepIndex: 0,
      done: false,
    });

    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (revealRef.current.cancelled) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - started) / CRO_SCAN_DURATION_MS);
        const stepIndex = Math.min(
          CRO_SCAN_STEPS.length - 1,
          Math.floor(t * CRO_SCAN_STEPS.length),
        );
        setScanCard({
          domain,
          favicon,
          progress: t,
          stepIndex,
          done: false,
        });
        if (t < 1) {
          scanRafRef.current = requestAnimationFrame(tick);
        } else {
          scanRafRef.current = null;
          setScanCard({
            domain,
            favicon,
            progress: 1,
            stepIndex: CRO_SCAN_STEPS.length - 1,
            done: true,
          });
          resolve();
        }
      };
      scanRafRef.current = requestAnimationFrame(tick);
    });
  }

  async function handleCroReply(prompt: string) {
    const step = croStepRef.current;
    if (!step || step === "done" || step === "scanning") return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setOpen(true);
    logChatEvent({
      eventType: "user_message",
      intent: "cro",
      role: "user",
      content: prompt,
      metadata: { messageId: userMsg.id, croStep: step },
    });

    if (step === "url") {
      const parsed = normalizeAuditUrl(prompt);
      if (!parsed) {
        await pushScriptedReply(CRO.urlRetry, "cro");
        return;
      }

      croAnswersRef.current.url = parsed.href;
      croAnswersRef.current.domain = parsed.domain;
      croStepRef.current = "scanning";
      setCroStep("scanning");

      await runCroScan(parsed.domain);
      if (revealRef.current.cancelled) return;

      croStepRef.current = "name";
      setCroStep("name");
      await pushScriptedReply(CRO.afterScan, "cro");
      return;
    }

    if (step === "name") {
      const name = prompt.trim();
      if (!name) {
        await pushScriptedReply(CRO.namePrompt, "cro");
        return;
      }
      croAnswersRef.current.name = name;
      croStepRef.current = "email";
      setCroStep("email");
      await pushScriptedReply(CRO.emailPrompt, "cro");
      return;
    }

    if (step === "email") {
      if (!looksLikeEmail(prompt)) {
        await pushScriptedReply(CRO.emailRetry, "cro");
        return;
      }
      const email = prompt.trim();
      croAnswersRef.current.email = email;
      croStepRef.current = "done";
      setCroStep("done");
      await pushScriptedReply(CRO.done(email), "cro");
      if (!revealRef.current.cancelled) {
        showResolvedActions({
          intent: "cro_done",
          messageCount: 1,
        });
        logChatEvent({
          eventType: "lead_complete",
          intent: "cro",
          metadata: { ...croAnswersRef.current, flow: "cro_audit" },
        });
        trackEvent("lead_submit", { intent: "cro", flow: "cro_audit" });
      }
      // Keep answers in ref; clear step so further asks go to Gemini
      croStepRef.current = null;
      setCroStep(null);
    }
  }

  function onChatAction(id: ChatActionId) {
    logChatEvent({
      eventType: "chat_action",
      intent: id === "cro" ? "cro" : id === "book" ? "cal" : "general",
      metadata: { actionId: id },
    });

    if (id === "book") {
      void startCalBookingFlow("Book a call");
      return;
    }

    if (id === "project") {
      clearChatActions();
      setShowCal(false);
      setInputHint("Describe your project…");
      setOpen(true);
      focusAskInput();
      return;
    }

    if (id === "cro") {
      void startCroAuditFlow("Start CRO audit");
      return;
    }

    clearChatActions();
    setInputHint(null);
  }

  async function handleLeadReply(prompt: string) {
    const step = leadStepRef.current;
    if (!step || step === "done") return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setOpen(true);
    logChatEvent({
      eventType: "user_message",
      intent: "contact",
      role: "user",
      content: prompt,
      metadata: { messageId: userMsg.id, leadStep: step },
    });

    if (step === "email") {
      if (!looksLikeEmail(prompt)) {
        await pushScriptedReply(LEAD.emailRetry, "contact");
        return;
      }
      leadAnswersRef.current.email = prompt.trim();
      const service = leadServiceRef.current;
      if (service?.title) {
        leadAnswersRef.current.goal = leadGoalForService(service);
        setLeadStep("company");
        await pushScriptedReply(leadCompanyPromptForService(service), "contact");
        return;
      }
      setLeadStep("goal");
      await pushScriptedReply(LEAD.goal, "contact");
      return;
    }

    if (step === "goal") {
      leadAnswersRef.current.goal = prompt.trim();
      setLeadStep("company");
      await pushScriptedReply(LEAD.company, "contact");
      return;
    }

    if (step === "company") {
      leadAnswersRef.current.company = prompt.trim();
      setLeadStep("done");
      await pushScriptedReply(LEAD.done, "contact");
      const service = leadServiceRef.current;
      logChatEvent({
        eventType: "lead_complete",
        intent: "contact",
        metadata: {
          ...leadAnswersRef.current,
          ...(service
            ? { service: service.slug, serviceTitle: service.title }
            : {}),
        },
      });
      trackEvent("lead_submit", {
        intent: "contact",
        ...(service ? { service: service.slug } : {}),
      });
      setLeadStep(null);
      leadStepRef.current = null;
    }
  }

  async function handleNewsletterReply(prompt: string) {
    const step = newsletterStepRef.current;
    if (!step || step === "done") return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setOpen(true);
    logChatEvent({
      eventType: "user_message",
      intent: "newsletter",
      role: "user",
      content: prompt,
      metadata: { messageId: userMsg.id, newsletterStep: step },
    });

    if (step === "email") {
      if (!looksLikeEmail(prompt)) {
        await pushScriptedReply(NEWSLETTER.emailRetry, "newsletter");
        return;
      }
      const email = prompt.trim();
      newsletterEmailRef.current = email;
      setNewsletterStep("done");
      await pushScriptedReply(NEWSLETTER.done, "newsletter");
      logChatEvent({
        eventType: "newsletter_complete",
        intent: "newsletter",
        metadata: { email },
      });
      trackEvent("lead_submit", { intent: "newsletter" });
      setNewsletterStep(null);
      newsletterStepRef.current = null;
    }
  }

  useEffect(() => {
    const onOpenLead = (event: Event) => {
      const detail = (event as CustomEvent<OpenLeadChatDetail>).detail;
      void startLeadFlow(detail?.service ?? null);
    };
    const onOpenNewsletter = () => {
      void startNewsletterFlow();
    };
    window.addEventListener(OPEN_LEAD_CHAT_EVENT, onOpenLead);
    window.addEventListener(OPEN_NEWSLETTER_CHAT_EVENT, onOpenNewsletter);
    return () => {
      window.removeEventListener(OPEN_LEAD_CHAT_EVENT, onOpenLead);
      window.removeEventListener(OPEN_NEWSLETTER_CHAT_EVENT, onOpenNewsletter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable listener; flows close over latest refs
  }, []);

  async function pushExchange(prompt: string) {
    // Bare domains (grono.ai) count as URLs — show what the user typed,
    // but send a normalized https URL to the model.
    const asUrl = normalizeAuditUrl(prompt);
    const displayText = prompt;
    const modelPrompt = asUrl
      ? `The user shared this website URL for a quick look: ${asUrl.href}`
      : prompt;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: displayText,
    };

    const startingChat = messages.length === 0;
    setOpen(true);
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    revealRef.current.cancelled = false;
    if (startingChat) {
      logChatEvent({
        eventType: "intent_open",
        intent: "general",
        content: displayText,
        metadata: {
          source: "first_message",
          ...(asUrl ? { url: asUrl.href, domain: asUrl.domain } : {}),
        },
      });
      trackEvent("chat_open", { intent: "general" });
    }
    logChatEvent({
      eventType: "user_message",
      intent: "general",
      role: "user",
      content: displayText,
      metadata: {
        messageId: userMsg.id,
        ...(asUrl ? { url: asUrl.href, domain: asUrl.domain } : {}),
      },
    });

    const history = [...messages, userMsg]
      .filter((m) => m.text.trim())
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content:
          m.id === userMsg.id && asUrl
            ? modelPrompt
            : m.text,
      }));

    const prior = history.slice(0, -1);
    const assistantId = uid();

    try {
      const service = leadServiceRef.current;
      const system = service
        ? `${UXLAB_SYSTEM_PROMPT}\n\n${serviceSystemContext(service)}`
        : UXLAB_SYSTEM_PROMPT;

      const { text } = await generateWithGeminiFlash({
        data: {
          prompt: modelPrompt,
          system,
          history: prior,
        },
      });

      setPending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "",
          streaming: true,
        },
      ]);

      const fullText =
        text?.trim() ||
        "I couldn’t generate a reply. Try again in a moment.";

      await revealAssistantText(
        fullText,
        (partial) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: partial } : m,
            ),
          );
        },
        revealRef.current,
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );

      if (!revealRef.current.cancelled) {
        logChatEvent({
          eventType: "assistant_message",
          intent: "general",
          role: "assistant",
          content: fullText,
          metadata: { messageId: assistantId, scripted: false },
        });

        const userMessageCount =
          messages.filter((m) => m.role === "user").length + 1;
        showResolvedActions({
          intent: resolveGeneralActionIntent(displayText),
          messageCount: userMessageCount,
          userText: displayText,
          replyText: fullText,
          recentlyShown: actionsShownRef.current,
          commercialStarted: commercialStartedRef.current,
        });
      }
    } catch (error) {
      console.error("[AiPromptInput] Gemini error", error);
      setPending(false);
      const fallback =
        "Something went wrong. Please try again in a moment — or email alex@uxlab.digital.";
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: fallback,
        },
      ]);
      logChatEvent({
        eventType: "assistant_message",
        intent: "general",
        role: "assistant",
        content: fallback,
        metadata: { messageId: assistantId, error: true },
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const prompt = value.trim();
    setValue("");
    clearChatActions();
    setInputHint(null);

    const cro = croStepRef.current;
    if (cro && cro !== "done" && cro !== "scanning") {
      setShowCal(false);
      void handleCroReply(prompt);
      return;
    }

    const step = leadStepRef.current;
    if (step && step !== "done") {
      setShowCal(false);
      void handleLeadReply(prompt);
      return;
    }

    const newsletter = newsletterStepRef.current;
    if (newsletter && newsletter !== "done") {
      setShowCal(false);
      void handleNewsletterReply(prompt);
      return;
    }

    if (isCallIntent(prompt)) {
      void startCalBookingFlow(prompt);
      return;
    }

    if (isPricingIntent(prompt)) {
      void runPricingFlow(prompt);
      return;
    }

    if (isCroAuditIntent(prompt)) {
      void startCroAuditFlow(prompt);
      return;
    }

    setShowCal(false);
    void pushExchange(prompt);
  }

  function onTip(tip: (typeof TIPS)[number]) {
    setValue("");
    clearChatActions();
    setInputHint(null);
    logChatEvent({
      eventType: "chip_click",
      intent: "chip",
      metadata: { tip },
    });
    if (tip === "Book a call") {
      void startCalBookingFlow(tip);
      return;
    }
    if (tip === "Ballpark on pricing") {
      void runPricingFlow(tip);
      return;
    }
    if (tip === "CRO Audit") {
      void startCroAuditFlow(tip);
      return;
    }
    setShowCal(false);
    setOpen(true);
    void pushExchange(tip);
  }

  function closeChat() {
    revealRef.current.cancelled = true;
    if (scanRafRef.current != null) {
      cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }
    setPending(false);
    clearChatActions();
    actionsShownRef.current = false;
    commercialStartedRef.current = false;
    setShowCal(false);
    setInputHint(null);
    setScanCard(null);
    setCroStep(null);
    croStepRef.current = null;
    resetNewsletterFlow();
    setOpen(false);
    logChatEvent({
      eventType: "chat_close",
      metadata: {},
    });
  }

  return (
    <div
      ref={rootRef}
      className={`rj-ask${open ? " is-open" : ""}${dockShown ? " is-shown" : ""}${tipsCollapsed ? " is-tips-collapsed" : ""}`}
      role="complementary"
      aria-label="Ask UXLAB"
      aria-hidden={dockShown ? undefined : true}
      inert={dockShown ? undefined : true}
    >
      <div
        ref={tipsRef}
        className="rj-ask__tips"
        aria-hidden={open || tipsCollapsed}
        data-lenis-prevent
      >
        <div className="rj-ask__row" data-lenis-prevent>
          {TIPS.map((tip, index) => (
            <button
              key={tip}
              ref={(el) => {
                chipRefs.current[index] = el;
              }}
              type="button"
              className="rj-ask__chip"
              tabIndex={open || tipsCollapsed ? -1 : 0}
              onClick={() => onTip(tip)}
            >
              {tip}
            </button>
          ))}
        </div>
      </div>

      <div className="rj-ask__chat-shell" aria-hidden={!open}>
        <div className="rj-ask__chat" role="log" aria-live="polite">
          <div className="rj-ask__chat-header">
            <div className="rj-ask__chat-brand">
              <Logo
                className="rj-ask__chat-logo"
                markClassName="rj-ask__chat-logo-mark"
                href="#hero"
                title="UXLAB"
              />
            </div>
            <button
              type="button"
              className="rj-ask__chat-close"
              aria-label="Close"
              tabIndex={open ? 0 : -1}
              onClick={closeChat}
            >
              <ChatCloseIcon />
            </button>
          </div>

          <div
            ref={listRef}
            className="rj-ask__chat-messages"
            data-lenis-prevent
          >
            {messages.length === 0 && !pending && !showCal && !scanCard ? (
              <div className="rj-ask__msg rj-ask__msg--assistant rj-ask__msg--enter">
                <div className="rj-ask__bubble">
                  How can we help grow your product?
                </div>
              </div>
            ) : null}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rj-ask__msg rj-ask__msg--${msg.role} rj-ask__msg--enter`}
              >
                <div
                  className={`rj-ask__bubble${msg.streaming ? " is-streaming" : ""}${msg.role === "assistant" ? " rj-ask__bubble--rich" : ""}`}
                >
                  {msg.role === "assistant" ? (
                    <ChatMarkdown text={msg.text} streaming={msg.streaming} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {scanCard ? (
              <div className="rj-ask__msg rj-ask__msg--assistant rj-ask__msg--enter">
                <CroScanCard scan={scanCard} />
              </div>
            ) : null}

            {pending ? (
              <div className="rj-ask__msg rj-ask__msg--assistant rj-ask__msg--enter">
                <div className="rj-ask__bubble rj-ask__bubble--thinking">
                  <ThinkingIndicator />
                </div>
              </div>
            ) : null}

            {chatActions.length > 0 && !pending && !showCal ? (
              <div
                className="rj-ask__actions rj-ask__msg--enter"
                role="group"
                aria-label="Suggested next steps"
              >
                {chatActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="rj-ask__action"
                    onClick={() => onChatAction(action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}

            {showCal && !pending ? (
              <div
                className="rj-ask__cal-wrap rj-ask__msg--enter"
                aria-label="Book a call"
              >
                <div
                  ref={calRef}
                  id={calContainerId}
                  className="rj-ask__cal"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <form ref={barRef} className="rj-ask__bar" onSubmit={onSubmit}>
        <div className="rj-ask__value">
          <label className="sr-only" htmlFor={inputId}>
            Ask UXLAB
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="rj-ask__input"
            type={
              leadStep === "email" ||
              croStep === "email" ||
              newsletterStep === "email"
                ? "email"
                : "text"
            }
            inputMode={
              leadStep === "email" ||
              croStep === "email" ||
              newsletterStep === "email"
                ? "email"
                : croStep === "url"
                  ? "url"
                  : "text"
            }
            autoComplete={
              leadStep === "email" ||
              croStep === "email" ||
              newsletterStep === "email"
                ? "email"
                : croStep === "name"
                  ? "name"
                  : leadStep === "company"
                    ? "organization"
                    : croStep === "url"
                      ? "url"
                      : "off"
            }
            value={value}
            disabled={scanning}
            onChange={(e) => {
              setValue(e.target.value);
              if (inputHint) setInputHint(null);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
          />
        </div>

        <button
          type="submit"
          className={`rj-ask__btn rj-ask__btn--send${canSend ? " is-ready" : ""}`}
          aria-label="Send"
          disabled={!canSend}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
