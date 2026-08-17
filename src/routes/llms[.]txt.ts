import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { resolveArticleCatalog } from "@/lib/articleCatalog.functions";
import { toPublicArticle } from "@/lib/articleCatalog";
import { buildLlmsTxt, plainTextHeaders } from "@/lib/llmIndex";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await resolveArticleCatalog();
        const articles = catalog.items.map(toPublicArticle);
        return new Response(buildLlmsTxt(articles), {
          headers: plainTextHeaders(),
        });
      },
    },
  },
});
