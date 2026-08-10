/** Cal.com inline embed helpers — load once, mount into a DOM node. */

export const CAL_NAMESPACE = "30min";
export const CAL_LINK = "alex-tyshchenko-0aphau/30min";
export const CAL_ORIGIN = "https://app.cal.com";
const EMBED_SRC = "https://app.cal.com/embed/embed.js";

type CalQueue = { q?: unknown[] };

type CalNsApi = ((...args: unknown[]) => void) & CalQueue;

type CalApi = ((...args: unknown[]) => void) &
  CalQueue & {
    loaded?: boolean;
    ns?: Record<string, CalNsApi>;
    config?: { forwardQueryParams?: boolean };
  };

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

let namespaceReady = false;
/** Tracks the element currently hosting an inline embed (Strict Mode safe). */
let activeInlineEl: HTMLElement | null = null;

/**
 * Install the Cal bootstrap (mirrors the official embed snippet) once.
 * Script loads on first Cal() call.
 */
export function ensureCal(): CalApi {
  if (typeof window === "undefined") {
    throw new Error("Cal embed requires a browser environment");
  }

  if (window.Cal) return window.Cal;

  const C = window;
  const A = EMBED_SRC;
  const L = "init";

  const p = (a: CalQueue, ar: IArguments | unknown[]) => {
    a.q = a.q || [];
    a.q.push(ar);
  };

  const Cal = function Cal() {
    const cal = C.Cal!;
    const ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      C.document.head.appendChild(C.document.createElement("script")).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api = function nsApi() {
        p(api, arguments);
      } as CalNsApi;
      const namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns![namespace] = cal.ns![namespace] || api;
        p(cal.ns![namespace], ar);
        p(cal, ["initNamespace", namespace]);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  } as CalApi;

  C.Cal = Cal;
  return Cal;
}

function ensureNamespace(Cal: CalApi) {
  if (namespaceReady && Cal.ns?.[CAL_NAMESPACE]) return;
  Cal("init", CAL_NAMESPACE, { origin: CAL_ORIGIN });
  Cal.config = Cal.config || {};
  Cal.config.forwardQueryParams = true;
  namespaceReady = true;
}

/**
 * Mount the 30min inline embed into `element`.
 * Returns a cleanup that clears the host (safe under React Strict Mode remount).
 */
export function mountCalInline(element: HTMLElement): () => void {
  const Cal = ensureCal();
  ensureNamespace(Cal);

  const ns = Cal.ns?.[CAL_NAMESPACE];
  if (!ns) {
    throw new Error(`Cal namespace "${CAL_NAMESPACE}" failed to initialize`);
  }

  // Replacing children avoids stacking iframes on remount.
  element.replaceChildren();
  activeInlineEl = element;

  ns("inline", {
    elementOrSelector: element,
    config: {
      layout: "month_view",
      useSlotsViewOnSmallScreen: "true",
      theme: "dark",
    },
    calLink: CAL_LINK,
  });

  ns("ui", {
    hideEventTypeDetails: false,
    layout: "month_view",
    theme: "dark",
  });

  return () => {
    if (activeInlineEl === element) {
      activeInlineEl = null;
    }
    element.replaceChildren();
  };
}
