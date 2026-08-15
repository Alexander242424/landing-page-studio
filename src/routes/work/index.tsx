import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WorkList } from "@/components/work/WorkList";
import {
  WORK_PATH,
  casePath,
  formatCaseHeadline,
  getListedCases,
} from "@/lib/cases";
import {
  SITE,
  absoluteUrl,
  defaultLinks,
  defaultMeta,
} from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

const WORK_DESCRIPTION =
  "Selected product and brand work from UXLAB — case studies in activation, CRO, and growth UX.";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: defaultMeta({
      title: "Work",
      description: WORK_DESCRIPTION,
      path: WORK_PATH,
      keywords: [
        ...SITE.keywords,
        "case studies",
        "product design work",
        "CRO case studies",
        "UXLAB work",
      ],
    }),
    links: defaultLinks(WORK_PATH),
  }),
  component: WorkIndexPage,
});

function buildWorkJsonLd() {
  const url = absoluteUrl(WORK_PATH);
  const cases = getListedCases().filter((c) => c.hasPage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: "Work",
        description: WORK_DESCRIPTION,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.origin}/#website` },
        publisher: { "@id": `${SITE.origin}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: cases.map((caseStudy, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(casePath(caseStudy.slug)),
            name: `${caseStudy.client} — ${formatCaseHeadline(caseStudy.headline)}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: url,
          },
        ],
      },
    ],
  };
}

function WorkIndexPage() {
  const jsonLd = useMemo(() => buildWorkJsonLd(), []);

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "work";
    document.documentElement.style.setProperty("--rj-dark-progress", "0");
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
    <div className="theme-dark rj-page rj-page--work min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main className="rj-page__main rj-work-page">
        <header className="rj-work__header">
          <nav className="rj-article__crumbs rj-work__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Home
                </Link>
              </li>
              <li aria-current="page">
                <span>Work</span>
              </li>
            </ol>
          </nav>

          <h1 className="rj-work__title">Work</h1>
          <p className="rj-work__lede">
            Selected product and brand engagements — activation, CRO,
            <br />
            and growth UX built to ship.
          </p>
        </header>

        <WorkList />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
