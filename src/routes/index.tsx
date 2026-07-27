import { createFileRoute, Link } from "@tanstack/react-router";

import heroImage from "../assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — Crafted for Clarity" },
      {
        name: "description",
        content:
          "Atelier is a quiet workspace for teams who value focus, craft, and intentional design.",
      },
      { property: "og:title", content: "Atelier — Crafted for Clarity" },
      {
        property: "og:description",
        content:
          "Atelier is a quiet workspace for teams who value focus, craft, and intentional design.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="font-serif text-2xl font-medium tracking-tight">
          Atelier
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Approach
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </nav>
        <a
          href="#contact"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Get in touch
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="px-6 pt-24 pb-20 lg:px-8 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Focused work, by design
          </span>
          <h1 className="mt-8 max-w-[14ch] font-serif text-5xl font-medium leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl">
            Crafted for clarity
          </h1>
          <p className="mt-8 max-w-[48ch] text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
            Atelier is a quiet workspace for teams who believe the best work happens when everything
            unnecessary is removed.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start a project
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-border bg-secondary px-8 py-3.5 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Explore the approach
            </a>
          </div>
        </div>

        <div className="mt-20 overflow-hidden rounded-2xl border border-border/60 bg-muted">
          <img
            src={heroImage}
            alt="A warm, minimalist workspace bathed in natural light"
            className="aspect-[16/9] w-full object-cover"
            width={1440}
            height={810}
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      number: "01",
      title: "Intentional space",
      description:
        "Every element is placed with purpose. We strip away noise so your team can focus on what matters.",
    },
    {
      number: "02",
      title: "Quiet craft",
      description:
        "Polished interactions, restrained typography, and a calm rhythm that respects the user's attention.",
    },
    {
      number: "03",
      title: "Enduring build",
      description:
        "Built on stable foundations with clean code and timeless design decisions that age gracefully.",
    },
  ];

  return (
    <section id="features" className="border-y border-border/60 bg-secondary/40 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.number} className="flex flex-col gap-4">
              <span className="font-mono text-xs font-medium text-muted-foreground">
                {feature.number}
              </span>
              <h3 className="font-serif text-2xl font-medium tracking-tight">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground text-pretty">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="px-6 py-24 text-center lg:px-8 lg:py-40">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl">
          Ready to build something calm?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground text-pretty">
          Tell us what you're working on. We'll help you shape it into something clear, focused, and
          lasting.
        </p>
        <div className="mt-10">
          <a
            href="mailto:hello@atelier.studio"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            hello@atelier.studio
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-12 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Link to="/" className="font-serif text-xl font-medium tracking-tight">
          Atelier
        </Link>
        <nav className="flex gap-8">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms
          </a>
        </nav>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Atelier. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
