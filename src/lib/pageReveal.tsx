import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";

type PageRevealContextValue = {
  /** True once the first-load preloader has finished (or was skipped). */
  isRevealed: boolean;
  /** This document load should play the preloader. */
  shouldPlay: boolean;
  reveal: () => void;
};

const PageRevealContext = createContext<PageRevealContextValue>({
  isRevealed: true,
  shouldPlay: false,
  reveal: () => undefined,
});

export function usePageReveal() {
  return useContext(PageRevealContext);
}

export function shouldPlayPreloader(pathname: string) {
  if (pathname.startsWith("/admin")) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/solutions/")) return true;
  return false;
}

/** Hard fail-safe so a stuck loader can never freeze the site. */
const REVEAL_DEADLINE_MS = 7000;

export function PageRevealProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [shouldPlay] = useState(() => shouldPlayPreloader(pathname));
  const [isRevealed, setIsRevealed] = useState(!shouldPlay);

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  useEffect(() => {
    if (!shouldPlay || isRevealed) return;
    const timer = window.setTimeout(reveal, REVEAL_DEADLINE_MS);
    return () => window.clearTimeout(timer);
  }, [shouldPlay, isRevealed, reveal]);

  const value = useMemo(
    () => ({ isRevealed, shouldPlay, reveal }),
    [isRevealed, shouldPlay, reveal],
  );

  return (
    <PageRevealContext.Provider value={value}>
      {children}
    </PageRevealContext.Provider>
  );
}
