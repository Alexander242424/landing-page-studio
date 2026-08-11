import { forwardRef } from "react";
import type { Article } from "@/lib/articles";
import { BlogCard } from "@/components/blog/BlogCard";

type BlogGridProps = {
  articles: Article[];
  className?: string;
};

/**
 * Blog card grid — same markup/classes as home resources.
 */
export const BlogGrid = forwardRef<HTMLUListElement, BlogGridProps>(
  function BlogGrid({ articles, className }, ref) {
    const classes = ["rj-blog__grid", className].filter(Boolean).join(" ");

    return (
      <ul ref={ref} className={classes}>
        {articles.map((article) => (
          <BlogCard key={article.slug} article={article} />
        ))}
      </ul>
    );
  },
);
