import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);

const ARTICLES = [
  {
    id: "activation",
    category: "Product News",
    title: "How activation loops compound retention in the first 14 days",
    date: "Jul 23, 2026",
    readTime: "7 min read",
    image: "/glance/rivian.jpg",
    href: "#",
  },
  {
    id: "experiment",
    category: "Best Practices",
    title: "A practical playbook for CRO experiments that ship weekly",
    date: "Jun 12, 2026",
    readTime: "5 min read",
    image: "/glance/oura-case.jpg",
    href: "#",
  },
  {
    id: "systems",
    category: "Engineering",
    title: "Design systems that protect conversion under product velocity",
    date: "May 28, 2026",
    readTime: "6 min read",
    image: "/glance/moxion.jpg",
    href: "#",
  },
  {
    id: "ai",
    category: "Announcements",
    title: "Where AI belongs in growth UX — and where it still fails",
    date: "Apr 9, 2026",
    readTime: "8 min read",
    image: "/glance/pergola.jpg",
    href: "#",
  },
] as const;

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
            <li key={article.id} className="rj-blog__card">
              <a href={article.href} className="rj-blog__card-link">
                <div className="rj-blog__media">
                  <img
                    src={article.image}
                    alt=""
                    draggable={false}
                    loading="lazy"
                  />
                </div>
                <span className="rj-blog__category">{article.category}</span>
                <h3 className="rj-blog__title">{article.title}</h3>
                <p className="rj-blog__meta">
                  {article.date} — {article.readTime}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
