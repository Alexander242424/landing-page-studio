import {
  CASES,
  WORK_PATH,
  caseHoverImage,
  casePath,
  formatCaseHeadline,
  type CaseHeadline,
  type CaseStudy,
} from "@/lib/cases";

/**
 * Listing / mega-menu row for a case study.
 * Full case bodies stay in `cases.ts`; this is the shared catalog shape.
 */
export type WorkCatalogItem = {
  slug: string;
  client: string;
  /** Short mega title, e.g. "Category-defining wearables brand & product experience." */
  title: string;
  headline: CaseHeadline;
  description: string;
  logo: string;
  image: string;
  services: string[];
  href: string;
  order: number;
  hasPage: boolean;
  year: string;
  filters: string[];
};

export type WorkCatalogSource = "supabase" | "seed";

export type WorkCatalogResult = {
  items: WorkCatalogItem[];
  source: WorkCatalogSource;
};

export const WORK_CATALOG_QUERY_KEY = ["work-catalog"] as const;

export function workCatalogFromCases(
  cases: CaseStudy[] = CASES,
): WorkCatalogItem[] {
  return cases.map((item, index) => ({
    slug: item.slug,
    client: item.client,
    title: formatCaseHeadline(item.headline),
    headline: item.headline,
    description: item.description,
    logo: item.logo,
    image: caseHoverImage(item),
    services: item.services,
    href: item.hasPage ? casePath(item.slug) : WORK_PATH,
    order: index,
    hasPage: item.hasPage,
    year: item.year,
    filters: item.services,
  }));
}

export function getWorkCatalogSeed(): WorkCatalogItem[] {
  return workCatalogFromCases();
}

export function megaWorkItems(
  items: WorkCatalogItem[],
  limit = 6,
): WorkCatalogItem[] {
  return items.filter((item) => item.hasPage).slice(0, limit);
}

/** Overlay catalog fields onto a full case body (detail pages). */
export function applyWorkCatalogOverlay(
  caseStudy: CaseStudy,
  item: WorkCatalogItem,
): CaseStudy {
  return {
    ...caseStudy,
    client: item.client,
    logo: item.logo,
    title: item.title,
    headline: item.headline,
    description: item.description,
    services: item.services,
    hasPage: item.hasPage,
    hoverImage: item.image,
    year: item.year,
  };
}
