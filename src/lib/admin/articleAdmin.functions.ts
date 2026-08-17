import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session.server";
import {
  catalogFromSeed,
  estimateArticleReadTime,
  formatArticleDisplayDate,
  type ArticleCatalogResult,
  type ArticleStatus,
  type CatalogArticle,
} from "@/lib/articleCatalog";
import type { ArticleFaq, ArticleSection } from "@/lib/articles";
import {
  fetchSupabaseArticles,
  invalidateArticleCatalogCache,
  parseArticleRows,
  restHeaders,
  supabaseConfig,
} from "@/lib/articleCatalog.functions";

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

const SlugSchema = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

const ArticleWriteInput = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  slug: SlugSchema,
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().nonnegative().optional(),
  category: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  description: z.string().max(240),
  answerCapsule: z.string().max(800),
  date: z.string().max(40).optional(),
  datePublished: z.string().min(1).max(32),
  dateModified: z.string().max(32).optional(),
  readTime: z.string().max(40).optional(),
  image: z.string().max(500),
  imageAlt: z.string().max(200),
  author: AuthorSchema,
  keywords: z.array(z.string()),
  entities: z.array(z.string()),
  takeaways: z.array(z.string()),
  sections: z.array(SectionSchema).min(1, "Add at least one section"),
  faq: z.array(FaqSchema),
});

export type ArticleWriteInput = z.infer<typeof ArticleWriteInput>;

const ADMIN_TIMEOUT_MS = 8000;

function seedResult(): ArticleCatalogResult {
  return { items: catalogFromSeed(), source: "seed" };
}

function cleanStringList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function cleanSections(sections: ArticleSection[]): ArticleSection[] {
  return sections
    .map((section) => ({
      heading: section.heading.trim(),
      paragraphs: cleanStringList(section.paragraphs),
      bullets: section.bullets?.length
        ? cleanStringList(section.bullets)
        : undefined,
    }))
    .filter(
      (section) =>
        section.heading ||
        section.paragraphs.length > 0 ||
        (section.bullets?.length ?? 0) > 0,
    );
}

function cleanFaq(faq: ArticleFaq[]): ArticleFaq[] {
  return faq
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function itemToRow(input: ArticleWriteInput, sortOrder: number) {
  const datePublished = input.datePublished.slice(0, 10);
  const dateModified = (input.dateModified || datePublished).slice(0, 10);
  const sections = cleanSections(input.sections);
  const takeaways = cleanStringList(input.takeaways);
  const faq = cleanFaq(input.faq);
  const keywords = cleanStringList(input.keywords);
  const entities = cleanStringList(input.entities);
  const readTime =
    input.readTime?.trim() ||
    estimateArticleReadTime({
      title: input.title,
      description: input.description,
      answerCapsule: input.answerCapsule,
      takeaways,
      sections,
      faq,
    });

  return {
    slug: input.slug,
    status: input.status,
    sort_order: sortOrder,
    category: input.category.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    answer_capsule: input.answerCapsule.trim(),
    date: input.date?.trim() || formatArticleDisplayDate(datePublished),
    date_published: datePublished,
    date_modified: dateModified,
    read_time: readTime,
    image: input.image.trim(),
    image_alt: input.imageAlt.trim(),
    author: {
      name: input.author.name.trim(),
      jobTitle: input.author.jobTitle.trim(),
      url: input.author.url.trim(),
    },
    keywords,
    entities,
    takeaways,
    sections,
    faq,
  };
}

async function restJson(
  cfg: { url: string; key: string },
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; json: unknown; text: string }> {
  const response = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: restHeaders(cfg, {
      Prefer: "return=representation",
      ...(init.headers as Record<string, string> | undefined),
    }),
  });
  const text = await response.text().catch(() => "");
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = text;
    }
  }
  return { ok: response.ok, status: response.status, json, text };
}

async function listAllArticlesUncached(): Promise<ArticleCatalogResult> {
  const remote = await fetchSupabaseArticles({
    publishedOnly: false,
    timeoutMs: ADMIN_TIMEOUT_MS,
  });
  if (remote) return { items: remote, source: "supabase" };
  return seedResult();
}

export const listAdminArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    return listAllArticlesUncached();
  },
);

