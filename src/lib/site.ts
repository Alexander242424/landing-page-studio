import { HOME_FAQS } from "@/lib/faq";

/** Canonical site identity + default SEO / GEO helpers for uxlab.digital */
export const SITE = {
  origin: "https://uxlab.digital",
  name: "UXLAB",
  legalName: "UXLAB",
  tagline: "Growth through product performance",
  title: "UXLAB — Growth Product Performance Agency",
  titleTemplate: "%s — UXLAB",
  description:
    "UXLAB is a growth product performance agency. We improve conversion, activation, retention, and LTV through UX, CRO, experimentation, and AI-native product work.",
  keywords: [
    "UXLAB",
    "growth agency",
    "product performance",
    "conversion rate optimization",
    "CRO",
    "activation",
    "retention",
    "LTV",
    "product UX",
    "experimentation",
    "AI transformation",
    "Warsaw",
  ],
  author: "Alex Tyshchenko",
  email: "alex@uxlab.digital",
  locale: "en_US",
  language: "en",
  ogImage: "/og.png",
  /** Width/height of the canonical OG image — avoids a speculative fetch by crawlers */
  ogImageWidth: "1200",
  ogImageHeight: "630",
  favicon: "/favicon.ico",
  faviconPng: "/favicon.png",
  appleTouchIcon: "/apple-touch-icon.png",
  themeColor: "#0a0a0a",
  /** Set to "@handle" once an X/Twitter account is live */
  twitterHandle: "",
  location: {
    city: "Warsaw",
    country: "Poland",
    countryCode: "PL",
  },
  sameAs: [] as string[],
} as const;

export type SiteMetaLink = {
  rel: string;
  href: string;
  type?: string;
};

export type SiteMetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { charSet: string };

/** Build an absolute URL from a path or pass through absolute URLs. */
export function absoluteUrl(pathOrUrl = "/"): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE.origin}${path}`;
}

export function pageTitle(title?: string): string {
  if (!title || title === SITE.title) return SITE.title;
  if (title.includes(SITE.name)) return title;
  return SITE.titleTemplate.replace("%s", title);
}

type DefaultMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  robots?: string;
  /** Override OG image dimensions (width × height) */
  imageWidth?: string;
  imageHeight?: string;
  /** article:published_time — set for blog/article pages */
  publishedTime?: string;
  /** article:modified_time */
  modifiedTime?: string;
};

/** Default document meta (title, description, OG, Twitter, robots). */
export function defaultMeta(options: DefaultMetaOptions = {}): SiteMetaTag[] {
  const title = pageTitle(options.title);
  const description = options.description ?? SITE.description;
  const url = absoluteUrl(options.path ?? "/");
  const image = absoluteUrl(options.image ?? SITE.ogImage);
  const imageWidth = options.imageWidth ?? SITE.ogImageWidth;
  const imageHeight = options.imageHeight ?? SITE.ogImageHeight;
  const keywords = (options.keywords ?? [...SITE.keywords]).join(", ");
  const robots =
    options.robots ?? "index,follow,max-image-preview:large,max-snippet:-1";
  const type = options.type ?? "website";

  const tags: SiteMetaTag[] = [
    { title },
    { name: "description", content: description },
    { name: "author", content: SITE.author },
    { name: "keywords", content: keywords },
    { name: "robots", content: robots },
    { name: "theme-color", content: SITE.themeColor },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: imageWidth },
    { property: "og:image:height", content: imageHeight },
    { property: "og:image:alt", content: `${SITE.name} — ${SITE.tagline}` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  if (SITE.twitterHandle) {
    tags.push(
      { name: "twitter:site", content: SITE.twitterHandle },
      { name: "twitter:creator", content: SITE.twitterHandle },
    );
  }

  if (options.publishedTime) {
    tags.push({
      property: "article:published_time",
      content: options.publishedTime,
    });
  }
  if (options.modifiedTime) {
    tags.push({
      property: "article:modified_time",
      content: options.modifiedTime,
    });
  }

  return tags;
}

/** Shared head links: canonical, favicon, LLM index alternates. */
export function defaultLinks(path = "/"): SiteMetaLink[] {
  return [
    { rel: "canonical", href: absoluteUrl(path) },
    { rel: "icon", href: SITE.favicon, type: "image/x-icon" },
    { rel: "icon", href: SITE.faviconPng, type: "image/png" },
    { rel: "apple-touch-icon", href: SITE.appleTouchIcon },
    {
      rel: "alternate",
      type: "text/plain",
      href: absoluteUrl("/llms.txt"),
    },
    {
      rel: "alternate",
      type: "text/plain",
      href: absoluteUrl("/llms-full.txt"),
    },
  ];
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE.origin}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin,
    email: SITE.email,
    description: SITE.description,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE.origin}/#logo`,
      url: absoluteUrl(SITE.faviconPng),
      contentUrl: absoluteUrl(SITE.faviconPng),
      width: 512,
      height: 512,
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.ogImage),
      width: parseInt(SITE.ogImageWidth, 10),
      height: parseInt(SITE.ogImageHeight, 10),
    },
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.location.city,
        addressCountry: SITE.location.countryCode,
      },
    },
    areaServed: "Worldwide",
    knowsAbout: [
      "Conversion Rate Optimization",
      "Product UX Design",
      "User Activation Design",
      "A/B Experimentation",
      "Retention Optimization",
      "LTV Growth",
      "AI Product Engineering",
      "SaaS Growth Design",
      "Growth Product Performance",
      "Product Analytics",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "sales",
      availableLanguage: ["English"],
    },
    ...(SITE.sameAs.length ? { sameAs: [...SITE.sameAs] } : {}),
  };
}

