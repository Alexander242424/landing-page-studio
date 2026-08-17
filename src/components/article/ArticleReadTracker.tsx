import { useEffect, useRef } from "react";
import {
  buildArticleTrackPayload,
  measureScrollPct,
  sendArticleAnalytics,
} from "@/lib/analytics/articleTracker";

const HEARTBEAT_MS = 15_000;

type ArticleReadTrackerProps = {
  slug: string;
};

/**
 * Anonymous article read tracking: view, heartbeat while visible,
 * max scroll depth, duration on hide. Does not block rendering.
 */
export function ArticleReadTracker({ slug }: ArticleReadTrackerProps) {
  const startedAt = useRef(Date.now());
  const maxScroll = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    startedAt.current = Date.now();
    maxScroll.current = measureScrollPct();

    sendArticleAnalytics(
      buildArticleTrackPayload(slug, "view", {
        scrollPct: maxScroll.current,
        durationMs: 0,
      }),
    );

    const onScroll = () => {
      const pct = measureScrollPct();
      if (pct > maxScroll.current) maxScroll.current = pct;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const durationMs = Date.now() - startedAt.current;
      sendArticleAnalytics(
        buildArticleTrackPayload(slug, "heartbeat", {
          scrollPct: maxScroll.current,
          durationMs,
        }),
      );
    }, HEARTBEAT_MS);

    const onHide = () => {
      sendArticleAnalytics(
        buildArticleTrackPayload(slug, "hide", {
          scrollPct: maxScroll.current,
          durationMs: Date.now() - startedAt.current,
        }),
      );
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };

    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      onHide();
    };
  }, [slug]);

  return null;
}
