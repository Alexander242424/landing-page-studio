import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  casePath,
  formatCaseHeadline,
  type CaseBlock,
  type CaseMedia,
  type CaseStudy,
} from "@/lib/cases";
import { SITE, absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

function CaseImpactSection({ caseStudy }: { caseStudy: CaseStudy }) {
  const items = caseStudy.heroStats;
  if (!items?.length) return null;

  const title = caseStudy.stats?.title ?? "The Impact";

  return (
    <section
      className="rj-case__stats"
      aria-label={title}
      data-reveal="section"
    >
      <div className="rj-case__stats-inner">
        <h2 className="rj-case__stats-title">{title}</h2>
        <ul className="rj-case__stats-list">
          {items.map((stat) => (
            <li key={stat.label} className="rj-case__stat">
              <div className="rj-case__stat-row">
                <span className="rj-case__stat-value">{stat.value}</span>
                <p className="rj-case__stat-label">{stat.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

gsap.registerPlugin(ScrollTrigger);

type CaseViewProps = {
  caseStudy: CaseStudy;
};

function CaseMediaFigure({
  src,
  alt,
  layout = "wide",
  aspectRatio,
  priority = false,
  reveal = false,
}: {
  src: string;
  alt: string;
  layout?: CaseMedia["layout"];
  aspectRatio?: string;
  priority?: boolean;
  reveal?: boolean;
}) {
  return (
    <figure
      className={cn("rj-case__figure", `rj-case__figure--${layout ?? "wide"}`)}
      data-reveal={reveal ? "media" : undefined}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className="rj-case__figure-frame">
        <img
          src={src}
          alt={alt}
          width={1600}
          height={960}
          decoding={priority ? "sync" : "async"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
        />
      </div>
    </figure>
  );
}

function CaseBlockView({ block }: { block: CaseBlock }) {
  if (block.type === "lede") {
    return (
      <section
        className={cn(
          "rj-case__lede",
          block.align === "center"
            ? "rj-case__lede--center"
            : "rj-case__lede--full",
        )}
        data-reveal="section"
      >
        <p className="rj-case__lede-label">{block.label}</p>
        <p className="rj-case__lede-text">{block.text}</p>
      </section>
    );
  }

  if (block.type === "narrative") {
    return (
      <section className="rj-case__narrative" data-reveal="section">
        <h2 className="rj-case__narrative-title">{block.heading}</h2>
        <div className="rj-case__narrative-body">
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="rj-case__quote" data-reveal="section">
        <p>“{block.text}”</p>
        {block.attribution ? <footer>{block.attribution}</footer> : null}
      </blockquote>
    );
  }

  if (block.type === "split") {
    const mediaCount = block.media.length;
    return (
      <section
        className={cn(
          "rj-case__split",
          mediaCount >= 2 && "rj-case__split--dual",
          block.variant === "stack" && "rj-case__split--stack",
        )}
        data-reveal="section"
      >
        <div className="rj-case__split-media">
          {block.media.map((item) => (
            <CaseMediaFigure
              key={item.src + item.alt}
              src={item.src}
              alt={item.alt}
              layout={item.layout ?? (mediaCount >= 2 ? "portrait" : "wide")}
              aspectRatio={item.aspectRatio}
              reveal
            />
          ))}
        </div>
        <div className="rj-case__split-text">
          <p>{block.text}</p>
        </div>
      </section>
    );
  }

  const isPair =
    block.media.length > 1 &&
    block.media.every((item) => (item.layout ?? "wide") === "pair");

  return (
    <section
      className={cn(
        "rj-case__media-block",
        isPair && "rj-case__media-block--pair",
        block.media.some((m) => m.layout === "full") &&
          "rj-case__media-block--bleed",
      )}
      data-reveal="section"
    >
      {block.media.map((item) => (
        <CaseMediaFigure
          key={item.src + item.alt}
          src={item.src}
          alt={item.alt}
          layout={item.layout ?? "wide"}
          aspectRatio={item.aspectRatio}
          reveal
        />
      ))}
      {block.caption ? (
        <p className="rj-case__caption">{block.caption}</p>
      ) : null}
    </section>
  );
}

/**
 * White case-study layout — Metalab Suno block structure / rhythm,
 * UXLAB tokens + Oura content (no next-case CTA, no brief eyebrows).
 */
export function CaseView({ caseStudy }: CaseViewProps) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineText = formatCaseHeadline(caseStudy.headline);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const heroItems = root.querySelectorAll<HTMLElement>("[data-reveal='hero']");
      const heroMedia = root.querySelector<HTMLElement>("[data-reveal='hero-media']");
      const sections = root.querySelectorAll<HTMLElement>("[data-reveal='section']");
      const mediaBlocks = root.querySelectorAll<HTMLElement>("[data-reveal='media']");

      if (reduced) {
        gsap.set([heroItems, heroMedia, sections, mediaBlocks], {
          clearProps: "all",
          autoAlpha: 1,
        });
        if (heroMedia) gsap.set(heroMedia, { clipPath: "none" });
        const reducedHeroImg = heroMedia?.querySelector("img");
        if (reducedHeroImg) gsap.set(reducedHeroImg, { clearProps: "transform" });
        mediaBlocks.forEach((figure) => {
          gsap.set(figure, { clipPath: "none" });
          const img = figure.querySelector("img");
          if (img) gsap.set(img, { clearProps: "transform" });
        });
        return;
      }

      gsap.set(heroItems, { autoAlpha: 0, y: 28 });
      const heroImg = heroMedia?.querySelector("img");
      if (heroMedia) {
        gsap.set(heroMedia, {
          autoAlpha: 1,
          clipPath: "inset(0% 0% 100% 0%)",
        });
        if (heroImg) gsap.set(heroImg, { scale: 1.18, yPercent: -6 });
      }
      gsap.set(sections, { autoAlpha: 0, y: 40 });
      mediaBlocks.forEach((figure) => {
        gsap.set(figure, {
          autoAlpha: 1,
          // Top → bottom wipe (bottom inset shrinks); was inset(100% 0 0 0) = bottom → top
          clipPath: "inset(0% 0% 100% 0%)",
        });
        const img = figure.querySelector("img");
        if (img) gsap.set(img, { scale: 1.08 });
      });

      gsap.to(heroItems, {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.06,
      });

      if (heroMedia) {
        gsap.to(heroMedia, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power3.inOut",
          delay: 0.22,
        });

        if (heroImg) {
          const mm = gsap.matchMedia();
          mm.add("(min-width: 768px)", () => {
            gsap.to(heroImg, {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: heroMedia,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          });
          mm.add("(max-width: 767px)", () => {
            gsap.to(heroImg, {
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: heroMedia,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          });
        }
      }

      sections.forEach((section) => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });
      });

      mediaBlocks.forEach((figure) => {
        const img = figure.querySelector("img");
        gsap.to(figure, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.15,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: figure,
            start: "top 90%",
            once: true,
          },
        });
        if (img) {
          gsap.to(img, {
            scale: 1,
            duration: 1.45,
            ease: "power3.out",
            scrollTrigger: {
              trigger: figure,
              start: "top 90%",
              once: true,
            },
          });
        }
      });
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [caseStudy.slug]);

  return (
    <article
      ref={rootRef}
      className="rj-case"
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <header className="rj-case__hero">
        <div className="rj-case__hero-copy">
          <div className="rj-case__logo" data-reveal="hero">
            <img
              src={caseStudy.logo}
              alt={caseStudy.client}
              width={180}
              height={48}
              decoding="sync"
              fetchPriority="high"
              draggable={false}
            />
          </div>

          <h1 className="rj-case__title" itemProp="name" data-reveal="hero">
            {headlineText}
          </h1>

          <dl className="rj-case__hero-stats" data-reveal="hero">
            {caseStudy.heroStats.map((stat) => (
              <div key={stat.label} className="rj-case__hero-stat">
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rj-case__hero-media" data-reveal="hero-media">
          <CaseMediaFigure
            src={caseStudy.hero.src}
            alt={caseStudy.hero.alt}
            layout="full"
            priority
          />
        </div>
      </header>

      <div className="rj-case__body">
        {caseStudy.blocks.map((block, index) => (
          <CaseBlockView key={`${block.type}-${index}`} block={block} />
        ))}
      </div>

      <CaseImpactSection caseStudy={caseStudy} />

      <meta itemProp="description" content={caseStudy.description} />
    </article>
  );
}

export function buildCaseJsonLd(caseStudy: CaseStudy, canonicalUrl: string) {
  const imageUrl = absoluteUrl(caseStudy.ogImage);
  const headline = formatCaseHeadline(caseStudy.headline);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CreativeWork", "Article"],
        "@id": `${canonicalUrl}#case`,
        name: `${caseStudy.client} case study`,
        headline,
        description: caseStudy.description,
        inLanguage: SITE.language,
        isAccessibleForFree: true,
        image: {
          "@type": "ImageObject",
          url: imageUrl,
        },
        datePublished: caseStudy.datePublished,
        dateModified: caseStudy.dateModified,
        creator: {
          "@type": "Organization",
          "@id": `${SITE.origin}/#organization`,
          name: SITE.name,
          url: SITE.origin,
        },
        publisher: { "@id": `${SITE.origin}/#organization` },
        about: {
          "@type": "Organization",
          name: caseStudy.client,
        },
        keywords: caseStudy.keywords.join(", "),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: absoluteUrl("/work"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: caseStudy.client,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

export { casePath };