export const saveAdminArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ArticleWriteInput.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const cfg = supabaseConfig();
    if (!cfg) {
      throw new Error(
        "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run the articles migration.",
      );
    }

    if (cleanSections(data.sections).length < 1) {
      throw new Error("Add at least one section with a heading.");
    }

    const current = await listAllArticlesUncached();
    if (current.source !== "supabase") {
      throw new Error(
        "Articles table is not reachable. Run supabase/migrations/20260817_articles.sql in your Supabase project.",
      );
    }

    const slugTaken = current.items.some(
      (item) => item.slug === data.slug && item.id !== data.id,
    );
    if (slugTaken) {
      throw new Error(`Slug “${data.slug}” is already in use.`);
    }

    const existing = data.id
      ? current.items.find((item) => item.id === data.id)
      : undefined;
    const sortOrder =
      data.sortOrder ?? existing?.sortOrder ?? current.items.length;
    const row = itemToRow(data, sortOrder);

    if (existing) {
      const patched = await restJson(
        cfg,
        `/rest/v1/articles?id=eq.${encodeURIComponent(existing.id)}`,
        { method: "PATCH", body: JSON.stringify(row) },
      );
      if (!patched.ok) {
        throw new Error(
          `Failed to update article (${patched.status}): ${patched.text}`,
        );
      }
      invalidateArticleCatalogCache();
      const items = parseArticleRows(
        Array.isArray(patched.json) ? patched.json : [patched.json],
      );
      return {
        article:
          items[0] ?? rowToPatchShape(row, existing),
      };
    }

    const created = await restJson(cfg, "/rest/v1/articles", {
      method: "POST",
      body: JSON.stringify(row),
    });
    if (!created.ok) {
      throw new Error(
        `Failed to create article (${created.status}): ${created.text}`,
      );
    }
    invalidateArticleCatalogCache();
    const items = parseArticleRows(
      Array.isArray(created.json) ? created.json : [created.json],
    );
    if (!items[0]) {
      throw new Error("Article was saved but could not be read back.");
    }
    return { article: items[0] };
  });

function rowToPatchShape(
  row: ReturnType<typeof itemToRow>,
  existing: CatalogArticle,
): CatalogArticle {
  return {
    ...existing,
    slug: row.slug,
    status: row.status as ArticleStatus,
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
  };
}

export const setAdminArticleStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const cfg = supabaseConfig();
    if (!cfg) throw new Error("Supabase is not configured.");

    const today = new Date().toISOString().slice(0, 10);
    const body: Record<string, unknown> = { status: data.status };
    if (data.status === "published") {
      body.date_modified = today;
    }

    const result = await restJson(
      cfg,
      `/rest/v1/articles?id=eq.${encodeURIComponent(data.id)}`,
      { method: "PATCH", body: JSON.stringify(body) },
    );
    if (!result.ok) {
      throw new Error(
        `Failed to update status (${result.status}): ${result.text}`,
      );
    }
    invalidateArticleCatalogCache();
    return { ok: true as const };
  });

export const deleteAdminArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const cfg = supabaseConfig();
    if (!cfg) throw new Error("Supabase is not configured.");

    const result = await restJson(
      cfg,
      `/rest/v1/articles?id=eq.${encodeURIComponent(data.id)}`,
      { method: "DELETE" },
    );
    if (!result.ok) {
      throw new Error(
        `Failed to delete article (${result.status}): ${result.text}`,
      );
    }
    invalidateArticleCatalogCache();
    return { ok: true as const };
  });

export const duplicateAdminArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const cfg = supabaseConfig();
    if (!cfg) throw new Error("Supabase is not configured.");

    const current = await listAllArticlesUncached();
    const source = current.items.find((item) => item.id === data.id);
    if (!source) throw new Error("Article not found.");

    const existingSlugs = current.items.map((item) => item.slug);
    let slug = `${source.slug}-copy`;
    let n = 2;
    while (existingSlugs.includes(slug)) {
      slug = `${source.slug}-copy-${n}`;
      n += 1;
    }

    const row = itemToRow(
      {
        slug,
        status: "draft",
        sortOrder: current.items.length,
        category: source.category,
        title: `${source.title} (copy)`,
        description: source.description,
        answerCapsule: source.answerCapsule,
        date: source.date,
        datePublished: source.datePublished,
        dateModified: new Date().toISOString().slice(0, 10),
        readTime: source.readTime,
        image: source.image,
        imageAlt: source.imageAlt,
        author: source.author,
        keywords: source.keywords,
        entities: source.entities,
        takeaways: source.takeaways,
        sections: source.sections,
        faq: source.faq,
      },
      current.items.length,
    );

    const created = await restJson(cfg, "/rest/v1/articles", {
      method: "POST",
      body: JSON.stringify(row),
    });
    if (!created.ok) {
      throw new Error(
        `Failed to duplicate article (${created.status}): ${created.text}`,
      );
    }
    invalidateArticleCatalogCache();
    const items = parseArticleRows(
      Array.isArray(created.json) ? created.json : [created.json],
    );
    if (!items[0]) {
      throw new Error("Duplicate saved but could not be read back.");
    }
    return { article: items[0] };
  });
