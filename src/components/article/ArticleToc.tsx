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

    const headingOffset = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const headerRem = Number.parseFloat(
        rootStyles.getPropertyValue("--rj-header-height"),
      );
      const rootPx = Number.parseFloat(rootStyles.fontSize) || 10;
      const headerPx = (Number.isFinite(headerRem) ? headerRem : 6.2) * rootPx;
      return headerPx + 24;
    };

    const syncActive = () => {
      const marker = headingOffset();
      let next = items[0]?.id ?? "";

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) {
          next = item.id;
        }
      }

      setActiveId((prev) => (prev === next ? prev : next));
    };

    syncActive();

    if (lenis) {
      lenis.on("scroll", syncActive);
      return () => {
        lenis.off("scroll", syncActive);
      };
    }

    window.addEventListener("scroll", syncActive, { passive: true });
    return () => window.removeEventListener("scroll", syncActive);
  }, [items, lenis]);

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
