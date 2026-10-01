import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { HomeIntro } from "@/components/home/HomeIntro";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { playHomeEntrance } from "@/lib/homeEntrance";
import { usePageReveal } from "@/lib/pageReveal";
import { homeJsonLd } from "@/lib/site";

const GlanceSection = lazy(() =>
  import("@/components/home/GlanceSection").then((m) => ({
    default: m.GlanceSection,
  })),
);
const SolutionsStackSection = lazy(() =>
  import("@/components/home/SolutionsStackSection").then((m) => ({
    default: m.SolutionsStackSection,
  })),
);
const OurProcessSection = lazy(() =>
  import("@/components/home/OurProcessSection").then((m) => ({
    default: m.OurProcessSection,
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
        <HomeIntro />
        <Deferred>
          <GlanceSection />
        </Deferred>
        <Deferred>
          <SolutionsStackSection />
        </Deferred>
        <Deferred>
          <OurProcessSection />
        </Deferred>
        <Deferred>
          <ApproachSection />
        </Deferred>
        <Deferred>
          <HomeVideoSection />
        </Deferred>
        <Deferred>
          <FaqSection />
        </Deferred>
        <Deferred>
          <BlogSection />
        </Deferred>
      </main>

      <Deferred>
        <SiteFooter />
      </Deferred>
    </div>
  );
}
