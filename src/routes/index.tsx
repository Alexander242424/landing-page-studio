import { useLayoutEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { ApproachSection } from "@/components/home/ApproachSection";
import { ChallengesSection } from "@/components/home/ChallengesSection";
import { GlanceSection } from "@/components/home/GlanceSection";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { BlogSection } from "@/components/home/BlogSection";
import { FaqSection } from "@/components/home/FaqSection";
import { LogoStrip } from "@/components/home/LogoStrip";
import { OurProcessSection } from "@/components/home/OurProcessSection";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { playHomeEntrance } from "@/lib/homeEntrance";

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
        <GlanceSection />
        <ChallengesSection />
        <OurProcessSection />
        <ApproachSection />
        <HomeVideoSection />
        <FaqSection />
        <BlogSection />
      </main>

      <SiteFooter />
    </div>
  );
}
