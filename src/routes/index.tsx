import { createFileRoute } from "@tanstack/react-router";
import { MarketingHomePage } from "@/components/pages/MarketingHomePage";
import { defaultLinks, defaultMeta, SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: defaultMeta({
      title: SITE.title,
      description: SITE.description,
      path: "/",
      keywords: [...SITE.keywords],
    }),
    links: defaultLinks("/"),
  }),
  component: HomePage,
});

function HomePage() {
  return <MarketingHomePage canonicalPath="/" />;
}
