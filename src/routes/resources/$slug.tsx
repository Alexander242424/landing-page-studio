import { lazy, Suspense, useEffect } from "react";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ArticleView,
  buildArticleJsonLd,
} from "@/components/article/ArticleView";
import {
  ARTICLE_CATALOG_QUERY_KEY,
  getArticleCatalogSeed,
  resolveCanonicalSlugFrom,
  toPublicArticle,
} from "@/lib/articleCatalog";
import { listPublishedArticles } from "@/lib/articleCatalog.functions";
import { articlePath } from "@/lib/articles";
import { SITE, absoluteUrl, defaultLinks, defaultMeta, pageTitle } from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params, context }) => {
    let catalog;
    try {
      catalog = await listPublishedArticles();
      context.queryClient.setQueryData(ARTICLE_CATALOG_QUERY_KEY, catalog);
    } catch {
      catalog = {
        items: getArticleCatalogSeed(),
        source: "seed" as const,
      };
    }

    const canonicalSlug = resolveCanonicalSlugFrom(catalog.items, params.slug);
    if (!canonicalSlug) throw notFound();
    if (canonicalSlug !== params.slug) {
      throw redirect({
        to: "/resources/$slug",
        params: { slug: canonicalSlug },
      });
    }
    const row = catalog.items.find((item) => item.slug === canonicalSlug);
    if (!row || row.status !== "published") throw notFound();
    const article = toPublicArticle(row);
    const related = catalog.items
      .filter((item) => item.slug !== article.slug)
      .slice(0, 3)
      .map(toPublicArticle);
    return { article, related };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return { meta: [{ title: pageTitle("Article") }] };
    }

    const path = articlePath(article.slug);

    return {
      meta: [
        ...defaultMeta({
          title: article.title,
          description: article.description,
          path,
          image: article.image,
          type: "article",
          keywords: [...SITE.keywords, ...article.keywords],
          author: article.author.name,
          publishedTime: article.datePublished,
          modifiedTime: article.dateModified,
          imageAlt: article.imageAlt || article.title,
        }),
        { property: "article:section", content: article.category },
        { property: "article:author", content: article.author.name },
        ...article.keywords.map((keyword) => ({
          property: "article:tag" as const,
          content: keyword,
        })),
        { name: "citation_title", content: article.title },
        { name: "citation_author", content: article.author.name },
        {
          name: "citation_publication_date",
          content: article.datePublished,
        },
      ],
      links: defaultLinks(path),
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article, related } = Route.useLoaderData();
  const canonical = absoluteUrl(articlePath(article.slug));
  const jsonLd = buildArticleJsonLd(article, canonical);

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "article";
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
    <div className="theme-light rj-page rj-page--article min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main className="rj-page__main rj-article-page">
        <ArticleView article={article} related={related} />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
