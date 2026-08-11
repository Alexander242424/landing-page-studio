import { useEffect, useState, type RefObject } from "react";

type Options = {
  /** Expand the root margin so assets warm up before they enter view. */
  rootMargin?: string;
  /** Once true, stay true (default). */
  once?: boolean;
};

/**
 * True when `ref` is near the viewport (IntersectionObserver).
 * SSR-safe: starts false and only flips on the client.
 */
export function useNearViewport<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "320px 0px", once = true }: Options = {},
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        if (once) io.disconnect();
      },
      { root: null, rootMargin, threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once, near]);

  return near;
}
