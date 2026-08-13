export type CaseMetaField = {
  label: string;
  value: string;
};

export type CaseStat = {
  value: string;
  label: string;
};

/** Metalab StatRows-style outcomes block. */
export type CaseStatsSection = {
  title: string;
  introLabel?: string;
  intro?: string;
  items: CaseStat[];
};

export type CaseMedia = {
  src: string;
  alt: string;
  /**
   * full = edge-to-edge / near-bleed
   * wide = inset landscape
   * pair = half of a two-up
   * portrait = tall single / split tile
   */
  layout?: "full" | "wide" | "pair" | "portrait";
};

/**
 * Case body modules — mapped to Metalab Suno section patterns:
 * lede → TitleAndText
 * narrative → sticky 50/50 text (adapted)
 * split → TextAnd1Image / TextAnd2Images
 * media → full / pair / collage media modules
 * quote → pull quote
 */
export type CaseBlock =
  | {
      type: "lede";
      label: string;
      text: string;
      /** full ≈ Suno Introduction; center ≈ chapter / vision */
      align?: "full" | "center";
    }
  | {
      type: "narrative";
      heading: string;
      paragraphs: string[];
    }
  | {
      type: "split";
      text: string;
      media: CaseMedia[];
      /** aside = text column + media (TextAnd1/2Images); stack = text under */
      variant?: "aside" | "stack";
    }
  | {
      type: "media";
      media: CaseMedia[];
      caption?: string;
    }
  | {
      type: "quote";
      text: string;
      attribution?: string;
    };

/** Two-line glance / case hero headline (primary + muted emphasis). */
export type CaseHeadline = {
  line: string;
  emphasis: string;
};

export type CaseStudy = {
  slug: string;
  client: string;
  /** Client wordmark for the case hero (black ink on white). */
  logo: string;
  /** Plain client/name fallback for meta & schema. */
  title: string;
  /** Shared with homepage glance cards. */
  headline: CaseHeadline;
  description: string;
  year: string;
  meta: CaseMetaField[];
  services: string[];
  hero: CaseMedia;
  stats?: CaseStatsSection;
  blocks: CaseBlock[];
  ogImage: string;
  keywords: string[];
  datePublished: string;
  dateModified: string;
};

export function formatCaseHeadline(headline: CaseHeadline): string {
  return `${headline.line} ${headline.emphasis}`;
}

