import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarketingHomePage } from "@/components/pages/MarketingHomePage";
import { ServiceLandingPage } from "@/components/pages/ServiceLandingPage";
import {
  getServicePage,
  PRODUCT_PERFORMANCE,
} from "@/lib/servicePages";
import { defaultLinks, defaultMeta, MARKETING_HOME, SITE } from "@/lib/site";

export const Route = createFileRoute("/solutions/$slug")({
  loader: ({ params }) => {
    const page = getServicePage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    if (!page) return {};

    if (page.slug === PRODUCT_PERFORMANCE.slug) {
      return {
        meta: defaultMeta({
          title: MARKETING_HOME.title,
          description: MARKETING_HOME.description,
          path: MARKETING_HOME.path,
          keywords: [...SITE.keywords],
        }),
        links: defaultLinks(MARKETING_HOME.path),
      };
    }

    return {
      meta: defaultMeta({
        title: page.title,
        description: page.description,
        path: page.path,
        keywords: [...SITE.keywords, ...page.keywords],
      }),
      links: defaultLinks(page.path),
    };
  },
  component: SolutionPage,
});

function SolutionPage() {
  const { page } = Route.useLoaderData();

  if (page.slug === PRODUCT_PERFORMANCE.slug) {
    return <MarketingHomePage canonicalPath={MARKETING_HOME.path} />;
  }

  return (
    <ServiceLandingPage page={page} canonicalPath={page.path} />
  );
}
