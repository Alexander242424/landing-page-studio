import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/layout/Container";
import { Grid, GridItem } from "@/components/layout/Grid";
import { Section } from "@/components/layout/Section";
import { Text } from "@/components/typography/Text";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UXLAB — Design System" },
      {
        name: "description",
        content:
          "UXLAB design system tokens extracted from Rejouice: Suisse Intl, color, grid, and Lenis smooth scroll.",
      },
    ],
  }),
  component: DesignSystemPage,
});

const COLORS = [
  { name: "Black", swatch: "rj-swatch--black", hex: "#000000" },
  { name: "Ink", swatch: "rj-swatch--ink", hex: "#010101" },
  { name: "White", swatch: "rj-swatch--white", hex: "#FFFFFF" },
  { name: "Surface", swatch: "rj-swatch--surface", hex: "#F7F7F7" },
  { name: "Muted", swatch: "rj-swatch--muted", hex: "#8F8F8F" },
  { name: "Muted Alt", swatch: "rj-swatch--muted-alt", hex: "#9CA3AF" },
] as const;

const TYPE_SAMPLES = [
  { variant: "display" as const, label: "Display · 6.2rem / 300", sample: "Tomorrow's Brands" },
  { variant: "title" as const, label: "Title · 4rem / 300", sample: "Our approach." },
  { variant: "heading" as const, label: "Heading · 2.8rem / 300", sample: "Strategy, Design, Performance." },
  { variant: "subhead" as const, label: "Subhead · 2.6rem / 300", sample: "Quality over quantity." },
  { variant: "lead" as const, label: "Lead · 2rem / 300", sample: "We partner with five clients a year." },
  {
    variant: "body" as const,
    label: "Body · 1.6rem / 400",
    sample: "Emotional connection and sustainable growth are the two essentials.",
  },
  { variant: "caption" as const, label: "Caption · 1.4rem / 400", sample: "San Diego, USA · Paris, France" },
];

function DesignSystemPage() {
  return (
    <div className="theme-dark rj-atmosphere min-h-screen">
      <header className="rj-header">
        <div className="rj-header__inner">
          <Logo />
          <nav className="rj-nav" aria-label="Design system">
            <a href="#typography">Typography</a>
            <a href="#color">Color</a>
            <a href="#grid">Grid</a>
            <a href="#scroll">Scroll</a>
          </nav>
        </div>
      </header>

      <main>
        <Section variant="hero" id="hero">
          <Container>
            <Grid>
              <GridItem span={6}>
                <Text as="p" variant="caption" muted className="mb-rj-4">
                  Design system · Rejouice tokens
                </Text>
                <Text as="h1" variant="display">
                  UXLAB
                </Text>
                <Text as="p" variant="lead" muted className="mt-rj-4 max-w-[36ch]">
                  Type, color, grid, and Lenis inertia scroll — extracted from
                  rejouice.com and wired as reusable tokens.
                </Text>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <hr className="rj-rule" />

        <Section id="typography">
          <Container>
            <Grid>
              <GridItem span={4}>
                <Text as="h2" variant="heading">
                  Typography
                </Text>
                <Text as="p" variant="body" muted className="mt-rj-3">
                  Suisse Intl Light (300) and Regular (400), matching Rejouice
                  @font-face weights. Root rem calibrated to 10px at lg.
                </Text>
              </GridItem>
              <GridItem span={6}>
                <div className="flex flex-col gap-rj-6">
                  {TYPE_SAMPLES.map((row) => (
                    <div key={row.variant} className="flex flex-col gap-rj-2">
                      <Text as="p" variant="caption" muted>
                        {row.label}
                      </Text>
                      <Text as="p" variant={row.variant}>
                        {row.sample}
                      </Text>
                    </div>
                  ))}
                </div>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <hr className="rj-rule" />

        <Section id="color">
          <Container>
            <Grid>
              <GridItem span={4}>
                <Text as="h2" variant="heading">
                  Color
                </Text>
                <Text as="p" variant="body" muted className="mt-rj-3">
                  Near-monochrome system: pure black/white with surface and muted
                  greys from computed styles on rejouice.com.
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

        <Section id="grid">
          <Container>
            <Grid>
              <GridItem span={4}>
                <Text as="h2" variant="heading">
                  Grid &amp; layout
                </Text>
                <Text as="p" variant="body" muted className="mt-rj-3">
                  6 columns / 0.4rem gutter / 1rem margin on small screens; 12
                  columns / 2rem gutter / 4rem margin from 768px — Rejouice
                  --grid-* tokens.
                </Text>
              </GridItem>
              <GridItem span={6}>
                <div className="rj-grid">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="rj-grid-demo-cell">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <hr className="rj-rule" />

        <Section id="scroll">
          <Container>
            <Grid>
              <GridItem span={6}>
                <Text as="h2" variant="heading">
                  Scroll
                </Text>
                <Text as="p" variant="lead" muted className="mt-rj-4 max-w-[40ch]">
                  Lenis smooth wheel with lerp 0.1 — the same library and feel
                  Rejouice ships (data-lenis-prevent on overlays, RAF-driven
                  ticker).
                </Text>
                <Text as="p" variant="body" muted className="mt-rj-4 max-w-[48ch]">
                  Scroll this page to feel the inertia. Keep going — the type
                  scale below gives the scroll room to show itself.
                </Text>
              </GridItem>
              <GridItem span={6}>
                <div className="flex flex-col gap-rj-4">
                  <Logo size="lg" />
                  <Text as="p" variant="caption" muted>
                    Brand mark from witty-quicker-606444.framer.app ·
                    public/brand/uxlab-logo.svg
                  </Text>
                </div>
              </GridItem>
            </Grid>
          </Container>
        </Section>

        <Section variant="tight">
          <Container>
            <div className="flex flex-col gap-rj-8 py-rj-10">
              {Array.from({ length: 4 }, (_, i) => (
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
