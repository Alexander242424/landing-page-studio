import { createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { ApproachSection } from "@/components/home/ApproachSection";
import { ChallengesSection } from "@/components/home/ChallengesSection";
import { GlanceSection } from "@/components/home/GlanceSection";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { FaqSection } from "@/components/home/FaqSection";
import { OurProcessSection } from "@/components/home/OurProcessSection";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
  return (
    <div className="theme-light rj-page min-h-screen">
      <SiteHeader />
      <AiPromptInput />

      <main>
        <HeroReel />
        <HomeIntro />
        <GlanceSection />
        <ChallengesSection />
        <OurProcessSection />
        <ApproachSection />
        <HomeVideoSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}
