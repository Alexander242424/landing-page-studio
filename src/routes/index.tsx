import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { HomeIntro } from "@/components/home/HomeIntro";
import { LogoStrip } from "@/components/home/LogoStrip";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { playHomeEntrance } from "@/lib/homeEntrance";

/** Below-fold sections — split so GSAP/media work is not on the critical path. */
const GlanceSection = lazy(() =>
  import("@/components/home/GlanceSection").then((m) => ({
    default: m.GlanceSection,
  })),
);
const ChallengesSection = lazy(() =>
  import("@/components/home/ChallengesSection").then((m) => ({
    default: m.ChallengesSection,
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

function Deferred({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UXLAB — Design System" },
      {
        name: "description",
        content:
          "UXLAB landing: Rejouice-matched hero, intro, glance carousel, and Framer Challenges We Solve.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return playHomeEntrance(root);
  }, []);

  return (
    <div
      ref={rootRef}
      className="theme-light rj-page rj-page--enter min-h-screen"
    >
      <ScrollThemeBand />
      <SiteHeader />
      <AiPromptInput />

      <main>
        <HeroReel />
        <LogoStrip />
        <HomeIntro />
        <Deferred>
          <GlanceSection />
        </Deferred>
        <Deferred>
          <ChallengesSection />
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
