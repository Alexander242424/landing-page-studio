import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ChallengesSection } from "@/components/home/ChallengesSection";
import { GlanceSection } from "@/components/home/GlanceSection";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HeroReel } from "@/components/hero/HeroReel";
import { Container } from "@/components/layout/Container";
import { Grid, GridItem } from "@/components/layout/Grid";
import { Section } from "@/components/layout/Section";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Text } from "@/components/typography/Text";

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

const COLORS = [
  { name: "Black", swatch: "rj-swatch--black", hex: "#000000" },
  { name: "Ink", swatch: "rj-swatch--ink", hex: "#010101" },
  { name: "White", swatch: "rj-swatch--white", hex: "#FFFFFF" },
  { name: "Surface", swatch: "rj-swatch--surface", hex: "#F7F7F7" },
  { name: "Muted", swatch: "rj-swatch--muted", hex: "#8F8F8F" },
  { name: "Muted Alt", swatch: "rj-swatch--muted-alt", hex: "#9CA3AF" },
] as const;

function HomePage() {
  return (
    <div className="theme-dark rj-page min-h-screen">
      <SiteHeader />

      <main>
        <HeroReel />
        <HomeIntro />
        <GlanceSection />
        <ChallengesSection />

        <Section id="work">
          <Container>
            <Grid>
              <GridItem span={4}>
                <Text as="h2" variant="heading">
                  Color
                </Text>
                <Text as="p" variant="body" muted className="mt-rj-3">
                  Exact Rejouice hex values: white text on black hero, muted
                  #8F8F8F, glass #FFFFFF21, mobile menu #101010.
                </Text>
              </GridItem>
              <GridItem span={6}>
                <Grid>
                  {COLORS.map((c) => (
                    <GridItem key={c.hex} span={2}>
                      <div className={`rj-swatch ${c.swatch}`} />
                      <Text as="p" variant="caption" className="mt-rj-2">
                        {c.name}
                      </Text>
                      <Text as="p" variant="caption" muted>
                        {c.hex}
                      </Text>
                    </GridItem>
                  ))}
                </Grid>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <hr className="rj-rule" />

        <Section id="services">
          <Container>
            <Grid>
              <GridItem span={6}>
                <Text as="h2" variant="heading">
                  Scroll &amp; motion
                </Text>
                <Text as="p" variant="lead" muted className="mt-rj-4 max-w-[40ch]">
                  Lenis lerp 0.1 synced to GSAP ScrollTrigger — hero mark drifts
                  at 50% of hero height; reel video parallaxes yPercent -50 → 50.
                </Text>
              </GridItem>
              <GridItem span={6}>
                <div className="flex flex-col gap-rj-4">
                  <Logo size="lg" />
                  <Text as="p" variant="caption" muted>
                    Brand mark · public/brand/uxlab-logo.svg
                  </Text>
                  <Text as="p" variant="caption" muted>
                    Hero video · public/video/hero.mp4
                  </Text>
                </div>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <Section id="contact" variant="tight">
          <Container>
            <div className="flex flex-col gap-rj-8 py-rj-10">
              {Array.from({ length: 3 }, (_, i) => (
                <Text key={i} as="p" variant="title" muted>
                  Momentum {String(i + 1).padStart(2, "0")}
                </Text>
              ))}
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