export const CASES: CaseStudy[] = [
  {
    slug: "oura",
    client: "Oura",
    logo: "/logos/oura.svg",
    title: "Oura",
    headline: {
      line: "Category-defining wearables",
      emphasis: "brand & product experience.",
    },
    description:
      "How UXLAB shaped a wearable brand and product experience around readiness, recovery, and rituals people keep — not dashboards they abandon.",
    year: "2024",
    meta: [
      { label: "Client", value: "Oura" },
      { label: "Project type", value: "Product" },
      { label: "Services", value: "Product design, Brand systems, CRO" },
      { label: "Year", value: "2024" },
    ],
    services: ["Product design", "Brand systems", "CRO", "Activation"],
    hero: {
      src: "/cases/oura/hero.jpg",
      alt: "Product interface on a display — Oura case study hero",
      layout: "full",
    },
    stats: {
      title: "Compounding outcomes",
      introLabel: "Impact",
      intro:
        "As the experience system shipped, readiness and recovery became clearer in the first week — rituals invited return, and signals stayed calm enough for people to act on without cognitive load.",
      items: [
        { value: "↑ Readiness", label: "Clearer first-week aha" },
        { value: "↑ Retention", label: "Rituals that invite return" },
        { value: "↑ Trust", label: "Signals people can act on" },
      ],
    },
    blocks: [
      // Suno: TitleAndText Introduction (large lede)
      {
        type: "lede",
        label: "Introduction",
        align: "full",
        text: "Oura is defining the category of wearable wellness — translating recovery science into rituals people keep. What began as a product narrative engagement became a partnership across brand, product experience, and activation.",
      },
      // Suno: TitleAndText “The vision”
      {
        type: "lede",
        label: "The vision",
        align: "center",
        text: "Make sleep and recovery feel inevitable — not technical. A destination where readiness is understood in a glance.",
      },
      // Suno: VideoScrollerAndText → full-bleed media + narrative
      {
        type: "media",
        media: [
          {
            src: "/cases/oura/cover.jpg",
            alt: "Atmospheric cover visual for the Oura experience",
            layout: "full",
          },
        ],
      },
      {
        type: "narrative",
        heading: "Partnership built for velocity.",
        paragraphs: [
          "Wearables win when insight becomes habit. The challenge was not more charts; it was helping people understand readiness, act with confidence, and come back the next morning without cognitive load.",
          "We partnered as an extension of the team: how scores speak, how rituals surface, and how the brand stays calm while the science stays precise — shipping systems, not slide decks.",
        ],
      },
      // Suno: chapter TitleAndText
      {
        type: "lede",
        label: "The language of recovery",
        align: "center",
        text: "A quiet brand system that honors the body — precise when it must be, human when it matters.",
      },
      // Suno: TextAnd3Images → split + collage media
      {
        type: "split",
        variant: "aside",
        text: "We mapped the first fourteen days — from unboxing to the first score that actually changed behavior. Every surface had one job: reduce friction to the next meaningful action. Visual language stayed restrained: generous type, quiet color, imagery that feels human rather than clinical.",
        media: [
          {
            src: "/glance/oura-case.jpg",
            alt: "Oura product moment — lifestyle and interface",
            layout: "portrait",
          },
          {
            src: "/cases/oura/detail-1.jpg",
            alt: "Detail of product storytelling surfaces",
            layout: "wide",
          },
        ],
      },
      {
        type: "media",
        media: [
          {
            src: "/glance/oura.jpg",
            alt: "Oura case visual — brand atmosphere",
            layout: "pair",
          },
          {
            src: "/cases/oura/cover.jpg",
            alt: "Oura ring and product context",
            layout: "pair",
          },
        ],
      },

      // Suno: chapter + TextAnd1/2Images sequence
      {
        type: "lede",
        label: "First-week clarity",
        align: "center",
        text: "Scores that read instantly. Rituals that invite return. Education that never overwhelms.",
      },
      {
        type: "split",
        variant: "aside",
        text: "Metrics earned their place only when they changed a decision. We designed hierarchy for readiness, shared patterns for education, and experiment-ready modules for onboarding and paywall moments — so the team could compound wins without reinventing the language each sprint.",
        media: [
          {
            src: "/cases/oura/detail-2.jpg",
            alt: "Mobile product moment from the engagement",
            layout: "portrait",
          },
        ],
      },
      {
        type: "quote",
        text: "The product should feel like a quiet coach — present when it matters, invisible when it doesn’t.",
        attribution: "UXLAB · Product principle",
      },
      {
        type: "media",
        media: [
          {
            src: "/cases/oura/detail-1.jpg",
            alt: "Wide story surface from the Oura engagement",
            layout: "wide",
          },
        ],
        caption: "Story surfaces that lead with outcome, then invite detail.",
      },
      // Suno: Discovery / system chapters
      {
        type: "lede",
        label: "A system designed to evolve",
        align: "center",
        text: "Building a foundation with flexibility for fluid growth — activation as a loop, not a launch event.",
      },
      {
        type: "narrative",
        heading: "Systems that protect conversion under velocity.",
        paragraphs: [
          "As features shipped, the system held: consistent hierarchy for scores, shared patterns for education, and modules ready for experiment. We treated activation as a loop — first value creates the next reason to return.",
          "The result is a clearer category story and a product rhythm that supports daily use — readiness that reads instantly, recovery that feels personal, and a system ready for the next experiment.",
        ],
      },
      {
        type: "media",
        media: [
          {
            src: "/cases/oura/detail-2.jpg",
            alt: "Paired product moment — primary",
            layout: "pair",
          },
          {
            src: "/cases/oura/detail-3.jpg",
            alt: "Paired product moment — secondary",
            layout: "pair",
          },
        ],
      },
      {
        type: "split",
        variant: "aside",
        text: "This case reflects the UXLAB approach: diagnose the highest-friction moments, design interventions meant to ship, and leave a system that compounds — brand and product experience people can live in.",
        media: [
          {
            src: "/cases/oura/detail-3.jpg",
            alt: "Closing product moment from the Oura engagement",
            layout: "wide",
          },
        ],
      },
    ],
    ogImage: "/cases/oura/hero.jpg",
    keywords: [
      "Oura case study",
      "wearable UX",
      "product design",
      "activation",
      "UXLAB",
      "brand systems",
    ],
    datePublished: "2024-09-12",
    dateModified: "2026-08-11",
  },
  stubCase({
    slug: "rivian",
    client: "Rivian",
    logo: "/logos/rivian.svg",
    headline: {
      line: "+71,000 pre-orders",
      emphasis: "after brand reveal — ~$5.68B.",
    },
    heroSrc: "/glance/rivian.jpg",
  }),
  stubCase({
    slug: "tensr",
    client: "Tensr",
    logo: "/logos/tensr.svg",
    headline: {
      line: "+1799% activations",
      emphasis: "performance-led redesign.",
    },
    // Still for /work hero + OG (glance card uses work-01.mp4).
    heroSrc: "/glance/tensr-metalab.jpg",
  }),
  stubCase({
    slug: "moxion",
    client: "Moxion",
    logo: "/logos/moxion-wordmark.svg",
    headline: {
      line: "+395% conversion rate",
      emphasis: "in 3 weeks.",
    },
    heroSrc: "/glance/moxion.jpg",
  }),
  stubCase({
    slug: "hyperframe",
    client: "Hyperframe",
    logo: "/logos/hyperframe.svg",
    headline: {
      line: "+150% LTV:CAC",
      emphasis: "across launch funnels.",
    },
    heroSrc: "/glance/hyperframe-metalab.jpg",
  }),
  stubCase({
    slug: "noovo",
    client: "Noovo",
    logo: "/logos/noovo.svg",
    headline: {
      line: "End-to-end brand system",
      emphasis: "from launch to scale.",
    },
    heroSrc: "/glance/pergola.jpg",
  }),
  stubCase({
    slug: "rappi",
    client: "Rappi",
    logo: "/logos/rappi.svg",
    headline: {
      line: "$5M+ in new business",
      emphasis: "in 90 days.",
    },
    heroSrc: "/glance/rappi-metalab.jpg",
  }),
];

