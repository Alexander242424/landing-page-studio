import { lazy, Suspense, useEffect } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CaseView, buildCaseJsonLd } from "@/components/case/CaseView";
import { casePath, getCase } from "@/lib/cases";
import { SITE, absoluteUrl, pageTitle } from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const caseStudy = getCase(params.slug);
    if (!caseStudy) throw notFound();
    return { caseStudy };
  },
  head: ({ loaderData }) => {
    const caseStudy = loaderData?.caseStudy;
    if (!caseStudy) {
      return { meta: [{ title: pageTitle("Case study") }] };
    }

    const path = casePath(caseStudy.slug);
    const canonical = absoluteUrl(path);
    const image = absoluteUrl(caseStudy.ogImage);
    const title = pageTitle(`${caseStudy.client} case study`);

    return {
      meta: [
        { title },
        { name: "description", content: caseStudy.description },
        { name: "keywords", content: caseStudy.keywords.join(", ") },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { name: "theme-color", content: "#ffffff" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${caseStudy.client} case study` },
        { property: "og:description", content: caseStudy.description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { property: "og:site_name", content: SITE.name },
        { property: "og:locale", content: SITE.locale },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${caseStudy.client} case study` },
        { name: "twitter:description", content: caseStudy.description },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: canonical },
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
      ],
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
