import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  trackEvent,
  trackLeaveBeacon,
} from "@/lib/analytics/tracker";

const HEARTBEAT_MS = 15_000;

/**
 * Privacy-light page analytics: page_view, heartbeat, leave.
 * Mount once near the app root (skip /admin*).
 */
export function AnalyticsBeacon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const startedAt = useRef<number>(Date.now());
  const pathKey = `${pathname}${search}`;

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    startedAt.current = Date.now();
    trackEvent("page_view");

    const heartbeat = window.setInterval(() => {
      const durationSec = Math.round(
        (Date.now() - startedAt.current) / 1000,
      );
      trackEvent("page_heartbeat", {}, { durationSec });
    }, HEARTBEAT_MS);

    const onLeave = () => {
      const durationSec = Math.round(
        (Date.now() - startedAt.current) / 1000,
      );
      trackLeaveBeacon(durationSec);
    };

    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", onLeave);
      onLeave();
    };
  }, [pathKey, pathname]);

  return null;
}
