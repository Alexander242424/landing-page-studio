import { Link } from "@tanstack/react-router";
import { ArticleCtaCard } from "@/components/article/ArticleCtaCard";
import { articleHeadingId } from "@/components/article/articleHeadingId";
import { ArticleReadTracker } from "@/components/article/ArticleReadTracker";
import { ArticleShareBar } from "@/components/article/ArticleShareBar";
import { ArticleToc } from "@/components/article/ArticleToc";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { FaqAccordion } from "@/components/home/FaqSection";
import {
  articlePath,
  getRelatedArticles,
  type Article,
} from "@/lib/articles";
import { SITE, absoluteUrl, organizationJsonLd } from "@/lib/site";

type ArticleViewProps = {
  article: Article;
  related?: Article[];
};

/**
 * Light, SEO / GEO / LLM-optimized article body.
 * Semantic article markup + answer capsule + FAQ for generative engines.
 * Desktop: sticky TOC | reading column | CTA card. Related band is full page width.
 */
export function ArticleView({ article, related }: ArticleViewProps) {
  const relatedArticles = related ?? getRelatedArticles(article.slug);

  return (
    <>
      <ArticleReadTracker slug={article.slug} />
      <article
        className="rj-article"
        itemScope
        itemType="https://schema.org/Article"
      >
      <div className="rj-article__layout">
        <header className="rj-article__header">
          <nav className="rj-article__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/resources" viewTransition>
                  Resources
                </Link>
              </li>
            </ol>
          </nav>

          <p className="rj-article__category">{article.category}</p>
          <h1 className="rj-article__title" itemProp="headline">
            {article.title}
          </h1>

          <div className="rj-article__meta">
            <span
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name">{article.author.name}</span>
              <meta itemProp="jobTitle" content={article.author.jobTitle} />
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.datePublished} itemProp="datePublished">
              {article.date}
            </time>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>

          {article.image ? (
            <figure className="rj-article__cover">
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                width={1600}
                height={1000}
                decoding="async"
                fetchPriority="high"
                itemProp="image"
              />
            </figure>
          ) : null}

          <meta itemProp="dateModified" content={article.dateModified} />
          <meta itemProp="description" content={article.description} />
        </header>

        <aside
          className="rj-article__rail rj-article__rail--toc"
          aria-label="Share and contents"
        >
          <div className="rj-article__rail-sticky">
            <ArticleShareBar
              title={article.title}
              url={absoluteUrl(articlePath(article.slug))}
            />
            <ArticleToc article={article} variant="desktop" />
          </div>
        </aside>

        <div className="rj-article__main">
          <ArticleShareBar
            title={article.title}
            url={absoluteUrl(articlePath(article.slug))}
          />
          <ArticleToc article={article} variant="mobile" />

          {/* Answer-first block for LLM / GEO citation */}
          <section
            className="rj-article__answer"
            aria-label="Direct answer"
            data-speakable="true"
          >
            <p className="rj-article__answer-text" data-geo-answer>
              {article.answerCapsule}
            </p>
          </section>

          <section
            className="rj-article__takeaways"
            aria-labelledby="takeaways-heading"
          >
            <h2 id="takeaways-heading">Key takeaways</h2>
            <ul>
              {article.takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <div className="rj-article__body" itemProp="articleBody">
            {article.sections.map((section) => {
              const sectionId = articleHeadingId(section.heading);
              return (
                <section
                  key={section.heading}
                  className="rj-article__section"
                  aria-labelledby={sectionId}
                >
                  <h2 id={sectionId}>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>

          {article.faq.length > 0 ? (
            <section className="rj-article__faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">FAQ</h2>
              <FaqAccordion faqs={article.faq} />
            </section>
          ) : null}
        </div>

        <aside
          className="rj-article__rail rj-article__rail--cta"
          aria-label="Work with UXLAB"
        >
          <div className="rj-article__rail-sticky">
            <ArticleCtaCard />
          </div>
        </aside>
      </div>

      <p className="rj-article__entities" hidden>
        Entities: {article.entities.join(", ")}. Keywords:{" "}
        {article.keywords.join(", ")}. Path: {articlePath(article.slug)}.
      </p>
      </article>

      {relatedArticles.length > 0 ? (
        <section
          className="rj-article__related"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" className="rj-blog__headline">
            Related articles
          </h2>
          <BlogGrid articles={relatedArticles} />
        </section>
      ) : null}
    </>
  );
}

export function buildArticleJsonLd(article: Article, canonicalUrl: string) {
  const imageUrl = absoluteUrl(article.image);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        inLanguage: SITE.language,
        isAccessibleForFree: true,
        image: {
          "@type": "ImageObject",
          url: imageUrl,
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        author: {
          "@type": "Person",
          name: article.author.name,
          jobTitle: article.author.jobTitle,
          url: article.author.url,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE.origin}/#organization`,
          name: SITE.name,
          url: SITE.origin,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl(SITE.faviconPng),
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        keywords: article.keywords.join(", "),
        articleSection: article.category,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".rj-article__answer-text", ".rj-article__title"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
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
            name: "Resources",
            item: absoluteUrl("/resources"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: article.faq.map((item) => ({
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