export function webSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.origin}/#website`,
    url: SITE.origin,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.origin}/#organization` },
  };
}

/** ProfessionalService node — exposes all service offerings in structured form */
export function professionalServiceJsonLd() {
  return {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${SITE.origin}/#professional-service`,
    name: `${SITE.name} — Growth Product Agency`,
    description: SITE.description,
    url: SITE.origin,
    email: SITE.email,
    priceRange: "Custom",
    areaServed: "Worldwide",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressCountry: SITE.location.countryCode,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Growth product performance services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Product metrics performance",
            description:
              "CRO, activation, retention, and LTV lifts that compound — fixing the screens and steps where people stall.",
            url: `${SITE.origin}/solutions/product-performance`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Product Design",
            description:
              "End-to-end product design — structure, flows, and UI aimed at activation, conversion, and LTV.",
            url: `${SITE.origin}/solutions/product-design`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Websites + Funnels",
            description:
              "Marketing and product sites that clarify the offer and turn visits into qualified demand.",
            url: `${SITE.origin}/solutions/websites`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Testing & Experimentation",
            description:
              "User research and A/B experiments that validate changes before you ship.",
            url: `${SITE.origin}/solutions/testing-experimentation`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Engineering",
            description:
              "AI-native product features that cut friction or open revenue — clearer workflows, smarter surfaces.",
            url: `${SITE.origin}/solutions/ai-engineering`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI MVP to Product",
            description:
              "Turning vibe-coded prototypes and AI-generated builds into products users can trust and use.",
            url: `${SITE.origin}/solutions/ai-mvp-to-product`,
          },
        },
      ],
    },
    parentOrganization: { "@id": `${SITE.origin}/#organization` },
  };
}

export function faqPageJsonLd(
  faqs: ReadonlyArray<{ question: string; answer: string }> = HOME_FAQS,
) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE.origin}/#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Home page JSON-LD graph: Organization + WebSite + ProfessionalService + FAQPage. */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      webSiteJsonLd(),
      professionalServiceJsonLd(),
      faqPageJsonLd(),
    ],
  };
}
