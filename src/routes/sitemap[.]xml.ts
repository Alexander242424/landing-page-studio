import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { articlePath } from "@/lib/articles";
import { resolveArticleCatalog } from "@/lib/articleCatalog.functions";
import { WORK_PATH, getListedCases } from "@/lib/cases";
import { resolveWorkCatalog } from "@/lib/workCatalog.functions";
import { getAllServicePages } from "@/lib/servicePages";
import { SITE, absoluteUrl } from "@/lib/site";

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
  image?: { loc: string; title?: string };
}

function imageTag(image: SitemapEntry["image"]) {
  if (!image) return [];
  return [
    `    <image:image>`,
    `      <image:loc>${image.loc.startsWith("http") ? image.loc : absoluteUrl(image.loc)}</image:loc>`,
    image.title
      ? `      <image:title>${escapeXml(image.title)}</image:title>`
      : null,
    `    </image:image>`,
  ].filter(Boolean);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const articleCatalog = await resolveArticleCatalog();
        const articles = articleCatalog.items;
        const latestArticleMod = articles.reduce((latest, article) => {
          return article.dateModified > latest ? article.dateModified : latest;
        }, "2026-08-11");

        const catalog = await resolveWorkCatalog();
        const listedCases = getListedCases();
        const casesBySlug = new Map(listedCases.map((item) => [item.slug, item]));
        const latestCaseMod = listedCases.reduce((latest, item) => {
          return item.dateModified > latest ? item.dateModified : latest;
        }, "2026-08-11");
        const latestMod =
          latestArticleMod > latestCaseMod ? latestArticleMod : latestCaseMod;

        const entries: SitemapEntry[] = [
          {
            path: "/",
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "1.0",
          },
          {
            path: "/resources",
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "0.9",
          },
          {
            path: WORK_PATH,
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "0.9",
          },
          {
            path: "/feed.xml",
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "0.4",
          },
          {
            path: "/llms.txt",
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "0.5",
          },
          {
            path: "/llms-full.txt",
            lastmod: latestMod,
            changefreq: "weekly",
            priority: "0.5",
          },
          ...getAllServicePages().map((page) => ({
            path: page.path,
            lastmod: latestMod,
            changefreq: "monthly" as const,
            priority: "0.85",
          })),
          ...articles.map((article) => ({
            path: articlePath(article.slug),
            lastmod: article.dateModified,
            changefreq: "monthly" as const,
            priority: "0.8",
            image: { loc: article.image, title: article.title },
          })),
          ...catalog.items
            .filter((item) => item.hasPage)
            .map((item) => {
              const full = casesBySlug.get(item.slug);
              return {
                path: item.href,
                lastmod: full?.dateModified,
                changefreq: "monthly" as const,
                priority: "0.85",
                image: full
                  ? { loc: full.ogImage, title: full.title }
                  : undefined,
              };
            }),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE.origin}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...imageTag(e.image),
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
