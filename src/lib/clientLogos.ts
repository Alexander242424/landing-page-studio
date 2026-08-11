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
  { id: "stan", src: "/logos/stan.svg", alt: "Stan" },
  { id: "forbes", src: "/logos/forbes.svg", alt: "Forbes" },
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
