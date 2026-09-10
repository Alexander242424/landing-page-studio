import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ARTICLE_CATALOG_QUERY_KEY,
  articleCategoriesFrom,
  getArticleCatalogSeed,
  publishedArticles,
} from "@/lib/articleCatalog";
import { listPublishedArticles } from "@/lib/articleCatalog.functions";
import { articlePath } from "@/lib/articles";
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

const RESOURCES_PATH = "/resources";
const RESOURCES_DESCRIPTION =
  "UXLAB resources on conversion, product design, experimentation, and AI engineering — practical notes from shipping with high-growth startups.";

type ResourcesSearch = {
  category?: string;
};

function categoryToSlug(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryFromSlug(slug: string | undefined, categories: string[]) {
  if (!slug) return "All";
  const match = categories.find(
    (category) => categoryToSlug(category) === slug,
  );
  return match ?? "All";
}

export const Route = createFileRoute("/resources/")({
  validateSearch: (search: Record<string, unknown>): ResourcesSearch => ({
    category:
      typeof search.category === "string" && search.category.trim()
        ? search.category.trim()
        : undefined,
  }),
  loader: async ({ context }) => {
    try {
      const catalog = await listPublishedArticles();
      context.queryClient.setQueryData(ARTICLE_CATALOG_QUERY_KEY, catalog);
      return { catalog };
    } catch {
      return {
        catalog: {
          items: getArticleCatalogSeed(),
          source: "seed" as const,
        },
      };
    }
  },
  head: () => ({
    meta: defaultMeta({
      title: "Resources",
      description: RESOURCES_DESCRIPTION,
      path: RESOURCES_PATH,
      keywords: [
        ...SITE.keywords,
        "resources",
        "insights",
        "product UX articles",
        "CRO playbooks",
      ],
    }),
    links: defaultLinks(RESOURCES_PATH),
  }),
  component: ResourcesIndexPage,
});

function buildResourcesJsonLd(articles: Array<{ slug: string; title: string }>) {
  const url = absoluteUrl(RESOURCES_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: "Resources",
        description: RESOURCES_DESCRIPTION,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.origin}/#website` },
        publisher: { "@id": `${SITE.origin}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(articlePath(article.slug)),
            name: article.title,
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
            name: "Resources",
            item: url,
          },
        ],
      },
    ],
  };
}

function ResourcesIndexPage() {
  const navigate = Route.useNavigate();
  const { catalog } = Route.useLoaderData();
  const { category: categorySlug } = Route.useSearch();
  const published = useMemo(
    () => publishedArticles(catalog.items),
    [catalog.items],
  );
  const categories = useMemo(
    () => articleCategoriesFrom(published),
    [published],
  );
  const activeCategory = useMemo(
    () => categoryFromSlug(categorySlug, categories),
    [categorySlug, categories],
  );

  const articles = useMemo(() => {
    if (activeCategory === "All") return published;
    return published.filter((article) => article.category === activeCategory);
  }, [activeCategory, published]);

  const jsonLd = useMemo(() => buildResourcesJsonLd(published), [published]);

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "resources";
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

  function selectCategory(category: string) {
    void navigate({
      to: "/resources",
      search:
        category === "All"
          ? {}
          : { category: categoryToSlug(category) },
      replace: false,
    });
  }

  return (
    <div className="theme-light rj-page rj-page--article min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main className="rj-page__main rj-resources-page">
        <header className="rj-resources__header">
          <nav className="rj-article__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Home
                </Link>
              </li>
              <li aria-current="page">
                <span>Resources</span>
              </li>
            </ol>
          </nav>

          <h1 className="rj-resources__title">Resources</h1>
          <p className="rj-resources__lede">
            Notes from shipping growth UX — activation, CRO, systems,
            <br />
            and where AI actually helps product performance.
          </p>
        </header>

        <div
          className="rj-resources__filters"
          role="tablist"
          aria-label="Filter by category"
        >
          {["All", ...categories].map((category) => {
            const selected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selected}
                className={
                  selected
                    ? "rj-resources__filter rj-resources__filter--active"
                    : "rj-resources__filter"
                }
                onClick={() => selectCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>

        <section
          className="rj-resources__list"
          aria-label={
            activeCategory === "All"
              ? "All resources"
              : `${activeCategory} resources`
          }
        >
          {articles.length > 0 ? (
            <BlogGrid articles={articles} className="rj-resources__grid" />
          ) : (
            <p className="rj-resources__empty">No articles in this category.</p>
          )}
        </section>
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
