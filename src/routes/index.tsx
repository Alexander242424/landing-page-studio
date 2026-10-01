import { createFileRoute } from "@tanstack/react-router";
import { ServiceLandingPage } from "@/components/pages/ServiceLandingPage";
import { PRODUCT_PERFORMANCE } from "@/lib/servicePages";
import { defaultLinks, defaultMeta, SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: defaultMeta({
      title: SITE.title,
      description: PRODUCT_PERFORMANCE.description,
      path: "/",
      keywords: [...SITE.keywords, ...PRODUCT_PERFORMANCE.keywords],
    }),
    links: defaultLinks("/"),
  }),
  component: CroHomePage,
});

function CroHomePage() {
  return <ServiceLandingPage page={PRODUCT_PERFORMANCE} canonicalPath="/" />;
}
