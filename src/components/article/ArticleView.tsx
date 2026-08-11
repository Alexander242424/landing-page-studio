import { Link } from "@tanstack/react-router";
import { articleHeadingId } from "@/components/article/articleHeadingId";
import { ArticleToc } from "@/components/article/ArticleToc";
import { BlogGrid } from "@/components/blog/BlogGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  articlePath,
  getRelatedArticles,
  type Article,
} from "@/lib/articles";
import { SITE, absoluteUrl } from "@/lib/site";

type ArticleViewProps = {
  article: Article;
};

/**
 * Light, SEO / GEO / LLM-optimized article body.
 * Semantic article markup + answer capsule + FAQ for generative engines.
 * Desktop: sticky TOC | reading column. Related band is full page width (Home).
 */
export function ArticleView({ article }: ArticleViewProps) {
  const related = getRelatedArticles(article.slug);

  return (
    <>
      <article
        className="rj-article"
        itemScope
        itemType="https://schema.org/Article"
      >
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

        <meta itemProp="dateModified" content={article.dateModified} />
        <meta itemProp="description" content={article.description} />
        <link itemProp="image" href={absoluteUrl(article.image)} />
      </header>

      <div className="rj-article__layout">
        <aside
          className="rj-article__rail rj-article__rail--toc"
          aria-label="Contents"
        >
          <div className="rj-article__rail-sticky">
            <ArticleToc article={article} variant="desktop" />
          </div>
        </aside>

        <div className="rj-article__main">
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

          <section className="rj-article__faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading">FAQ</h2>
            <Accordion
              type="single"
              collapsible
              className="rj-article__faq-list"
            >
              {article.faq.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`item-${index}`}
                  className="rj-article__faq-item"
                >
                  <AccordionTrigger className="rj-article__faq-trigger">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="rj-article__faq-answer">
                    <p>{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>

      <p className="rj-article__entities" hidden>
        Entities: {article.entities.join(", ")}. Keywords:{" "}
        {article.keywords.join(", ")}. Path: {articlePath(article.slug)}.
      </p>
      </article>

      {related.length > 0 ? (
        <section
          className="rj-article__related"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" className="rj-blog__headline">
            Related articles
          </h2>
          <BlogGrid articles={related} />
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
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        image: [imageUrl],
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
          name: SITE.name,
          url: SITE.origin,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl(SITE.favicon),
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
