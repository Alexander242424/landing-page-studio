import gsap from "gsap";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { GetInTouchSection } from "@/components/home/GetInTouchSection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ToolverseDirectory } from "@/components/toolverse/ToolverseDirectory";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";
import {
  SITE,
  absoluteUrl,
  defaultLinks,
  defaultMeta,
  organizationJsonLd,
} from "@/lib/site";
import { TOOL_CATEGORIES, TOOLVERSE_PATH } from "@/lib/toolverse";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

const DESCRIPTION =
  "A curated directory of tools UXLAB uses for UX, CRO, analytics, tracking, traffic, and user research.";

const HEADLINE_MOBILE_MQ = "(max-width: 767px)";

const TOOLVERSE_HEADLINE_DESKTOP = [
  "Tools for UX, CRO, and the",
  "traffic you already have.",
] as const;

const TOOLVERSE_HEADLINE_MOBILE = [
  "Tools for UX,",
  "CRO, and the traffic",
  "you already have.",
] as const;

function useToolverseHeadlineLines(): readonly string[] {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(HEADLINE_MOBILE_MQ).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(HEADLINE_MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile ? TOOLVERSE_HEADLINE_MOBILE : TOOLVERSE_HEADLINE_DESKTOP;
}

export const Route = createFileRoute("/toolverse/")({
  head: () => ({
    meta: defaultMeta({
      title: "Toolverse",
      description: DESCRIPTION,
      path: TOOLVERSE_PATH,
      keywords: [
        ...SITE.keywords,
        "CRO tools",
        "analytics tools",
        "UX research tools",
        "tag management",
      ],
    }),
    links: defaultLinks(TOOLVERSE_PATH),
  }),
  component: ToolversePage,
});

function buildJsonLd() {
  const url = absoluteUrl(TOOLVERSE_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: "Toolverse",
        description: DESCRIPTION,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.origin}/#website` },
        publisher: { "@id": `${SITE.origin}/#organization` },
        about: TOOL_CATEGORIES.map((category) => ({
          "@type": "ItemList",
          name: category.title,
          itemListElement: category.tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: tool.href,
          })),
        })),
      },
    ],
  };
}

function ToolversePage() {
  const jsonLd = useMemo(() => buildJsonLd(), []);
  const headlineLines = useToolverseHeadlineLines();
  const pageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    const title = titleRef.current;
    const lede = ledeRef.current;
    if (!root || !title || !lede) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(title, {
          playOnLoad: true,
          delay: 0.35,
        }),
      );
      cleanups.push(
        createTextReveal(lede, {
          playOnLoad: true,
          delay: 2.05,
          duration: 1.1,
        }),
      );
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "toolverse";
    document.documentElement.style.setProperty("--rj-dark-progress", "1");
    document.body.classList.remove(
      "rj-scroll-hero",
      "rj-scroll-light",
      "rj-scroll-dark",
    );
    return () => {
      delete document.documentElement.dataset.rjRoute;
    };
  }, []);

  return (
    <div className="theme-dark rj-page rj-page--toolverse min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main ref={pageRef} className="rj-page__main rj-tv-page">
        <header className="rj-wf-page__header">
          <nav className="rj-article__crumbs rj-work__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Home
                </Link>
              </li>
              <li aria-current="page">
                <span>Toolverse</span>
              </li>
            </ol>
          </nav>
          <div className="rj-wf-page__copy">
            <h1 ref={titleRef} className="rj-hero__headline rj-awards-title">
              {headlineLines.map((line, index) => (
                <span key={`${index}-${line}`} className="rj-hero__line">
                  {line}
                  {index < headlineLines.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p
              ref={ledeRef}
              className="rj-hero__tagline rj-hero__description rj-text-reveal"
            >
              Analytics, tracking, testing, research, and vitals — the stack we
              actually use to find leaks and ship the fix.
            </p>
          </div>
        </header>

        <ToolverseDirectory />
        <GetInTouchSection />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
