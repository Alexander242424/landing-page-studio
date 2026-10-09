import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { CustomersSection } from "@/components/home/CustomersSection";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { playHomeEntrance } from "@/lib/homeEntrance";
import { usePageReveal } from "@/lib/pageReveal";
import { homeJsonLd } from "@/lib/site";

const SolutionsStackSection = lazy(() =>
  import("@/components/home/SolutionsStackSection").then((m) => ({
    default: m.SolutionsStackSection,
  })),
);
const ContentHubSection = lazy(() =>
  import("@/components/home/ContentHubSection").then((m) => ({
    default: m.ContentHubSection,
  })),
);
const ApproachSection = lazy(() =>
  import("@/components/home/ApproachSection").then((m) => ({
    default: m.ApproachSection,
  })),
);
const HomeVideoSection = lazy(() =>
  import("@/components/home/HomeVideoSection").then((m) => ({
    default: m.HomeVideoSection,
  })),
);
const CompareSection = lazy(() =>
  import("@/components/home/CompareSection").then((m) => ({
    default: m.CompareSection,
  })),
);
const FaqSection = lazy(() =>
  import("@/components/home/FaqSection").then((m) => ({
    default: m.FaqSection,
  })),
);
const BlogSection = lazy(() =>
  import("@/components/home/BlogSection").then((m) => ({
    default: m.BlogSection,
  })),
);
const GetInTouchSection = lazy(() =>
  import("@/components/home/GetInTouchSection").then((m) => ({
    default: m.GetInTouchSection,
  })),
);
const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

function Deferred({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

type MarketingHomePageProps = {
  canonicalPath?: string;
};

export function MarketingHomePage({
  canonicalPath = "/",
}: MarketingHomePageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hash = useRouterState({ select: (s) => s.location.hash });
  const { lenis } = useSmoothScroll();
  const { isRevealed } = usePageReveal();

  useLayoutEffect(() => {
    if (!isRevealed) return;
    const root = rootRef.current;
    if (!root) return;
    return playHomeEntrance(root);
  }, [isRevealed]);

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;

    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    const scrollToTarget = () => {
      if (cancelled) return;
      const target = document.getElementById(id);
      if (!target) {
        if (attempts++ < 40) {
          timer = window.setTimeout(scrollToTarget, 50);
        }
        return;
      }

      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    };

    timer = window.setTimeout(scrollToTarget, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hash, lenis]);

  const jsonLd = homeJsonLd(canonicalPath);

  return (
    <div
      ref={rootRef}
      className="theme-light rj-page rj-page--enter min-h-screen"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollThemeBand />
      <SiteHeader />
      <AiPromptInput />

      <main className="rj-page__main">
        <HeroReel />
        <CustomersSection />
        <Deferred>
          <SolutionsStackSection />
        </Deferred>
        <Deferred>
          <ContentHubSection />
        </Deferred>
        <Deferred>
          <ApproachSection />
        </Deferred>
        <Deferred>
          <HomeVideoSection />
        </Deferred>
        <Deferred>
          <CompareSection />
        </Deferred>
        <Deferred>
          <FaqSection />
        </Deferred>
        <Deferred>
          <BlogSection />
        </Deferred>
        <Deferred>
          <GetInTouchSection />
        </Deferred>
      </main>

      <Deferred>
        <SiteFooter />
      </Deferred>
    </div>
  );
}
