import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { resolveArticleCatalog } from "@/lib/articleCatalog.functions";
import { toPublicArticle } from "@/lib/articleCatalog";
import { buildRssXml } from "@/lib/llmIndex";

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await resolveArticleCatalog();
        const articles = catalog.items.map(toPublicArticle);
        return new Response(buildRssXml(articles), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
