import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { articleHeadingId } from "@/components/article/articleHeadingId";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import type { Article } from "@/lib/articles";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  label: string;
};

type ArticleTocProps = {
  article: Article;
  /** Compact <details> for small screens; nav list for desktop rail. */
  variant: "mobile" | "desktop";
  className?: string;
};

export function buildArticleTocItems(article: Article): TocItem[] {
  const items: TocItem[] = [
    { id: "takeaways-heading", label: "Key takeaways" },
    ...article.sections.map((section) => ({
      id: articleHeadingId(section.heading),
      label: section.heading,
    })),
  ];

  if (article.faq.length > 0) {
    items.push({ id: "faq-heading", label: "FAQ" });
  }

  return items;
}

export function ArticleToc({ article, variant, className }: ArticleTocProps) {
  const items = useMemo(() => buildArticleTocItems(article), [article]);
  const { lenis } = useSmoothScroll();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      const scrollMargin =
        Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      lenis.scrollTo(target, { offset: -scrollMargin, duration: 1.1 });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToId(id);
    setActiveId(id);
    if (variant === "mobile") {
      const details = event.currentTarget.closest("details");
      if (details) details.open = false;
    }
  };

  const list = (
    <nav className="rj-article-toc" aria-label="Table of contents">
      <p className="rj-article-toc__label">On this page</p>
      <ol className="rj-article-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "rj-article-toc__link",
                activeId === item.id && "is-active",
              )}
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={(event) => onNavClick(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  if (variant === "mobile") {
    return (
      <details className={cn("rj-article-toc-mobile", className)}>
        <summary className="rj-article-toc-mobile__summary">
          On this page
        </summary>
        {list}
      </details>
    );
  }

  return <div className={className}>{list}</div>;
}
