import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  catalogFromSeed,
  type ArticleCatalogResult,
  type CatalogArticle,
} from "@/lib/articleCatalog";

const AuthorSchema = z.object({
  name: z.string(),
  jobTitle: z.string(),
  url: z.string(),
});

const SectionSchema = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
  bullets: z.array(z.string()).optional(),
});

const FaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const ArticleRow = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["draft", "published"]),
  sort_order: z.coerce.number(),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  answer_capsule: z.string(),
  date: z.string(),
  date_published: z.string(),
  date_modified: z.string(),
  read_time: z.string(),
  image: z.string(),
  image_alt: z.string(),
  author: AuthorSchema.catch({ name: "", jobTitle: "", url: "" }),
  keywords: z.array(z.string()).nullish().transform((value) => value ?? []),
  entities: z.array(z.string()).nullish().transform((value) => value ?? []),
  takeaways: z.array(z.string()).nullish().transform((value) => value ?? []),
  sections: z.array(SectionSchema).nullish().transform((value) => value ?? []),
  faq: z.array(FaqSchema).nullish().transform((value) => value ?? []),
  created_at: z.string(),
  updated_at: z.string(),
});

const FETCH_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 60_000;

let catalogCache: { at: number; result: ArticleCatalogResult } | null = null;

export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env["SUPABASE_URL"]?.replace(/\/$/, "");
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return null;
  return { url, key };
}

export function restHeaders(cfg: { url: string; key: string }, extra?: HeadersInit) {
  return {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };
}

export function rowToCatalogArticle(
  row: z.infer<typeof ArticleRow>,
): CatalogArticle {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    sortOrder: row.sort_order,
    category: row.category,
    title: row.title,
    description: row.description,
    answerCapsule: row.answer_capsule,
    date: row.date,
    datePublished: row.date_published,
    dateModified: row.date_modified,
    readTime: row.read_time,
    image: row.image,
    imageAlt: row.image_alt,
    author: row.author,
    keywords: row.keywords,
    entities: row.entities,
    takeaways: row.takeaways,
    sections: row.sections,
    faq: row.faq,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseArticleRows(json: unknown): CatalogArticle[] {
  if (!Array.isArray(json)) return [];
  const items: CatalogArticle[] = [];
  for (const entry of json) {
    const parsed = ArticleRow.safeParse(entry);
    if (parsed.success) items.push(rowToCatalogArticle(parsed.data));
  }
  return items;
}

export async function fetchSupabaseArticles(options: {
  publishedOnly: boolean;
  timeoutMs?: number;
}): Promise<CatalogArticle[] | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? FETCH_TIMEOUT_MS,
  );

  const filter = options.publishedOnly ? "&status=eq.published" : "";
  const url = `${cfg.url}/rest/v1/articles?select=*&order=sort_order.asc${filter}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: restHeaders(cfg),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `[articleCatalog] Supabase read failed (${response.status}): ${body}`,
      );
      return null;
    }

    const json: unknown = await response.json();
    return parseArticleRows(json);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[articleCatalog] Supabase read timed out");
    } else {
      console.warn("[articleCatalog] Supabase read error", error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function seedResult(): ArticleCatalogResult {
  return { items: catalogFromSeed(), source: "seed" };
}

export function invalidateArticleCatalogCache() {
  catalogCache = null;
}

/**
 * Public catalog: published articles only.
 * Prefers Supabase; falls back to src/lib/articles.ts.
 */
export async function resolveArticleCatalog(): Promise<ArticleCatalogResult> {
  if (catalogCache && Date.now() - catalogCache.at < CACHE_TTL_MS) {
    return catalogCache.result;
  }

  const remote = await fetchSupabaseArticles({ publishedOnly: true });
  const result: ArticleCatalogResult = remote
    ? { items: remote, source: "supabase" }
    : seedResult();

  catalogCache = { at: Date.now(), result };
  return result;
}

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(
  async () => resolveArticleCatalog(),
);

export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(180) }).parse(input),
  )
  .handler(async ({ data }) => {
    const catalog = await resolveArticleCatalog();
    const item = catalog.items.find((article) => article.slug === data.slug);
    if (!item || item.status !== "published") return null;
    return { article: item, source: catalog.source };
  });
