import { useSyncExternalStore } from "react";

/** Homepage / service hero — tablet gets extra authored lines. */
export const HERO_HEADLINE_MOBILE_MQ = "(max-width: 1023px)";

/** Section + directory heroes — only phone-width gets extra lines. */
export const SECTION_HEADLINE_MOBILE_MQ = "(max-width: 767px)";

function subscribeHeadlineViewport(mq: string, onStoreChange: () => void) {
  const media = window.matchMedia(mq);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getHeadlineViewportSnapshot(mq: string) {
  return window.matchMedia(mq).matches;
}

function getHeadlineViewportServerSnapshot(mq: string) {
  return mq === HERO_HEADLINE_MOBILE_MQ;
}

/** Pick `mobile` line groups on narrow viewports; falls back to `desktop`. */
export function useHeroHeadlineLines<const T extends readonly string[]>(
  desktop: T,
  mobile?: readonly string[] | null,
  narrowMq: string = SECTION_HEADLINE_MOBILE_MQ,
): T {
  const isNarrow = useSyncExternalStore(
    (onStoreChange) => subscribeHeadlineViewport(narrowMq, onStoreChange),
    () => getHeadlineViewportSnapshot(narrowMq),
    () => getHeadlineViewportServerSnapshot(narrowMq),
  );

  if (isNarrow && mobile && mobile.length > 0) {
    return mobile as T;
  }

  return desktop;
}
