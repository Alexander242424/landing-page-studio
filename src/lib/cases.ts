export type CaseMetaField = {
  label: string;
  value: string;
};

export type CaseStat = {
  value: string;
  label: string;
};

/** Three hero outcomes — figure + short caption (metric + mechanism). */
export type CaseHeroStats = [CaseStat, CaseStat, CaseStat];

/** Optional Impact chrome; row content always comes from `heroStats`. */
export type CaseStatsSection = {
  title: string;
  introLabel?: string;
  intro?: string;
  items?: CaseStat[];
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
  /** Three large figures under the case H1 (replaces Client / Type / Services / Year). */
  heroStats: CaseHeroStats;
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
    title: "+3.2x day-7 return by redesigning the first-value moment.",
    hasPage: true,
    hoverImage: "/glance/oura.jpg",
    headline: {
      line: "+3.2x day-7 return",
      emphasis: "by redesigning the first-value moment.",
    },
    description:
      "+3.2x day-7 return after we mapped Oura onboarding to first value — readiness and recovery clicked in week one.",
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
    heroStats: [
      {
        value: "+3.2x",
        label: "Day-7 return by redesigning first value",
      },
      {
        value: "14 days",
        label: "Mapped from unbox to first behavior change",
      },
      {
        value: "Week 1",
        label: "Readiness and recovery that click",
      },
    ],
    blocks: [
      {
        type: "lede",
        label: "Challenge",
        align: "full",
        text: "Wearables win when insight becomes habit. The challenge was not more charts; it was helping people understand readiness, act with confidence, and come back the next morning without cognitive load.",
      },
      {
        type: "lede",
        label: "Solution",
        align: "full",
        text: "We partnered as an extension of the team: how scores speak, how rituals surface, and how the brand stays calm while the science stays precise — shipping systems, not slide decks. We mapped the first fourteen days, from unboxing to the first score that actually changed behavior.",
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
      line: "+2.6x bets completed",
      emphasis: "by simplifying sports market UI.",
    },
    description:
      "+2.6x bets completed after we cleaned Bankroll U's market view so the next play reads instantly.",
    heroSrc: "/cases/bankrollu/hero.jpg",
    glanceSrc: "/glance/bankrollu.jpg",
    aspectRatio: "1488 / 1725",
    services: ["Product design", "CRO", "Activation"],
    heroStats: [
      { value: "+2.6x", label: "Bets completed by simplifying market UI" },
      { value: "Seconds", label: "Markets that read between plays" },
      { value: "1 glance", label: "Hierarchy from browse to the next bet" },
    ],
    challenge:
      "Bankroll U lives in the seconds between plays — odds, conviction, and the next move. Sports markets fail when the interface adds noise to an already loud moment.",
    solution:
      "We shaped product surfaces that keep markets readable when attention is scarce. The work was hierarchy: what must read in a glance, what can wait, and how conviction stays intact from browse to bet.",
    impact:
      "Bets completed rose +2.6x after we cleaned the market view so the next play reads instantly — speed without sacrificing trust.",
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
      line: "+4x weekly output",
      emphasis: "by redesigning the planning surface.",
    },
    description:
      "+4x weekly output after we turned Grono's dashboard sprawl into one surface that plans a week of content.",
    heroSrc: "/cases/grono/hero.jpg",
    glanceSrc: "/glance/grono.jpg",
    aspectRatio: "992 / 1150",
    services: ["Product design", "Brand systems", "Activation"],
    heroStats: [
      { value: "+4x", label: "Weekly output by redesigning the planning surface" },
      { value: "1 surface", label: "A week of content, not dashboard sprawl" },
      { value: "7 days", label: "One idea composed across the week" },
    ],
    challenge:
      "Grono helps teams turn one idea into a week of content. Content tools often grow by adding panes — the product had started to mirror planning chaos instead of absorbing it.",
    solution:
      "We designed for composure: a primary plane that holds the week, secondary detail that appears only when it earns attention, and language that stays human while the system stays precise.",
    impact:
      "Weekly output rose +4x once the dashboard became one surface that plans a week of content — less hunting, more shipping.",
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
      line: "9x revenue lift",
      emphasis: "by conversions boost.",
    },
    description:
      "9x revenue lift by boosting conversions on Nespresso mobile — assortment, membership, and checkout without breaking the ritual.",
    heroSrc: "/cases/nespresso/hero.jpg",
    glanceSrc: "/glance/nespresso.jpg",
    aspectRatio: "1488 / 1725",
    services: ["Product design", "CRO", "Ecommerce"],
    heroStats: [
      { value: "9x", label: "Revenue lift by boosting mobile conversions" },
      { value: "1 ritual", label: "Assortment to checkout without a break" },
      { value: "1 screen", label: "Boutique feel on a small display" },
    ],
    challenge:
      "Nespresso’s commerce experience has to carry premium ritual on a small screen. Premium fails when mobile feels like a compressed desktop — assortment, membership, and checkout without losing the brand’s quiet confidence.",
    solution:
      "We focused on the moments that define the cup: discovering the right blend, understanding membership, and completing purchase without breaking the mood. Hierarchy, imagery, and flow stayed restrained.",
    impact:
      "A 9x revenue lift followed conversions that feel like continuation of the brand — not a detour into a form.",
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
      line: "+2.8x add-to-cart",
      emphasis: "by leading story into the shop.",
    },
    description:
      "+2.8x add-to-cart after we led with story and opened a clear path into the Foundrae shop.",
    heroSrc: "/cases/foundrae/hero.jpg",
    glanceSrc: "/glance/foundrae.jpg",
    aspectRatio: "992 / 1150",
    services: ["Product design", "Brand systems", "Ecommerce"],
    heroStats: [
      { value: "+2.8x", label: "Add-to-cart by leading story into the shop" },
      { value: "1 path", label: "Narrative that earns the purchase" },
      { value: "Story first", label: "Mythology that survives checkout" },
    ],
    challenge:
      "Foundrae sells meaning as much as metal. Jewelry commerce often jumps to SKU grids — the digital experience had to honor symbolism first, then open a clear path into the shop without diluting the story.",
    solution:
      "We designed a sequence where narrative sets desire, product detail confirms craft, and commerce stays quiet until the decision is ready. Visual language stayed editorial and spacious.",
    impact:
      "Add-to-cart rose +2.8x after story led into the shop — mythology that survives the scroll into checkout.",
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
      line: "+2.1x tests shipped",
      emphasis: "by making analysis teams can act on.",
    },
    description:
      "+2.1x tests shipped after we turned Boostra analysis into a short list of moves for this sprint.",
    heroSrc: "/cases/boostra/hero.jpg",
    glanceSrc: "/glance/boostra.jpg",
    aspectRatio: "1488 / 1725",
    services: ["CRO", "Product design", "Experimentation"],
    heroStats: [
      { value: "+2.1x", label: "Tests shipped from analysis teams can act on" },
      { value: "1 sprint", label: "A short list of moves, not another report" },
      { value: "Leak → lift", label: "Find the leak, ship the fix, compound" },
    ],
    challenge:
      "Boostra helps teams see where conversion breaks. Analytics products fail when signal stays trapped in dashboards — the job was not more charts, it was a short list of moves people can ship this sprint.",
    solution:
      "We shaped hierarchy for what matters now, language that speaks to product and growth in the same breath, and surfaces that point to intervention — not just observation.",
    impact:
      "Tests shipped rose +2.1x: find the leak, design the fix, measure the lift, compound the win.",
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
      line: "+197% conversions",
      emphasis: "by providing the right trials system.",
    },
    description:
      "+197% conversions after we rebuilt Tapmy exclusive access as a clear trials system — offer first, join in one step.",
    heroSrc: "/cases/stan/hero.jpg",
    glanceSrc: "/glance/stan.jpg",
    aspectRatio: "1488 / 1725",
    services: ["Product design", "Brand systems", "Activation"],
    heroStats: [
      { value: "+197%", label: "Conversions from a clear trials system" },
      { value: "1 step", label: "Offer first, join without friction" },
      { value: "1 profile", label: "Access that sells belonging before signup" },
    ],
    challenge:
      "Stan is where creators meet their closest audience. Creator platforms often bury exclusivity under generic social chrome — profiles had to feel like a destination, exclusive without being opaque.",
    solution:
      "We designed profile and gate moments that lead with identity, make the offer obvious, and keep the path to join short enough to convert on impulse.",
    impact:
      "Conversions rose +197% after exclusive access became a clear trials system — offer first, join in one step.",
    narrativeHeading: "Membership as a product moment.",
    narrative: [
      "Creator platforms often bury exclusivity under generic social chrome. We designed profile and gate moments that lead with identity, make the offer obvious, and keep the path to join short enough to convert on impulse.",
      "The result is a surface creators can own — and fans can enter without losing the sense that they were invited.",
    ],
  }),
  publishedStub({
    slug: "forbes",
    client: "Forbes",
    logo: "/logos/forbes.svg",
    headline: {
      line: "+3.1x suite inquiries",
      emphasis: "by leading with the destination.",
    },
    description:
      "+3.1x suite inquiries after we led Forbes hospitality with destination first — then opened a clear path to book.",
    heroSrc: "/cases/forbes/hero.jpg",
    glanceSrc: "/glance/forbes.jpg",
    aspectRatio: "1488 / 1725",
    services: ["Product design", "Brand systems", "Ecommerce"],
    heroStats: [
      { value: "+3.1x", label: "Suite inquiries by leading with the destination" },
      { value: "1 path", label: "Atmosphere first, then a clear book" },
      { value: "1 stay", label: "Destination that earns the inquiry" },
    ],
    challenge:
      "Forbes sells the destination as much as the stay. Hospitality often jumps to room grids — the digital experience had to honor atmosphere first, then open a clear path to inquire without flattening the luxury.",
    solution:
      "We designed a sequence where atmosphere sets desire, editorial detail confirms craft, and booking stays quiet until the decision is ready.",
    impact:
      "Suite inquiries rose +3.1x after we led with the destination — then opened a clear path to book.",
    narrativeHeading: "Destination that earns the stay.",
    narrative: [
      "Hospitality often jumps to room grids. We designed a sequence where atmosphere sets desire, editorial detail confirms craft, and booking stays quiet until the decision is ready.",
      "Visual language stayed cinematic and spacious — so the brand’s authority survives the scroll into inquiry.",
    ],
  }),
  publishedStub({
    slug: "tradevision",
    client: "TradeVision",
    logo: "/logos/tradevision.svg",
    headline: {
      line: "+2.4x daily sessions",
      emphasis: "by making options flow readable.",
    },
    description:
      "+2.4x daily sessions after we turned TradeVision options flow into a surface traders can read before the close.",
    heroSrc: "/cases/tradevision/hero.jpg",
    glanceSrc: "/glance/tradevision.jpg",
    aspectRatio: "1488 / 1482",
    services: ["Product design", "CRO", "Activation"],
    heroStats: [
      { value: "+2.4x", label: "Daily sessions by making options flow readable" },
      { value: "Minutes", label: "Flow that reads before the close" },
      { value: "1 glance", label: "Prints ranked for the next trade" },
    ],
    challenge:
      "TradeVision lives in the minutes before the close — flow, sentiment, and the next print. Options products fail when flow is a wall of prints.",
    solution:
      "The work was hierarchy: what must read in a glance, what can wait, and how conviction stays intact from sentiment to the next trade. We partnered on patterns that protect speed without sacrificing trust.",
    impact:
      "Daily sessions rose +2.4x after options flow became a surface traders can read before the close.",
    narrativeHeading: "Clarity before the close.",
    narrative: [
      "Options products fail when flow is a wall of prints. The work was hierarchy: what must read in a glance, what can wait, and how conviction stays intact from sentiment to the next trade.",
      "We partnered on product patterns that protect speed without sacrificing trust — so the next print feels inevitable, not improvised.",
    ],
    year: "2025",
  }),
];

/**
 * First-section case page for glance clients — mirrors Oura’s opening rhythm
 * (hero + 3 stats already in CaseView; body: Challenge → Solution → The Impact → media).
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
  heroStats,
  challenge,
  solution,
  impact: _impact,
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
  heroStats: CaseHeroStats;
  challenge: string;
  solution: string;
  impact: string;
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
    heroStats,
    blocks: [
      {
        type: "lede",
        label: "Challenge",
        align: "full",
        text: challenge,
      },
      {
        type: "lede",
        label: "Solution",
        align: "full",
        text: solution,
      },
      {
        type: "media",
        media: [
          {
            src: glanceSrc,
            alt: `${client} — product atmosphere`,
            layout: "full",
            aspectRatio,
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