/** Minimal case page so glance cards can deep-link before a full write-up ships. */
function stubCase({
  slug,
  client,
  logo,
  headline,
  heroSrc,
  year = "2024",
}: {
  slug: string;
  client: string;
  logo: string;
  headline: CaseHeadline;
  heroSrc: string;
  year?: string;
}): CaseStudy {
  return {
    slug,
    client,
    logo,
    title: client,
    headline,
    description: `${client} case study — full write-up coming soon.`,
    year,
    meta: [
      { label: "Client", value: client },
      { label: "Project type", value: "Product" },
      { label: "Services", value: "Product design, Brand systems, CRO" },
      { label: "Year", value: year },
    ],
    services: ["Product design", "Brand systems", "CRO"],
    hero: {
      src: heroSrc,
      alt: `${client} case study`,
      layout: "full",
    },
    blocks: [
      {
        type: "lede",
        label: "Introduction",
        align: "full",
        text: `We're preparing a deeper look at our work with ${client}. In the meantime, reach out if you're building something that needs to perform.`,
      },
    ],
    ogImage: heroSrc,
    keywords: [`${client} case study`, "UXLAB"],
    datePublished: `${year}-01-01`,
    dateModified: "2026-08-11",
  };
}

export function getCase(slug: string): CaseStudy | undefined {
  return CASES.find((item) => item.slug === slug);
}

export function casePath(slug: string): string {
  return `/work/${slug}`;
}
