import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WorkList } from "@/components/work/WorkList";
import { WORK_PATH } from "@/lib/cases";
import {
  WORK_CATALOG_QUERY_KEY,
  getWorkCatalogSeed,
} from "@/lib/workCatalog";
import { listWorkCatalog } from "@/lib/workCatalog.functions";
import {
  SITE,
  absoluteUrl,
  defaultLinks,
  defaultMeta,
  organizationJsonLd,
} from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

const WORK_DESCRIPTION =
  "Selected work from UXLAB — conversion, product design, and AI engineering case studies with high-growth startups.";

export const Route = createFileRoute("/work/")({
  loader: async ({ context }) => {
    try {
      const catalog = await listWorkCatalog();
      context.queryClient.setQueryData(WORK_CATALOG_QUERY_KEY, catalog);
      return { catalog };
    } catch {
      const catalog = {
        items: getWorkCatalogSeed(),
        source: "seed" as const,
      };
      return { catalog };
    }
  },
  head: () => ({
    meta: defaultMeta({
      title: "Work / case studies",
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

function buildWorkJsonLd(items: ReturnType<typeof getWorkCatalogSeed>) {
  const url = absoluteUrl(WORK_PATH);
  const cases = items.filter((item) => item.hasPage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
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
          itemListElement: cases.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(item.href),
            name: `${item.client} — ${item.title}`,
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
  const { catalog } = Route.useLoaderData();
  const jsonLd = useMemo(
    () => buildWorkJsonLd(catalog.items),
    [catalog.items],
  );

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

          <h1 className="rj-work__title">
            We help teams drive growth through product performance, UX,
            conversion, activations, and LTV lifts that compound.
          </h1>
        </header>

        <WorkList items={catalog.items} />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
