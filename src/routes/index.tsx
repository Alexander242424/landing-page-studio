import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { HomeIntro } from "@/components/home/HomeIntro";
import { LogoStrip } from "@/components/home/LogoStrip";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { playHomeEntrance } from "@/lib/homeEntrance";
import { defaultLinks, defaultMeta, homeJsonLd, SITE } from "@/lib/site";

/** Below-fold sections — split so GSAP/media work is not on the critical path. */
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

function Deferred({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: defaultMeta({
      title: SITE.title,
      description: SITE.description,
      path: "/",
      keywords: [...SITE.keywords],
    }),
    links: defaultLinks("/"),
  }),
  component: HomePage,
});

function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hash = useRouterState({ select: (s) => s.location.hash });
  const { lenis } = useSmoothScroll();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return playHomeEntrance(root);
  }, []);

  // Hash links from article breadcrumbs / site header (e.g. #resources)
  // — section may be lazy, so retry until it mounts.
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

  const jsonLd = homeJsonLd();

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
        <LogoStrip />
        <HomeIntro />
        <Deferred>
          <GlanceSection />
        </Deferred>
        {/* Challenges list hidden for now — headline lives on solutions stack */}
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
