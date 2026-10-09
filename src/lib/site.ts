import { HOME_FAQS } from "@/lib/faq";
import { SOLUTIONS } from "@/lib/solutions";

/** Canonical site identity + default SEO / GEO helpers for uxlab.digital */
export const SITE = {
  origin: "https://uxlab.digital",
  name: "UXLAB",
  legalName: "UXLAB",
  tagline: "Conversion rate optimisation systems for revenue growth",
  title: "UXLAB — Conversion rate optimisation systems for revenue growth",
  titleTemplate: "%s — UXLAB",
  description:
    "Without spending a single cent more on Google Ads, Facebook ads, SEO or content marketing.",
  keywords: [
    "UXLAB",
    "product partner",
    "high-growth startups",
    "AI startups",
    "conversion rate optimisation",
    "CRO",
    "product design",
    "websites",
    "landing pages",
    "testing and experimentation",
    "AI native engineering",
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
  /** Real profile URLs only — footer placeholders are not sameAs. */
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
  author?: string;
  themeColor?: string;
  /** Override OG image dimensions (width × height) */
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
  imageType?: string;
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
  const imageAlt = options.imageAlt ?? `${SITE.name} — ${SITE.tagline}`;
  const imageType =
    options.imageType ??
    (image.endsWith(".png")
      ? "image/png"
      : image.endsWith(".webp")
        ? "image/webp"
        : image.endsWith(".jpg") || image.endsWith(".jpeg")
          ? "image/jpeg"
          : undefined);
  const keywords = (options.keywords ?? [...SITE.keywords]).join(", ");
  const robots =
    options.robots ??
    "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
  const type = options.type ?? "website";
  const themeColor = options.themeColor ?? SITE.themeColor;

  const tags: SiteMetaTag[] = [
    { title },
    { name: "description", content: description },
    { name: "author", content: options.author ?? SITE.author },
    { name: "keywords", content: keywords },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "bingbot", content: robots },
    { name: "theme-color", content: themeColor },
    { name: "geo.region", content: SITE.location.countryCode },
    { name: "geo.placename", content: SITE.location.city },
    { name: "language", content: SITE.language },
    { name: "rating", content: "general" },
    { name: "format-detection", content: "telephone=no" },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: imageWidth },
    { property: "og:image:height", content: imageHeight },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
  ];

  if (imageType) {
    tags.push({ property: "og:image:type", content: imageType });
  }

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
    {
      rel: "alternate",
      type: "application/rss+xml",
      href: absoluteUrl("/feed.xml"),
    },
    {
      rel: "sitemap",
      type: "application/xml",
      href: absoluteUrl("/sitemap.xml"),
    },
    { rel: "author", href: absoluteUrl("/humans.txt") },
    { rel: "describedby", href: absoluteUrl("/llms.txt") },
  ];
}

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": `${SITE.origin}/#founder`,
    name: SITE.author,
    jobTitle: "Founder",
    email: SITE.email,
    url: SITE.origin,
    worksFor: { "@id": `${SITE.origin}/#organization` },
  };
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
    founder: { "@id": `${SITE.origin}/#founder` },
    brand: { "@type": "Brand", name: SITE.name },
    slogan: SITE.tagline,
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
      ...SOLUTIONS.map((item) => item.title),
      "AI startups",
      "High-growth startups",
      "Product engineering",
      "Conversion design",
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
    alternateName: ["UX LAB", "UXLAB Digital"],
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.origin}/#organization` },
    about: { "@id": `${SITE.origin}/#professional-service` },
  };
}

export function homeWebPageJsonLd(path = "/") {
  const url = absoluteUrl(path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: SITE.title,
    description: SITE.description,
    inLanguage: SITE.language,
    isPartOf: { "@id": `${SITE.origin}/#website` },
    about: { "@id": `${SITE.origin}/#professional-service` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.ogImage),
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        ".rj-customers__tagline",
        ".rj-intro__tagline",
        ".rj-hero__headline",
        ".rj-faq",
      ],
    },
  };
}

/** ProfessionalService node — exposes all service offerings in structured form */
export function professionalServiceJsonLd() {
  return {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${SITE.origin}/#professional-service`,
    name: `${SITE.name} — Product + build partner`,
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
    knowsAbout: SOLUTIONS.map((item) => item.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Product, conversion, and AI engineering services",
      itemListElement: SOLUTIONS.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.body,
          url: `${SITE.origin}/solutions/${item.slug}`,
        },
      })),
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
export function homeJsonLd(path = "/") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personJsonLd(),
      organizationJsonLd(),
      webSiteJsonLd(),
      homeWebPageJsonLd(path),
      professionalServiceJsonLd(),
      faqPageJsonLd(),
    ],
  };
}
