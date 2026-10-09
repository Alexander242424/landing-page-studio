import { lazy, Suspense, useEffect } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WorkflowView } from "@/components/workflows/WorkflowView";
import { SITE, defaultLinks, defaultMeta, pageTitle } from "@/lib/site";
import { getWorkflow, workflowPath } from "@/lib/workflows";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

export const Route = createFileRoute("/workflows/$slug")({
  loader: ({ params }) => {
    const workflow = getWorkflow(params.slug);
    if (!workflow) throw notFound();
    return { workflow };
  },
  head: ({ loaderData }) => {
    const workflow = loaderData?.workflow;
    if (!workflow) {
      return { meta: [{ title: pageTitle("Workflow") }] };
    }
    const path = workflowPath(workflow.slug);
    return {
      meta: defaultMeta({
        title: workflow.title,
        description: workflow.description,
        path,
        image: workflow.coverSrc,
        imageAlt: workflow.coverAlt,
        keywords: [...SITE.keywords, ...workflow.tags],
      }),
      links: defaultLinks(path),
    };
  },
  component: WorkflowPage,
});

function WorkflowPage() {
  const { workflow } = Route.useLoaderData();

  useEffect(() => {
    document.documentElement.dataset.rjRoute = "workflows";
    document.documentElement.style.setProperty("--rj-dark-progress", "1");
    document.body.classList.remove(
      "rj-scroll-hero",
      "rj-scroll-light",
      "rj-scroll-dark",
    );
    return () => {
      delete document.documentElement.dataset.rjRoute;
    };
  }, []);

  return (
    <div className="theme-dark rj-page rj-page--workflows min-h-screen">
      <SiteHeader variant="site" />
      <AiPromptInput />
      <main className="rj-page__main rj-wf-page rj-wf-page--detail">
        <WorkflowView workflow={workflow} />
      </main>
      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
