import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServiceLandingPage } from "@/components/pages/ServiceLandingPage";
import { getServicePage } from "@/lib/servicePages";
import { defaultLinks, defaultMeta, SITE } from "@/lib/site";

export const Route = createFileRoute("/solutions/$slug")({
  loader: ({ params }) => {
    const page = getServicePage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    if (!page) return {};
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
  return <ServiceLandingPage page={page} canonicalPath={page.path} />;
}
