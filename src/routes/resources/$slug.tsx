import { lazy, Suspense, useEffect } from "react";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ArticleView,
  buildArticleJsonLd,
} from "@/components/article/ArticleView";
import {
  articlePath,
  getArticle,
  resolveCanonicalArticleSlug,
} from "@/lib/articles";
import { SITE, absoluteUrl, pageTitle } from "@/lib/site";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const canonicalSlug = resolveCanonicalArticleSlug(params.slug);
    if (!canonicalSlug) throw notFound();
    if (canonicalSlug !== params.slug) {
      throw redirect({
        to: "/resources/$slug",
        params: { slug: canonicalSlug },
      });
    }
    const article = getArticle(canonicalSlug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return { meta: [{ title: pageTitle("Article") }] };
    }

    const path = articlePath(article.slug);
    const canonical = absoluteUrl(path);
    const image = absoluteUrl(article.image);
    const title = pageTitle(article.title);

    return {
      meta: [
        { title },
        { name: "description", content: article.description },
        { name: "author", content: article.author.name },
        { name: "keywords", content: article.keywords.join(", ") },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { name: "theme-color", content: SITE.themeColor },
        { property: "og:type", content: "article" },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { property: "og:site_name", content: SITE.name },
        { property: "og:locale", content: SITE.locale },
        { property: "article:published_time", content: article.datePublished },
        { property: "article:modified_time", content: article.dateModified },
        { property: "article:section", content: article.category },
        { property: "article:author", content: article.author.name },
        ...article.keywords.map((keyword) => ({
          property: "article:tag" as const,
          content: keyword,
        })),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: article.description },
        { name: "twitter:image", content: image },
        { name: "citation_title", content: article.title },
        { name: "citation_author", content: article.author.name },
        {
          name: "citation_publication_date",
          content: article.datePublished,
        },
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
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
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
        <ArticleView article={article} />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
