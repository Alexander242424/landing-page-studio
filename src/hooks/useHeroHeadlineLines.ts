import { useSyncExternalStore } from "react";

/** Match hero / directory pages — tablet counts as narrow for headline breaks. */
export const HERO_HEADLINE_MOBILE_MQ = "(max-width: 1023px)";

function subscribeHeadlineViewport(onStoreChange: () => void) {
  const mq = window.matchMedia(HERO_HEADLINE_MOBILE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getHeadlineViewportSnapshot() {
  return window.matchMedia(HERO_HEADLINE_MOBILE_MQ).matches;
}

function getHeadlineViewportServerSnapshot() {
  return true;
}

/** Pick `mobile` line groups below 1024px; falls back to `desktop`. */
export function useHeroHeadlineLines<const T extends readonly string[]>(
  desktop: T,
  mobile?: readonly string[] | null,
): T {
  const isNarrow = useSyncExternalStore(
    subscribeHeadlineViewport,
    getHeadlineViewportSnapshot,
    getHeadlineViewportServerSnapshot,
  );

  if (isNarrow && mobile && mobile.length > 0) {
    return mobile as T;
  }

  return desktop;
}
