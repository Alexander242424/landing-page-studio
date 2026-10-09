import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { AiPromptInput } from "@/components/home/AiPromptInput";
import { HomeIntro } from "@/components/home/HomeIntro";
import { ScrollThemeBand } from "@/components/home/ScrollThemeBand";
import { HeroReel } from "@/components/hero/HeroReel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { playHomeEntrance } from "@/lib/homeEntrance";
import { usePageReveal } from "@/lib/pageReveal";
import type { ServicePageContent } from "@/lib/servicePages";
import { absoluteUrl, organizationJsonLd, SITE } from "@/lib/site";

const ServiceOutcomesSection = lazy(() =>
  import("@/components/home/ServiceOutcomesSection").then((m) => ({
    default: m.ServiceOutcomesSection,
  })),
);
const OurProcessSection = lazy(() =>
  import("@/components/home/OurProcessSection").then((m) => ({
    default: m.OurProcessSection,
  })),
);
const FaqSection = lazy(() =>
  import("@/components/home/FaqSection").then((m) => ({
    default: m.FaqSection,
  })),
);
const SolutionsStackSection = lazy(() =>
  import("@/components/home/SolutionsStackSection").then((m) => ({
    default: m.SolutionsStackSection,
  })),
);
const BlogSection = lazy(() =>
  import("@/components/home/BlogSection").then((m) => ({
    default: m.BlogSection,
  })),
);
const SiteFooter = lazy(() =>
  import("@/components/layout/SiteFooter").then((m) => ({
    default: m.SiteFooter,
  })),
);

function Deferred({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

function buildJsonLd(page: ServicePageContent, canonicalPath: string) {
  const url = absoluteUrl(canonicalPath);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.origin}/#website` },
        about: { "@id": `${url}#service` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".rj-intro__tagline"],
        },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.title,
        description: page.description,
        url,
        provider: { "@id": `${SITE.origin}/#organization` },
        areaServed: "Worldwide",
        serviceType: page.serviceType,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE.origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Solutions",
            item: `${SITE.origin}/#solutions`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.title,
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

type ServiceLandingPageProps = {
  page: ServicePageContent;
  canonicalPath: string;
};

export function ServiceLandingPage({
  page,
  canonicalPath,
}: ServiceLandingPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isRevealed } = usePageReveal();

  useLayoutEffect(() => {
    if (!isRevealed) return;
    const root = rootRef.current;
    if (!root) return;
    return playHomeEntrance(root);
  }, [isRevealed, page.slug]);

  const jsonLd = buildJsonLd(page, canonicalPath);

  return (
    <div
      ref={rootRef}
      className="theme-light rj-page rj-page--enter min-h-screen"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollThemeBand darkTriggerId="process" />
      <SiteHeader variant="site" />
      <AiPromptInput />

      <main className="rj-page__main">
        <HeroReel content={page.hero} />
        <HomeIntro
          content={{
            id: page.valueProp.id,
            ariaLabel: "Value proposition",
            taglineBefore: page.valueProp.taglineBefore,
            taglineLinkLabel: page.valueProp.taglineLinkLabel,
            taglineLinkHref: page.valueProp.taglineLinkHref,
            taglineAfter: page.valueProp.taglineAfter,
          }}
        />
        <Deferred>
          <ServiceOutcomesSection
            id={page.outcomes.id}
            leadBefore={page.outcomes.leadBefore}
            leadLinkLabel={page.outcomes.leadLinkLabel}
            leadLinkHref={page.outcomes.leadLinkHref}
            leadAfter={page.outcomes.leadAfter}
            items={page.outcomes.items}
          />
        </Deferred>
        <Deferred>
          <OurProcessSection
            headline={
              <>
                How we invent
                <br />
                your growth
              </>
            }
            items={page.process.items}
          />
        </Deferred>
        <Deferred>
          <FaqSection faqs={page.faqs} />
        </Deferred>
        <Deferred>
          <SolutionsStackSection
            excludeSlug={page.slug}
            ariaLabel="Other solutions"
            headline={
              <>
                Other ways we
                <br />
                invent growth
              </>
            }
          />
        </Deferred>
        <Deferred>
          <BlogSection spaciousTop />
        </Deferred>
      </main>

      <Deferred>
        <SiteFooter />
      </Deferred>
    </div>
  );
}
