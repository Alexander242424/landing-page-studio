import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ARTICLES } from "@/lib/articles";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Latest articles — light band after FAQ.
 */
export function BlogSection() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <section
      ref={rootRef}
      id="resources"
      className="rj-blog theme-light"
      aria-label="Latest articles"
    >
      <div className="rj-blog__inner">
        <h2 ref={headlineRef} className="rj-blog__headline">
          Latest articles
        </h2>

        <ul ref={gridRef} className="rj-blog__grid">
          {ARTICLES.map((article) => (
            <li key={article.slug} className="rj-blog__card">
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
          ))}
        </ul>
      </div>
    </section>
  );
}
