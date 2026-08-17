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
  /** CSS aspect-ratio (e.g. "992 / 1150") when media shouldn't use the layout default. */
  aspectRatio?: string;
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

/**
 * Full case-study bodies (detail pages). Listing/mega fields are seeded into
 * Supabase `case_studies` (see workCatalog.ts) and fall back to this module.
 *
 * `hasPage`:
 * - `true`  → detail route at /work/$slug, sitemap entry, list hover + “View case”
 * - `false` → listed on /work only (name/meta); getCase() returns undefined so /work/$slug 404s
 */
export type CaseStudy = {
  slug: string;
  client: string;
  /** Client wordmark for the case hero (black ink on white). */
  logo: string;
  /** Short mega/list title — same as formatCaseHeadline(headline). */
  title: string;
  /** Two-line mega / glance / list title (line + emphasis). */
  headline: CaseHeadline;
  description: string;
  year: string;
  meta: CaseMetaField[];
  services: string[];
  hero: CaseMedia;
  /**
   * When false, case is index-only (listed on /work without a detail page).
   * Prefer this over inventing placeholder clients — set false when a name
   * should appear in the list before a write-up ships.
   */
  hasPage: boolean;
  /** Work-list hover reveal; defaults to hero.src when omitted. */
  hoverImage?: string;
  stats?: CaseStatsSection;
  blocks: CaseBlock[];
  ogImage: string;
  keywords: string[];
  datePublished: string;
  dateModified: string;
};

export const WORK_PATH = "/work";

export function formatCaseHeadline(headline: CaseHeadline): string {
  return `${headline.line} ${headline.emphasis}`;
}

