/**
 * Client / partner marks for the homepage logo strip.
 * Sourced from Rejouice (Prismic `brands_logos` + award/widget SVGs);
 * additional case-study names as Aeonik path wordmarks to fill the pool.
 */
export type ClientLogo = {
  id: string;
  src: string;
  alt: string;
};

export const CLIENT_LOGOS: ClientLogo[] = [
  { id: "rivian", src: "/logos/rivian.svg", alt: "Rivian" },
  { id: "rivian-mark", src: "/logos/rivian-mark.svg", alt: "Rivian" },
  { id: "oura", src: "/logos/oura.svg", alt: "Oura" },
  { id: "ov-loop", src: "/logos/ov-loop.svg", alt: "OV Loop" },
  { id: "moxion", src: "/logos/moxion.svg", alt: "Moxion" },
  { id: "moxion-alt", src: "/logos/moxion-alt.svg", alt: "Moxion" },
  { id: "moxion-wordmark", src: "/logos/moxion-wordmark.svg", alt: "Moxion" },
  { id: "hyperframe", src: "/logos/hyperframe.svg", alt: "Hyperframe" },
  { id: "hyperframe-alt", src: "/logos/hyperframe-alt.svg", alt: "Hyperframe" },
  { id: "rappi", src: "/logos/rappi.svg", alt: "Rappi" },
  { id: "proof", src: "/logos/proof.svg", alt: "Proof" },
  { id: "proof-alt", src: "/logos/proof-alt.svg", alt: "Proof" },
  { id: "noovo", src: "/logos/noovo.svg", alt: "Noovo" },
  { id: "tensr", src: "/logos/tensr.svg", alt: "Tensr" },
  { id: "eight-vc", src: "/logos/eight-vc.svg", alt: "8VC" },
  { id: "fwa", src: "/logos/fwa.svg", alt: "FWA" },
  { id: "awwwards", src: "/logos/awwwards.svg", alt: "Awwwards" },
  { id: "behance", src: "/logos/behance.svg", alt: "Behance" },
  { id: "webby", src: "/logos/webby.svg", alt: "Webby Awards" },
  { id: "tensor", src: "/logos/tensor.svg", alt: "Tensor" },
  { id: "terminal", src: "/logos/terminal.svg", alt: "Terminal" },
  { id: "icomat", src: "/logos/icomat.svg", alt: "ICOMAT" },
  { id: "intrepid", src: "/logos/intrepid.svg", alt: "Intrepid" },
  { id: "unspun", src: "/logos/unspun.svg", alt: "Unspun" },
  { id: "gencell", src: "/logos/gencell.svg", alt: "GenCell" },
  { id: "duchateau", src: "/logos/duchateau.svg", alt: "Du Chateau" },
  { id: "list-across", src: "/logos/list-across.svg", alt: "List Across" },
  { id: "pinch", src: "/logos/pinch.svg", alt: "Pinch" },
  { id: "connect-homes", src: "/logos/connect-homes.svg", alt: "Connect Homes" },
  { id: "engineered-floors", src: "/logos/engineered-floors.svg", alt: "Engineered Floors" },
];

/** Prefer authentic Rejouice strip marks for the initial visible set. */
export const LOGO_STRIP_SEED_IDS = [
  "rivian",
  "oura",
  "moxion",
  "eight-vc",
  "rappi",
  "hyperframe",
  "ov-loop",
  "proof",
] as const;
