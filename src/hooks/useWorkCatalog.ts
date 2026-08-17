import { useQuery } from "@tanstack/react-query";
import {
  WORK_CATALOG_QUERY_KEY,
  getWorkCatalogSeed,
  type WorkCatalogResult,
} from "@/lib/workCatalog";
import { listWorkCatalog } from "@/lib/workCatalog.functions";

const SEED: WorkCatalogResult = {
  items: getWorkCatalogSeed(),
  source: "seed",
};

/**
 * Work list + mega menu. Seed is shown immediately; Supabase replaces it
 * when configured. Never leaves the UI empty.
 */
export function useWorkCatalog() {
  return useQuery({
    queryKey: WORK_CATALOG_QUERY_KEY,
    queryFn: () => listWorkCatalog(),
    placeholderData: SEED,
    staleTime: 60_000,
  });
}

export function workCatalogItems(
  result: WorkCatalogResult | undefined,
): WorkCatalogResult["items"] {
  return result?.items ?? SEED.items;
}