export const CASES: CaseStudy[] = [
  {
    slug: "oura",
    client: "Oura",
    logo: "/logos/oura.svg",
    title: "Day-7 retention up by redesigning the first-value moment.",
    hasPage: true,
    hoverImage: "/glance/oura.jpg",
    headline: {
      line: "Day-7 retention up",
      emphasis: "by redesigning the first-value moment.",
    },
    description:
      "How UXLAB redesigned Oura's first seven days — mapping onboarding to first value so readiness and recovery clicked in the first week, not the fourth.",
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
  publishedStub({
    slug: "bankrollu",
    client: "Bankroll U",
    logo: "/logos/bankrollu.svg",
    headline: {
      line: "Bet placed faster",
      emphasis: "by simplifying sports market UI.",
    },
    description:
      "How UXLAB cleaned Bankroll U's market view so the next play reads instantly — cutting the steps between conviction and action.",
    heroSrc: "/cases/bankrollu/hero.jpg",
    glanceSrc: "/glance/bankrollu.jpg",
    aspectRatio: "992 / 880",
    services: ["Product design", "CRO", "Activation"],
    intro:
      "Bankroll U lives in the seconds between plays — odds, conviction, and the next move. We shaped product surfaces that keep markets readable when attention is scarce and the clock is moving.",
    vision:
      "Make every market moment feel decisive — clear enough to act, calm enough to trust.",
    narrativeHeading: "Clarity under game-day pressure.",
    narrative: [
      "Sports markets fail when the interface adds noise to an already loud moment. The work was hierarchy: what must read in a glance, what can wait, and how conviction stays intact from browse to bet.",
      "We partnered on product patterns that protect speed without sacrificing trust — so the next play feels inevitable, not improvised.",
    ],
  }),
  publishedStub({
    slug: "grono",
    client: "Grono",
    logo: "/logos/grono.svg",
    headline: {
      line: "Weekly content output up",
      emphasis: "by redesigning the planning surface.",
    },
    description:
      "How UXLAB redesigned Grono's core planning surface — turning dashboard sprawl into one calm session that plans a week of content.",
    heroSrc: "/cases/grono/hero.jpg",
    glanceSrc: "/glance/grono.jpg",
    aspectRatio: "992 / 1150",
    services: ["Product design", "Brand systems", "Activation"],
    intro:
      "Grono helps teams turn one idea into a week of content. The product had to feel composed — a single surface that absorbs planning chaos instead of mirroring it.",
    vision:
      "One calm place to see the week ahead — so publishing feels like rhythm, not scramble.",
    narrativeHeading: "Composition over dashboard sprawl.",
    narrative: [
      "Content tools often grow by adding panes. We designed for composure: a primary plane that holds the week, secondary detail that appears only when it earns attention, and language that stays human while the system stays precise.",
      "The result is a product rhythm creators can live in — less hunting, more shipping.",
    ],
  }),
  publishedStub({
    slug: "nespresso",
    client: "Nespresso",
    logo: "/logos/nespresso.svg",
    headline: {
      line: "Mobile AOV up",
      emphasis: "by redesigning ritual and checkout flow.",
    },
    description:
      "How UXLAB redesigned Nespresso's mobile commerce to carry premium ritual on a small screen — fixing assortment, membership, and checkout so revenue per session improved.",
    heroSrc: "/cases/nespresso/hero.jpg",
    glanceSrc: "/glance/nespresso.jpg",
    aspectRatio: "992 / 988",
    services: ["Product design", "CRO", "Ecommerce"],
    intro:
      "Nespresso’s commerce experience has to carry premium ritual on a small screen — assortment, subscription, and checkout without losing the brand’s quiet confidence.",
    vision:
      "Make mobile feel like the boutique: curated, unhurried, and ready when the ritual begins.",
    narrativeHeading: "Ritual-first commerce on mobile.",
    narrative: [
      "Premium fails when mobile feels like a compressed desktop. We focused on the moments that define the cup: discovering the right blend, understanding membership, and completing purchase without breaking the mood.",
      "Hierarchy, imagery, and flow stayed restrained — so conversion feels like continuation of the brand, not a detour into a form.",
    ],
  }),
  publishedStub({
    slug: "foundrae",
    client: "Foundrae",
    logo: "/logos/foundrae.svg",
    headline: {
      line: "Purchase intent up",
      emphasis: "by redesigning narrative-to-cart flow.",
    },
    description:
      "How UXLAB rebuilt Foundrae's digital experience — leading with story, earning the purchase, and keeping the brand's editorial quality intact through checkout.",
    heroSrc: "/cases/foundrae/hero.jpg",
    glanceSrc: "/glance/foundrae.jpg",
    aspectRatio: "992 / 1150",
    services: ["Product design", "Brand systems", "Ecommerce"],
    intro:
      "Foundrae sells meaning as much as metal. The digital experience had to honor symbolism first — then open a clear path into the shop without diluting the story.",
    vision:
      "Let the story invite the hand — then make the shop feel like the natural next page.",
    narrativeHeading: "Story that earns the purchase.",
    narrative: [
      "Jewelry commerce often jumps to SKU grids. We designed a sequence where narrative sets desire, product detail confirms craft, and commerce stays quiet until the decision is ready.",
      "Visual language stayed editorial and spacious — so the brand’s mythology survives the scroll into checkout.",
    ],
  }),
  publishedStub({
    slug: "boostra",
    client: "Boostra",
    logo: "/logos/boostra.svg",
    headline: {
      line: "Faster CRO decisions",
      emphasis: "by making analysis teams can act on.",
    },
    description:
      "How UXLAB turned Boostra's conversion analysis into a short list of moves teams can ship this sprint — clear signal, prioritized friction, no dashboard archaeology.",
    heroSrc: "/cases/boostra/hero.jpg",
    glanceSrc: "/glance/boostra.jpg",
    aspectRatio: "992 / 880",
    services: ["CRO", "Product design", "Experimentation"],
    intro:
      "Boostra helps teams see where conversion breaks. The product job was not more charts — it was turning analysis into a short list of moves people can ship this sprint.",
    vision:
      "Make friction readable and prioritized — so diagnosis becomes the next experiment, not another report.",
    narrativeHeading: "Insight that survives the standup.",
    narrative: [
      "Analytics products fail when signal stays trapped in dashboards. We shaped hierarchy for what matters now, language that speaks to product and growth in the same breath, and surfaces that point to intervention — not just observation.",
      "The system is built for velocity: find the leak, design the fix, measure the lift, compound the win.",
    ],
  }),
  publishedStub({
    slug: "stan",
    client: "Stan",
    logo: "/logos/stan.svg",
    headline: {
      line: "More paying fans",
      emphasis: "by redesigning the exclusive access experience.",
    },
    description:
      "How UXLAB redesigned Stan's creator profiles and gate moments — making the offer obvious and the path to join short enough to convert on impulse.",
    heroSrc: "/cases/stan/hero.jpg",
    glanceSrc: "/glance/stan.jpg",
    aspectRatio: "992 / 1150",
    services: ["Product design", "Brand systems", "Activation"],
    intro:
      "Stan is where creators meet their closest audience. Profiles had to feel like a destination — exclusive without being opaque, premium without slowing the join.",
    vision:
      "Make access feel intentional — a profile that sells belonging before it asks for a signup.",
    narrativeHeading: "Membership as a product moment.",
    narrative: [
      "Creator platforms often bury exclusivity under generic social chrome. We designed profile and gate moments that lead with identity, make the offer obvious, and keep the path to join short enough to convert on impulse.",
      "The result is a surface creators can own — and fans can enter without losing the sense that they were invited.",
    ],
  }),
];

/**
 * First-section case page for glance clients — mirrors Oura’s opening rhythm
 * (hero + meta already in CaseView; body: intro lede → vision → media → narrative → media).
 */
function publishedStub({
  slug,
  client,
  logo,
  headline,
  description,
  heroSrc,
  glanceSrc,
  aspectRatio,
  services,
  intro,
  vision,
  narrativeHeading,
  narrative,
  year = "2024",
}: {
  slug: string;
  client: string;
  logo: string;
  headline: CaseHeadline;
  description: string;
  heroSrc: string;
  glanceSrc: string;
  aspectRatio?: string;
  services: string[];
  intro: string;
  vision: string;
  narrativeHeading: string;
  narrative: string[];
  year?: string;
}): CaseStudy {
  return {
    slug,
    client,
    logo,
    title: formatCaseHeadline(headline),
    hasPage: true,
    hoverImage: glanceSrc,
    headline,
    description,
    year,
    meta: [
      { label: "Client", value: client },
      { label: "Project type", value: "Product" },
      {
        label: "Services",
        value: services.slice(0, 3).join(", "),
      },
      { label: "Year", value: year },
    ],
    services,
    hero: {
      src: heroSrc,
      alt: `${client} case study hero`,
      layout: "full",
      aspectRatio,
    },
    blocks: [
      {
        type: "lede",
        label: "Introduction",
        align: "full",
        text: intro,
      },
      {
        type: "lede",
        label: "The vision",
        align: "center",
        text: vision,
      },
      {
        type: "media",
        media: [
          {
            src: glanceSrc,
            alt: `${client} — product atmosphere`,
            layout: "full",
          },
        ],
      },
      {
        type: "narrative",
        heading: narrativeHeading,
        paragraphs: narrative,
      },
      {
        type: "media",
        media: [
          {
            src: heroSrc,
            alt: `${client} — key product surface`,
            layout: "wide",
            aspectRatio,
          },
        ],
      },
    ],
    ogImage: heroSrc,
    keywords: [`${client} case study`, "UXLAB", "product design", "CRO"],
    datePublished: `${year}-01-01`,
    dateModified: "2026-08-15",
  };
}

/** All cases in the database (including listed-only). */
export function getAllCases(): CaseStudy[] {
  return CASES;
}

/** Cases shown on the /work index (every entry in the database). */
export function getListedCases(): CaseStudy[] {
  return CASES;
}

/**
 * Detail-page lookup. Returns undefined when the slug is missing or `hasPage` is false
 * so listed-only rows 404 at /work/$slug.
 */
export function getCase(slug: string): CaseStudy | undefined {
  const item = CASES.find((c) => c.slug === slug);
  if (!item?.hasPage) return undefined;
  return item;
}

export function hasCasePage(slug: string): boolean {
  return CASES.some((c) => c.slug === slug && c.hasPage);
}

export function casePath(slug: string): string {
  return `${WORK_PATH}/${slug}`;
}

export function caseHoverImage(caseStudy: CaseStudy): string {
  return caseStudy.hoverImage ?? caseStudy.hero.src;
}
