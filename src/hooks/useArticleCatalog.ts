import { useQuery } from "@tanstack/react-query";
import {
  ARTICLE_CATALOG_QUERY_KEY,
  getArticleCatalogSeed,
  publishedArticles,
  type ArticleCatalogResult,
  type CatalogArticle,
} from "@/lib/articleCatalog";
import { listPublishedArticles } from "@/lib/articleCatalog.functions";

const SEED: ArticleCatalogResult = {
  items: getArticleCatalogSeed(),
  source: "seed",
};

/**
 * Published articles for lists, mega menu, and home.
 * Seed is shown immediately; Supabase replaces it when configured.
 */
export function useArticleCatalog() {
  return useQuery({
    queryKey: ARTICLE_CATALOG_QUERY_KEY,
    queryFn: () => listPublishedArticles(),
    placeholderData: SEED,
    staleTime: 60_000,
  });
}

export function articleCatalogItems(
  result: ArticleCatalogResult | undefined,
): CatalogArticle[] {
  return publishedArticles(result?.items ?? SEED.items);
}
