import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Logo } from "@/components/brand/Logo";
import {
  OPEN_LEAD_CHAT_EVENT,
  OPEN_NEWSLETTER_CHAT_EVENT,
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
import { UXLAB_SYSTEM_PROMPT } from "@/lib/uxlabKnowledge";

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
  intro:
    "Great — let’s connect you with an expert. What’s the best email to reach you?",
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

const PRICING_ACTIONS = [
  { id: "book", label: "Book a call" },
  { id: "project", label: "Tell me about a project" },
  { id: "explore", label: "Keep exploring" },
] as const;

type PricingActionId = (typeof PRICING_ACTIONS)[number]["id"];

const CRO_AUDIT_ACTIONS = [
  { id: "book", label: "Book a call" },
  { id: "explore", label: "Keep exploring" },
] as const;

type CroAuditActionId = (typeof CRO_AUDIT_ACTIONS)[number]["id"];

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
        <span />
        <span />
        <span />
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

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep | null>(null);
  const [newsletterStep, setNewsletterStep] = useState<NewsletterStep | null>(
    null,
  );
  const [croStep, setCroStep] = useState<CroAuditStep | null>(null);
  const [scanCard, setScanCard] = useState<ScanCardState | null>(null);
  const [pricingActions, setPricingActions] = useState(false);
  const [croAuditActions, setCroAuditActions] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [inputHint, setInputHint] = useState<string | null>(null);

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

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [
    messages,
    open,
    pending,
    pricingActions,
    croAuditActions,
    showCal,
    scanCard,
  ]);

  useEffect(() => {
    return () => {
      revealRef.current.cancelled = true;
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
    setCroAuditActions(false);
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

  async function startLeadFlow() {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    resetCroFlow();
    resetNewsletterFlow();
    leadAnswersRef.current = { email: "", goal: "", company: "" };
    setLeadStep("email");
    setPricingActions(false);
    setShowCal(false);
    setInputHint(null);
    setPending(false);
    setValue("");
    setMessages([]);
    setOpen(true);
    focusAskInput();

    logChatEvent({
      eventType: "intent_open",
      intent: "contact",
      metadata: { source: "open_lead_chat" },
    });
    trackEvent("chat_open", { intent: "contact" });

    await pushScriptedReply(LEAD.intro, "contact");
  }

  async function startNewsletterFlow() {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    resetCroFlow();
    setLeadStep(null);
    leadStepRef.current = null;
    leadAnswersRef.current = { email: "", goal: "", company: "" };
    newsletterEmailRef.current = "";
    setNewsletterStep("email");
    newsletterStepRef.current = "email";
    setPricingActions(false);
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
    resetNewsletterFlow();
    resetCroFlow();
    setPricingActions(false);
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
    setPricingActions(false);
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
      setPricingActions(true);
    }
  }

  async function startCroAuditFlow(userText?: string) {
    revealRef.current.cancelled = true;
    await sleep(0);
    revealRef.current = { cancelled: false };

    setLeadStep(null);
    leadStepRef.current = null;
    resetNewsletterFlow();
    resetCroFlow();
    setPricingActions(false);
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
        setCroAuditActions(true);
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

  function onPricingAction(id: PricingActionId) {
    logChatEvent({
      eventType: "pricing_action",
      intent: "pricing",
      metadata: { actionId: id },
    });

    if (id === "book") {
      void startCalBookingFlow("Book a call");
      return;
    }

    if (id === "project") {
      setPricingActions(false);
      setCroAuditActions(false);
      setShowCal(false);
      setInputHint("Describe your project…");
      setOpen(true);
      focusAskInput();
      return;
    }

    setPricingActions(false);
    setInputHint(null);
  }

  function onCroAuditAction(id: CroAuditActionId) {
    logChatEvent({
      eventType: "cro_action",
      intent: "cro",
      metadata: { actionId: id },
    });

    if (id === "book") {
      void startCalBookingFlow("Book a call");
      return;
    }

    setCroAuditActions(false);
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
      logChatEvent({
        eventType: "lead_complete",
        intent: "contact",
        metadata: { ...leadAnswersRef.current },
      });
      trackEvent("lead_submit", { intent: "contact" });
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
    const onOpenLead = () => {
      void startLeadFlow();
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
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt,
    };

    setOpen(true);
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    revealRef.current.cancelled = false;
    logChatEvent({
      eventType: "user_message",
      intent: "general",
      role: "user",
      content: prompt,
      metadata: { messageId: userMsg.id },
    });

    const history = [...messages, userMsg]
      .filter((m) => m.text.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.text }));

    const prior = history.slice(0, -1);
    const assistantId = uid();

    try {
      const { text } = await generateWithGeminiFlash({
        data: {
          prompt,
          system: UXLAB_SYSTEM_PROMPT,
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
    setPricingActions(false);
    setCroAuditActions(false);
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
    setPricingActions(false);
    setCroAuditActions(false);
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
    setPricingActions(false);
    setCroAuditActions(false);
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
      className={`rj-ask${open ? " is-open" : ""}`}
      role="complementary"
      aria-label="Ask UXLAB"
    >
      <div
        className="rj-ask__tips"
        aria-hidden={open}
        data-lenis-prevent
      >
        <div className="rj-ask__row" data-lenis-prevent>
          {TIPS.map((tip) => (
            <button
              key={tip}
              type="button"
              className="rj-ask__chip"
              tabIndex={open ? -1 : 0}
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
                  className={`rj-ask__bubble${msg.streaming ? " is-streaming" : ""}`}
                >
                  {msg.text}
                  {msg.streaming ? (
                    <span className="rj-ask__caret" aria-hidden="true" />
                  ) : null}
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

            {pricingActions && !pending && !showCal ? (
              <div
                className="rj-ask__actions rj-ask__msg--enter"
                role="group"
                aria-label="Pricing next steps"
              >
                {PRICING_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="rj-ask__action"
                    onClick={() => onPricingAction(action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}

            {croAuditActions && !pending && !showCal ? (
              <div
                className="rj-ask__actions rj-ask__msg--enter"
                role="group"
                aria-label="CRO Audit next steps"
              >
                {CRO_AUDIT_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="rj-ask__action"
                    onClick={() => onCroAuditAction(action.id)}
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

      <form className="rj-ask__bar" onSubmit={onSubmit}>
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
                : croStep === "url"
                  ? "url"
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
