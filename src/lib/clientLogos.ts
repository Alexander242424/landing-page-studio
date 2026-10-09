/**
 * Client / partner marks for the homepage logo strip.
 * Primary pool: UXLAB Framer “Featured engagements” SVGs.
 * A few prior marks kept as extras so the crossfade pool stays larger than the 8 slots.
 */
export type ClientLogo = {
  id: string;
  src: string;
  alt: string;
};

export const CLIENT_LOGOS: ClientLogo[] = [
  // Featured engagements (UXLAB)
  { id: "calendly", src: "/logos/calendly.svg", alt: "Calendly" },
  /* Asset is Tapmy wordmark (+ mark); strip uses brightness(0) — black paths are strip-safe. */
  { id: "stan", src: "/logos/stan.svg", alt: "Tapmy" },
  { id: "forbes", src: "/logos/forbes.svg", alt: "Forbes" },
  { id: "tradevision", src: "/logos/tradevision.svg", alt: "TradeVision" },
  { id: "nespresso", src: "/logos/nespresso.svg", alt: "Nespresso" },
  { id: "softr", src: "/logos/softr.svg", alt: "softr" },
  { id: "zara", src: "/logos/zara.svg", alt: "ZARA" },
  { id: "polymarket", src: "/logos/polymarket.svg", alt: "Polymarket" },
  { id: "easy", src: "/logos/easy.svg", alt: "easy" },
  {
    id: "forbes-travel-guide",
    src: "/logos/forbes-travel-guide.svg",
    alt: "Forbes Travel Guide",
  },
  { id: "pipedrive", src: "/logos/pipedrive.svg", alt: "pipedrive" },
  // Extras for crossfade variety
  { id: "rivian", src: "/logos/rivian.svg", alt: "Rivian" },
  { id: "oura", src: "/logos/oura.svg", alt: "Oura" },
  { id: "moxion", src: "/logos/moxion.svg", alt: "Moxion" },
  { id: "rappi", src: "/logos/rappi.svg", alt: "Rappi" },
  { id: "hyperframe", src: "/logos/hyperframe.svg", alt: "Hyperframe" },
  { id: "awwwards", src: "/logos/awwwards.svg", alt: "Awwwards" },
];

/** Initial visible set — Featured engagements order (8 slots). */
export const LOGO_STRIP_SEED_IDS = [
  "calendly",
  "stan",
  "forbes",
  "nespresso",
  "softr",
  "zara",
  "polymarket",
  "easy",
] as const;

/** Homepage partners rail (light band above FAQ). */
export const PARTNER_RAIL_IDS = [
  "calendly",
  "softr",
  "pipedrive",
  "polymarket",
  "stan",
  "oura",
  "tradevision",
  "hyperframe",
] as const;

/** Customers section logo table (monochrome marks on dark). */
export const CUSTOMER_LOGO_GRID_IDS = [
  "forbes-travel-guide",
  "awwwards",
  "rappi",
  "hyperframe",
  "stan",
  "nespresso",
  "calendly",
  "forbes",
  "tradevision",
  "softr",
  "polymarket",
  "pipedrive",
  "oura",
  "rivian",
  "zara",
  "easy",
] as const;

/** Logo ids that have a published case study. */
const LOGO_CASE_SLUGS: Partial<Record<string, string>> = {
  oura: "oura",
  nespresso: "nespresso",
  stan: "stan",
  forbes: "forbes",
  "forbes-travel-guide": "forbes",
  tradevision: "tradevision",
};

function logosByIds(ids: readonly string[]): ClientLogo[] {
  return ids.map(
    (id) => CLIENT_LOGOS.find((logo) => logo.id === id) ?? CLIENT_LOGOS[0]!,
  );
}

export function customerLogoGrid(): ClientLogo[] {
  return logosByIds(CUSTOMER_LOGO_GRID_IDS);
}

export function partnerRailLogos(): ClientLogo[] {
  return logosByIds(PARTNER_RAIL_IDS);
}

/** Published case slug for a logo id, when we have a matching case study. */
export function logoCaseSlug(id: string): string | undefined {
  return LOGO_CASE_SLUGS[id];
}

/** Case page when we have one; otherwise the work index. */
export function logoWorkHref(id: string): string {
  const slug = logoCaseSlug(id);
  return slug ? `/work/${slug}` : "/work";
}
