import { lazy, Suspense, useEffect } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CaseView, buildCaseJsonLd } from "@/components/case/CaseView";
import { casePath, getCase } from "@/lib/cases";
import {
  WORK_CATALOG_QUERY_KEY,
  applyWorkCatalogOverlay,
} from "@/lib/workCatalog";
import { listWorkCatalog } from "@/lib/workCatalog.functions";
import { SITE, absoluteUrl, defaultLinks, defaultMeta, pageTitle } from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params, context }) => {
    const caseStudy = getCase(params.slug);
    if (!caseStudy) throw notFound();

    let catalog;
    try {
      catalog = await listWorkCatalog();
      context.queryClient.setQueryData(WORK_CATALOG_QUERY_KEY, catalog);
    } catch {
      return { caseStudy };
    }

    const row = catalog.items.find((item) => item.slug === params.slug);
    if (row && !row.hasPage) throw notFound();
    return {
      caseStudy: row ? applyWorkCatalogOverlay(caseStudy, row) : caseStudy,
    };
  },
  head: ({ loaderData }) => {
    const caseStudy = loaderData?.caseStudy;
    if (!caseStudy) {
      return { meta: [{ title: pageTitle("Case study") }] };
    }

    const path = casePath(caseStudy.slug);

    return {
      meta: defaultMeta({
        title: `${caseStudy.client} case study`,
        description: caseStudy.description,
        path,
        image: caseStudy.ogImage,
        type: "article",
        keywords: [...SITE.keywords, ...caseStudy.keywords],
        publishedTime: caseStudy.datePublished,
        modifiedTime: caseStudy.dateModified,
        imageAlt: `${caseStudy.client} case study`,
        themeColor: "#ffffff",
      }),
      links: defaultLinks(path),
    };
  },
  component: CasePage,
});

function CasePage() {
  const { caseStudy } = Route.useLoaderData();
  const canonical = absoluteUrl(casePath(caseStudy.slug));
  const jsonLd = buildCaseJsonLd(caseStudy, canonical);

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "case";
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
    <div className="theme-light rj-page rj-page--case min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main className="rj-page__main rj-case-page">
        <CaseView caseStudy={caseStudy} />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
