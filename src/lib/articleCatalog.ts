import {
  ARTICLES,
  DEFAULT_ARTICLE_AUTHOR,
  LEGACY_ARTICLE_SLUGS,
  type Article,
  type ArticleFaq,
  type ArticleSection,
} from "@/lib/articles";

export type ArticleStatus = "draft" | "published";

export type CatalogArticle = Article & {
  id: string;
  status: ArticleStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ArticleCatalogSource = "supabase" | "seed";

export type ArticleCatalogResult = {
  items: CatalogArticle[];
  source: ArticleCatalogSource;
};

export const ARTICLE_CATALOG_QUERY_KEY = ["article-catalog"] as const;

export const ARTICLE_CATEGORIES = [
  "Product News",
  "Best Practices",
  "Engineering",
  "Announcements",
] as const;

export function slugifyArticleTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function formatArticleDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function articleWordCount(article: Pick<
  Article,
  "title" | "description" | "answerCapsule" | "takeaways" | "sections" | "faq"
>): number {
  const chunks = [
    article.title,
    article.description,
    article.answerCapsule,
    ...article.takeaways,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
    ...article.faq.flatMap((item) => [item.question, item.answer]),
  ];
  return chunks.join(" ").split(/\s+/).filter(Boolean).length;
}

export function estimateArticleReadTime(
  article: Pick<
    Article,
    "title" | "description" | "answerCapsule" | "takeaways" | "sections" | "faq"
  >,
): string {
  const minutes = Math.max(1, Math.round(articleWordCount(article) / 200));
  return `${minutes} min read`;
}

export function publishedArticles(
  items: CatalogArticle[],
): CatalogArticle[] {
  return items.filter((item) => item.status === "published");
}

export function articleCategoriesFrom(
  items: Array<Pick<Article, "category">>,
): string[] {
  return [...new Set(items.map((item) => item.category).filter(Boolean))];
}

export function relatedArticlesFrom(
  items: Article[],
  slug: string,
  limit = 3,
): Article[] {
  return items.filter((item) => item.slug !== slug).slice(0, limit);
}

export function resolveCanonicalSlugFrom(
  items: Array<Pick<Article, "slug">>,
  slug: string,
): string | undefined {
  if (items.some((item) => item.slug === slug)) return slug;
  const mapped = LEGACY_ARTICLE_SLUGS[slug];
  if (mapped && items.some((item) => item.slug === mapped)) return mapped;
  if (mapped && ARTICLES.some((item) => item.slug === mapped)) return mapped;
  return undefined;
}

export function megaArticles(
  items: CatalogArticle[],
  limit = 4,
): CatalogArticle[] {
  return publishedArticles(items).slice(0, limit);
}

export function seedCatalogId(slug: string): string {
  return `seed-${slug}`;
}

export function catalogFromSeed(
  articles: Article[] = ARTICLES,
): CatalogArticle[] {
  const now = "2026-08-17T00:00:00.000Z";
  return articles.map((article, index) => ({
    ...article,
    id: seedCatalogId(article.slug),
    status: "published" as const,
    sortOrder: index,
    createdAt: `${article.datePublished}T00:00:00.000Z`,
    updatedAt: `${article.dateModified}T00:00:00.000Z` || now,
  }));
}

export function getArticleCatalogSeed(): CatalogArticle[] {
  return catalogFromSeed();
}

export function toPublicArticle(item: CatalogArticle): Article {
  const {
    id: _id,
    status: _status,
    sortOrder: _sortOrder,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...article
  } = item;
  return article;
}

export function emptyCatalogArticle(): CatalogArticle {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    slug: "",
    status: "draft",
    sortOrder: 0,
    category: ARTICLE_CATEGORIES[0],
    title: "",
    description: "",
    answerCapsule: "",
    date: formatArticleDisplayDate(today),
    datePublished: today,
    dateModified: today,
    readTime: "1 min read",
    image: "",
    imageAlt: "",
    author: {
      name: DEFAULT_ARTICLE_AUTHOR.name,
      jobTitle: DEFAULT_ARTICLE_AUTHOR.jobTitle,
      url: DEFAULT_ARTICLE_AUTHOR.url,
    },
    keywords: [],
    entities: [],
    takeaways: [""],
    sections: [
      {
        heading: "",
        paragraphs: [""],
        bullets: [],
      } satisfies ArticleSection,
    ],
    faq: [{ question: "", answer: "" } satisfies ArticleFaq],
    createdAt: "",
    updatedAt: "",
  };
}

export function uniqueCopySlug(base: string, existing: string[]): string {
  const root = `${base.replace(/-copy(-\d+)?$/, "")}-copy`;
  if (!existing.includes(root)) return root;
  let n = 2;
  while (existing.includes(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
