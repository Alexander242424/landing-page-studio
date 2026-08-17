import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getWorkCatalogSeed,
  type WorkCatalogItem,
  type WorkCatalogResult,
} from "@/lib/workCatalog";

const WorkCatalogRow = z.object({
  slug: z.string().min(1),
  client: z.string().min(1),
  title: z.string().min(1),
  headline_line: z.string().min(1),
  headline_emphasis: z.string().min(1),
  description: z.string(),
  logo: z.string(),
  image: z.string(),
  services: z.array(z.string()).nullish().transform((value) => value ?? []),
  href: z.string().min(1),
  sort_order: z.coerce.number(),
  has_page: z.boolean(),
  year: z.string().nullish().transform((value) => value ?? ""),
  filters: z.array(z.string()).nullish(),
});

const FETCH_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 60_000;

let catalogCache: { at: number; result: WorkCatalogResult } | null = null;

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env["SUPABASE_URL"]?.replace(/\/$/, "");
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return null;
  return { url, key };
}

function rowToItem(row: z.infer<typeof WorkCatalogRow>): WorkCatalogItem {
  const services = row.services ?? [];
  return {
    slug: row.slug,
    client: row.client,
    title: row.title,
    headline: {
      line: row.headline_line,
      emphasis: row.headline_emphasis,
    },
    description: row.description,
    logo: row.logo,
    image: row.image,
    services,
    href: row.href,
    order: row.sort_order,
    hasPage: row.has_page,
    year: row.year ?? "",
    filters: row.filters?.length ? row.filters : services,
  };
}

async function fetchSupabaseCatalog(): Promise<WorkCatalogItem[] | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${cfg.url}/rest/v1/case_studies?select=slug,client,title,headline_line,headline_emphasis,description,logo,image,services,href,sort_order,has_page,year,filters&order=sort_order.asc`,
      {
        method: "GET",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `[workCatalog] Supabase read failed (${response.status}): ${body}`,
      );
      return null;
    }

    const json: unknown = await response.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    const items: WorkCatalogItem[] = [];
    for (const entry of json) {
      const parsed = WorkCatalogRow.safeParse(entry);
      if (parsed.success) items.push(rowToItem(parsed.data));
    }
    return items.length ? items : null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[workCatalog] Supabase read timed out");
    } else {
      console.warn("[workCatalog] Supabase read error", error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function seedResult(): WorkCatalogResult {
  return { items: getWorkCatalogSeed(), source: "seed" };
}

/**
 * Shared catalog for Work list + mega menu.
 * Prefers Supabase `case_studies`; falls back to the in-repo seed so
 * local/Lovable never render an empty list.
 */
export async function resolveWorkCatalog(): Promise<WorkCatalogResult> {
  if (catalogCache && Date.now() - catalogCache.at < CACHE_TTL_MS) {
    return catalogCache.result;
  }

  const remote = await fetchSupabaseCatalog();
  const result: WorkCatalogResult = remote
    ? { items: remote, source: "supabase" }
    : seedResult();

  catalogCache = { at: Date.now(), result };
  return result;
}

export const listWorkCatalog = createServerFn({ method: "GET" }).handler(
  async () => resolveWorkCatalog(),
);
