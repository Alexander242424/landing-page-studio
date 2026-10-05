import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BlogGrid } from "@/components/blog/BlogGrid";
import {
  articleCatalogItems,
  useArticleCatalog,
} from "@/hooks/useArticleCatalog";
import { ARTICLES, type Article } from "@/lib/articles";
import { createTextReveal } from "@/lib/textReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/** Temporarily hide homepage articles grid — set true to restore. */
const SHOW_BLOG_INNER = false;

type BlogSectionProps = {
  articles?: Article[];
  /** Skip scroll reveal / card entrance (e.g. embed in article page). */
  skipAnimation?: boolean;
  /** Extra top padding — service landings sit after the dark solutions stack. */
  spaciousTop?: boolean;
};

/**
 * Latest articles — light band after FAQ.
 */
export function BlogSection({
  articles,
  skipAnimation = false,
  spaciousTop = false,
}: BlogSectionProps = {}) {
  const catalog = useArticleCatalog();
  const fromCatalog = articleCatalogItems(catalog.data);
  const resolvedArticles =
    articles ?? (fromCatalog.length ? fromCatalog : ARTICLES);
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (skipAnimation) return;

    const root = rootRef.current;
    const headline = headlineRef.current;
    const grid = gridRef.current;
    if (!root || !headline || !grid) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      cleanups.push(
        createTextReveal(headline, {
          start: "top 85%",
        }),
      );

      const cards = grid.querySelectorAll(".rj-blog__card");
      gsap.fromTo(
        cards,
        { opacity: 0, yPercent: 40, rotateX: 45, rotateY: 12 },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: grid,
            start: "top 90%",
            once: true,
          },
        },
      );
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [skipAnimation]);

  return (
    <section
      ref={rootRef}
      id="resources"
      className={cn(
        "rj-blog theme-light",
        spaciousTop && "rj-blog--spacious-top",
      )}
      aria-label="Latest articles"
    >
      {SHOW_BLOG_INNER ? (
        <div className="rj-blog__inner">
          <h2 ref={headlineRef} className="rj-blog__headline">
            Latest articles
          </h2>

          <BlogGrid ref={gridRef} articles={resolvedArticles} />
        </div>
      ) : null}
    </section>
  );
}
