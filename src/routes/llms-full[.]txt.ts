import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { resolveArticleCatalog } from "@/lib/articleCatalog.functions";
import { toPublicArticle } from "@/lib/articleCatalog";
import { buildLlmsFullTxt, plainTextHeaders } from "@/lib/llmIndex";

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await resolveArticleCatalog();
        const articles = catalog.items.map(toPublicArticle);
        return new Response(buildLlmsFullTxt(articles), {
          headers: plainTextHeaders(),
        });
      },
    },
  },
});
