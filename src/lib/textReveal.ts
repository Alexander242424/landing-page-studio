import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const WORD_WRAP_CLASS = "rj-text-reveal__word-wrap";
const WORD_CLASS = "rj-text-reveal__word";
const LINE_CLASS = "rj-text-reveal__line";
const CHAR_CLASS = "rj-text-reveal__char";

export type TextRevealOptions = {
  trigger?: Element;
  start?: string;
  delay?: number;
  duration?: number;
  wordsStagger?: number;
  linesStagger?: number;
  direction?: -1 | 1;
  /** Animate --scale on container for link underline reveal (tagline). */
  animateLinkScale?: boolean;
  /** Play entrance on mount instead of scroll trigger (hero headlines). */
  playOnLoad?: boolean;
};

function splitTextNodes(root: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];

  const walk = (parent: HTMLElement) => {
    const nodes = Array.from(parent.childNodes);

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (!text) continue;

        const tokens = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        for (const token of tokens) {
          if (!token) continue;

          if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(token));
            continue;
          }

          const word = document.createElement("span");
          word.className = WORD_CLASS;
          word.textContent = token;

          const wrap = document.createElement("span");
          wrap.className = WORD_WRAP_CLASS;
          wrap.appendChild(word);
          fragment.appendChild(wrap);
          words.push(word);
        }

        node.parentNode?.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "BR") continue;
        walk(el);
      }
    }
  };

  walk(root);
  return words;
}

function groupWordsByLine(
  words: HTMLElement[],
  tolerance = 3,
): HTMLElement[][] {
  const lines = new Map<number, HTMLElement[]>();

  for (const word of words) {
    const top = word.offsetTop;
    const key =
      [...lines.keys()].find((lineTop) => Math.abs(lineTop - top) <= tolerance) ??
      top;

    if (!lines.has(key)) lines.set(key, []);
    lines.get(key)!.push(word);
  }

  return [...lines.values()];
}

/**
 * Split element text into masked word spans and animate Rejouice-style on scroll.
 * Returns cleanup that kills tweens and restores original HTML.
 */
export function createTextReveal(
  element: HTMLElement,
  options: TextRevealOptions = {},
): () => void {
  const {
    trigger = element,
    start = "top 97%",
    delay = 0.2,
    duration = 1.6,
    wordsStagger = 0.014,
    linesStagger,
    direction = -1,
    animateLinkScale = false,
    playOnLoad = false,
  } = options;

  const originalHTML = element.innerHTML;
  const words = splitTextNodes(element);

  if (!words.length) {
    return () => undefined;
  }

  gsap.set(words, { clearProps: "all" });

  const container = animateLinkScale
    ? (element.closest(".rj-intro__content") as HTMLElement | null) ?? element
    : element;

  gsap.set(container, { autoAlpha: 0 });

  if (animateLinkScale) {
    gsap.set(container, {
      "--scale": 0,
      "--transformOrigin": "0% 50%",
    });
  }

  const lines = groupWordsByLine(words);
  const fromY = -100 * direction;

  const timeline = gsap.timeline(
    playOnLoad
      ? { delay }
      : {
          scrollTrigger: {
            trigger,
            start,
            once: true,
          },
          delay,
        },
  );

  timeline.set(container, { autoAlpha: 1 });

  if (linesStagger !== undefined) {
    lines.forEach((lineWords, index) => {
      timeline.fromTo(
        lineWords,
        { yPercent: fromY },
        {
          yPercent: 0,
          duration,
          ease: "expo.out",
          stagger: wordsStagger,
        },
        linesStagger * index,
      );
    });
  } else {
    timeline.fromTo(
      words,
      { yPercent: fromY },
      {
        yPercent: 0,
        duration,
        ease: "expo.out",
        stagger: wordsStagger,
      },
    );
  }

  if (animateLinkScale) {
    timeline.to(
      container,
      { "--scale": 1, ease: "expo.out", duration: 1.2 },
      "<",
    );
    timeline.set(container, { "--transformOrigin": "100% 50%" }, 1.5);
  }

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
    element.innerHTML = originalHTML;
  };
}

export type AwardsCharRevealOptions = {
  delay?: number;
  /** Play on mount (hero). Default scroll trigger matches Awards: top 80%. */
  playOnLoad?: boolean;
  trigger?: Element;
  start?: string;
  /** Char flip duration (default 1.8). */
  duration?: number;
  /** Char rotate stagger (default 0.06). */
  stagger?: number;
  /** Char yPercent stagger (default 0.02). */
  yStagger?: number;
};

/**
 * Rejouice Awards (x90) title entrance: SplitText lines+chars with 3D flip.
 * Source: about page `h2.title` in `.heading__wrapper` (Awards component).
 *
 * Cleanup always restores `originalHTML` so React Strict Mode remounts and HMR
 * cannot leave nested SplitText DOM (duplicate visible words).
 */
export function createAwardsCharReveal(
  element: HTMLElement,
  options: AwardsCharRevealOptions = {},
): () => void {
  const {
    delay = 0.2,
    playOnLoad = false,
    trigger = element,
    start = "top 80%",
    duration = 1.8,
    stagger = 0.06,
    yStagger = 0.02,
  } = options;

  const originalHTML = element.innerHTML;
  let split: SplitText | null = new SplitText(element, {
    // words keep glyphs together so inline-block chars never wrap mid-word
    type: "lines,words,chars",
    linesClass: LINE_CLASS,
    wordsClass: WORD_CLASS,
    charsClass: CHAR_CLASS,
  });
  let restored = false;

  const restore = () => {
    if (restored) return;
    restored = true;
    try {
      split?.revert();
    } catch {
      /* already reverted by gsap.context */
    }
    split = null;
    element.innerHTML = originalHTML;
    // Keep visible: clearing opacity would let .rj-awards-title hide the title again.
    gsap.set(element, {
      clearProps: "perspective,transform",
      autoAlpha: 1,
    });
  };

  const chars = split.chars;
  if (!chars.length) {
    restore();
    return () => undefined;
  }

  gsap.set(element, { autoAlpha: 0, perspective: 800 });

  const timeline = gsap.timeline({
    delay,
    defaults: { ease: "expo.out", duration },
    ...(playOnLoad
      ? {}
      : {
          scrollTrigger: {
            trigger,
            start,
            once: true,
          },
        }),
  });

  timeline.set(element, { autoAlpha: 1 });
  timeline.set(chars, { rotateX: 90, rotateY: -5, yPercent: 100 });
  timeline.to(
    chars,
    { rotateX: 0, rotateY: 0, stagger, duration },
    0.2,
  );
  timeline.to(chars, { yPercent: 0, stagger: yStagger }, 0);

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
    restore();
  };
}
