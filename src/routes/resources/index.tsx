import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ARTICLES,
  articlePath,
  getArticleCategories,
} from "@/lib/articles";
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

const RESOURCES_PATH = "/resources";
const RESOURCES_DESCRIPTION =
  "UXLAB resources on activation, CRO, design systems, and AI in growth UX — practical notes from shipping product performance work.";

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

function buildResourcesJsonLd() {
  const url = absoluteUrl(RESOURCES_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
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
          itemListElement: ARTICLES.map((article, index) => ({
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
  const { category: categorySlug } = Route.useSearch();
  const categories = useMemo(() => getArticleCategories(), []);
  const activeCategory = useMemo(
    () => categoryFromSlug(categorySlug, categories),
    [categorySlug, categories],
  );

  const articles = useMemo(() => {
    if (activeCategory === "All") return ARTICLES;
    return ARTICLES.filter((article) => article.category === activeCategory);
  }, [activeCategory]);

  const jsonLd = useMemo(() => buildResourcesJsonLd(), []);

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
