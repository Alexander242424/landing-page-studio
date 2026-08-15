import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ARTICLES, articlePath } from "@/lib/articles";
import { WORK_PATH, casePath, getListedCases } from "@/lib/cases";
import { SITE } from "@/lib/site";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const latestArticleMod = ARTICLES.reduce((latest, article) => {
          return article.dateModified > latest ? article.dateModified : latest;
        }, "2026-08-11");

        const entries: SitemapEntry[] = [
          {
            path: "/",
            lastmod: latestArticleMod,
            changefreq: "weekly",
            priority: "1.0",
          },
          {
            path: "/resources",
            lastmod: latestArticleMod,
            changefreq: "weekly",
            priority: "0.9",
          },
          {
            path: WORK_PATH,
            lastmod: latestArticleMod,
            changefreq: "weekly",
            priority: "0.9",
          },
          ...ARTICLES.map((article) => ({
            path: articlePath(article.slug),
            lastmod: article.dateModified,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...getListedCases()
            .filter((caseStudy) => caseStudy.hasPage)
            .map((caseStudy) => ({
              path: casePath(caseStudy.slug),
              lastmod: caseStudy.dateModified,
              changefreq: "monthly" as const,
              priority: "0.85",
            })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE.origin}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
