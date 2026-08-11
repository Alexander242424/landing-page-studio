import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/articles";

type BlogCardProps = {
  article: Article;
};

/**
 * Presentational blog/resources card — shared by home and article related lists.
 */
export function BlogCard({ article }: BlogCardProps) {
  return (
    <li className="rj-blog__card">
      <Link
        to="/resources/$slug"
        params={{ slug: article.slug }}
        viewTransition
        className="rj-blog__card-link"
      >
        <div className="rj-blog__media">
          <img
            src={article.image}
            alt={article.imageAlt}
            draggable={false}
            loading="lazy"
          />
        </div>
        <span className="rj-blog__category">{article.category}</span>
        <h3 className="rj-blog__title">
          <span className="rj-blog__title-text">{article.title}</span>
        </h3>
        <p className="rj-blog__meta">
          {article.date} — {article.readTime}
        </p>
      </Link>
    </li>
  );
}
