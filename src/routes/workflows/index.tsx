import gsap from "gsap";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { GetInTouchSection } from "@/components/home/GetInTouchSection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { createAwardsCharReveal, createTextReveal } from "@/lib/textReveal";
import {
  SITE,
  absoluteUrl,
  defaultLinks,
  defaultMeta,
  organizationJsonLd,
} from "@/lib/site";
import { WORKFLOWS, WORKFLOWS_PATH, workflowPath } from "@/lib/workflows";

const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

const DESCRIPTION =
  "Conversion playbooks from UXLAB — signals, experiments, checkout, activation, and research ops you can ship.";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: defaultMeta({
      title: "Workflows",
      description: DESCRIPTION,
      path: WORKFLOWS_PATH,
      keywords: [
        ...SITE.keywords,
        "CRO playbooks",
        "conversion workflows",
        "experimentation",
      ],
    }),
    links: defaultLinks(WORKFLOWS_PATH),
  }),
  component: WorkflowsIndexPage,
});

function buildJsonLd() {
  const url = absoluteUrl(WORKFLOWS_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: "Workflows",
        description: DESCRIPTION,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.origin}/#website` },
        publisher: { "@id": `${SITE.origin}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: WORKFLOWS.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(workflowPath(item.slug)),
            name: item.title,
          })),
        },
      },
    ],
  };
}

function WorkflowsIndexPage() {
  const jsonLd = useMemo(() => buildJsonLd(), []);
  const pageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const gridInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    const title = titleRef.current;
    const lede = ledeRef.current;
    if (!root || !title || !lede) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      cleanups.push(
        createAwardsCharReveal(title, {
          playOnLoad: true,
          delay: 0.15,
        }),
      );
      cleanups.push(
        createTextReveal(lede, {
          playOnLoad: true,
          delay: 0.55,
          duration: 1.1,
        }),
      );
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const grid = gridRef.current;
    const gridInner = gridInnerRef.current;
    if (!root || !grid || !gridInner) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = () => {
      root.classList.add("rj-wf-page--grid-revealed");
    };

    const frameTop = gridInner.querySelector<HTMLElement>(
      ".rj-wf-grid__frame-line--top",
    );
    const frameRight = gridInner.querySelector<HTMLElement>(
      ".rj-wf-grid__frame-line--right",
    );
    const frameBottom = gridInner.querySelector<HTMLElement>(
      ".rj-wf-grid__frame-line--bottom",
    );
    const frameLeft = gridInner.querySelector<HTMLElement>(
      ".rj-wf-grid__frame-line--left",
    );
    const cards = grid.querySelectorAll<HTMLElement>(".rj-wf-card");

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(cards, { clearProps: "opacity,visibility,transform" });
        reveal();
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 40 });
      gsap.set(cards, {
        "--rj-wf-line-scale-x": 0,
        "--rj-wf-line-scale-y": 0,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.72,
        onComplete: reveal,
      });

      if (frameTop && frameRight && frameBottom && frameLeft) {
        tl.to(frameTop, { scaleX: 1, duration: 0.85, ease: "expo.out" }, 0);
        tl.to(
          frameLeft,
          { scaleY: 1, duration: 0.85, ease: "expo.out" },
          0.06,
        );
        tl.to(
          frameRight,
          { scaleY: 1, duration: 0.85, ease: "expo.out" },
          0.1,
        );
        tl.to(
          frameBottom,
          { scaleX: 1, duration: 0.85, ease: "expo.out" },
          0.14,
        );
      }

      tl.to(
        cards,
        {
          "--rj-wf-line-scale-x": 1,
          duration: 0.75,
          stagger: { each: 0.045, from: "start" },
          ease: "expo.out",
        },
        0.12,
      );
      tl.to(
        cards,
        {
          "--rj-wf-line-scale-y": 1,
          duration: 0.75,
          stagger: { each: 0.045, from: "start" },
          ease: "expo.out",
        },
        0.18,
      );
      tl.to(
        cards,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.08,
        },
        0.28,
      );
    }, root);

    return () => {
      root.classList.remove("rj-wf-page--grid-revealed");
      ctx.revert();
    };
  }, []);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main ref={pageRef} className="rj-page__main rj-wf-page">
        <header className="rj-wf-page__header">
          <nav className="rj-article__crumbs rj-work__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Home
                </Link>
              </li>
              <li aria-current="page">
                <span>Workflows</span>
              </li>
            </ol>
          </nav>
          <div className="rj-wf-page__copy">
            <h1 ref={titleRef} className="rj-wf-page__title">
              <span className="rj-wf-page__title-line">Best playbooks for</span>
              <span className="rj-wf-page__title-line">
                conversion-led growth.
              </span>
            </h1>
            <p ref={ledeRef} className="rj-wf-page__lede">
              Signals, tests, checkout, activation, and research — the loops we
              run with product teams, not decks.
            </p>
          </div>
        </header>

        <div className="rj-wf-grid-wrap">
          <div ref={gridInnerRef} className="rj-wf-grid-inner">
            <div className="rj-wf-grid__frame" aria-hidden="true">
              <span className="rj-wf-grid__frame-line rj-wf-grid__frame-line--top" />
              <span className="rj-wf-grid__frame-line rj-wf-grid__frame-line--right" />
              <span className="rj-wf-grid__frame-line rj-wf-grid__frame-line--bottom" />
              <span className="rj-wf-grid__frame-line rj-wf-grid__frame-line--left" />
            </div>
            <ul ref={gridRef} className="rj-wf-grid" aria-label="Workflows">
              {WORKFLOWS.map((workflow) => (
                <WorkflowCard key={workflow.slug} workflow={workflow} />
              ))}
            </ul>
          </div>
        </div>

        <GetInTouchSection />
      </main>

      <Suspense fallback={null}>
        <SiteFooter variant="dark" />
      </Suspense>
    </div>
  );
}
