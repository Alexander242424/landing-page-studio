import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Logo } from "@/components/brand/Logo";
import { generateWithGeminiFlash } from "@/lib/ai.functions";
import { UXLAB_SYSTEM_PROMPT } from "@/lib/uxlabKnowledge";

const TIPS = ["Talk to an expert", "What's your process", "Pricing"] as const;

const FILE_ACCEPT =
  "image/*,.pdf,.txt,.md,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.json";

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
  fileName?: string;
  streaming?: boolean;
};

function PlusIcon() {
  return (
    <svg className="rj-ask__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function CloseIcon() {
  return (
    <svg className="rj-ask__attach-x" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
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

function truncateName(name: string, max = 28) {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf(".");
  if (ext > 0 && name.length - ext <= 6) {
    const stem = name.slice(0, ext);
    const suffix = name.slice(ext);
    const keep = Math.max(8, max - suffix.length - 1);
    return `${stem.slice(0, keep)}…${suffix}`;
  }
  return `${name.slice(0, max - 1)}…`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Progressive reveal — Apple-smooth, not a hard dump. */
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
    const chunk = text.length > 280 ? 3 : text.length > 120 ? 2 : 1;
    i = Math.min(i + chunk, text.length);
    onFrame(text.slice(0, i));
    const pause =
      text[i - 1] === "." || text[i - 1] === "?" || text[i - 1] === "!"
        ? 28
        : text[i - 1] === ","
          ? 14
          : 7 + Math.random() * 10;
    await sleep(pause);
  }
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
 */
export function AiPromptInput() {
  const inputId = useId();
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef({ cancelled: false });

  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  const canSend = Boolean(value.trim() || file) && !pending;
  const animationPaused =
    open || focused || Boolean(value.trim()) || Boolean(file);
  const placeholder = useTypewriterPlaceholder(animationPaused);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open, pending]);

  useEffect(() => {
    return () => {
      revealRef.current.cancelled = true;
    };
  }, []);

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
  }

  async function pushExchange(prompt: string, attachedName?: string) {
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt || (attachedName ? `Attached ${attachedName}` : ""),
      fileName: attachedName,
    };

    setOpen(true);
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    revealRef.current.cancelled = false;

    const history = [...messages, userMsg]
      .filter((m) => m.text.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.text }));

    // Drop the current user turn from history — sent as `prompt`
    const prior = history.slice(0, -1);

    const aiPrompt = attachedName
      ? `${prompt || "Please review this attachment."}\n\n[Attachment: ${attachedName}]`
      : prompt;

    const assistantId = uid();

    try {
      const { text } = await generateWithGeminiFlash({
        data: {
          prompt: aiPrompt,
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

      await revealAssistantText(
        text?.trim() ||
          "I couldn’t generate a reply. Try again in a moment.",
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
    } catch (error) {
      console.error("[AiPromptInput] Gemini error", error);
      setPending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "Something went wrong. Please try again in a moment — or email hello@uxlab.studio.",
        },
      ]);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const prompt = value.trim();
    const attachedName = file?.name;
    pushExchange(prompt, attachedName);
    setValue("");
    clearFile();
  }

  function onTip(tip: string) {
    setOpen(true);
    setValue("");
    clearFile();
    pushExchange(tip);
  }

  function closeChat() {
    revealRef.current.cancelled = true;
    setOpen(false);
  }

  return (
    <div
      className={`rj-ask${open ? " is-open" : ""}`}
      role="complementary"
      aria-label="Ask UXLAB"
    >
      <div className="rj-ask__tips" aria-hidden={open}>
        <div className="rj-ask__row">
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

          <div ref={listRef} className="rj-ask__chat-messages">
            {messages.length === 0 ? (
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
                  {msg.streaming && !msg.text ? (
                    <span className="rj-ask__caret" aria-hidden="true" />
                  ) : null}
                  {msg.streaming && msg.text ? (
                    <span className="rj-ask__caret" aria-hidden="true" />
                  ) : null}
                  {msg.fileName ? (
                    <span className="rj-ask__bubble-file">
                      {truncateName(msg.fileName, 36)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            {pending ? (
              <div className="rj-ask__msg rj-ask__msg--assistant rj-ask__msg--enter">
                <div className="rj-ask__bubble rj-ask__bubble--pending">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {file ? (
        <div className="rj-ask__attach">
          <span className="rj-ask__attach-pill" title={file.name}>
            <span className="rj-ask__attach-name">{truncateName(file.name)}</span>
            <button
              type="button"
              className="rj-ask__attach-remove"
              aria-label={`Remove ${file.name}`}
              onClick={clearFile}
            >
              <CloseIcon />
            </button>
          </span>
        </div>
      ) : null}

      <form className="rj-ask__bar" onSubmit={onSubmit}>
        <input
          ref={fileRef}
          id={fileInputId}
          className="rj-ask__file"
          type="file"
          accept={FILE_ACCEPT}
          onChange={onFileChange}
          tabIndex={-1}
        />

        <button
          type="button"
          className="rj-ask__btn"
          aria-label="Add attachment"
          onClick={() => fileRef.current?.click()}
        >
          <PlusIcon />
        </button>

        <div className="rj-ask__value">
          <label className="sr-only" htmlFor={inputId}>
            Ask UXLAB
          </label>
          <input
            id={inputId}
            className="rj-ask__input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={open ? "Ask anything…" : placeholder}
            autoComplete="off"
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
