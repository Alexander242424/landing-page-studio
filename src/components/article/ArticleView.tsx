import { Link } from "@tanstack/react-router";
import { ArrowLink } from "@/components/ui/ArrowLink";
import {
  articlePath,
  getRelatedArticles,
  type Article,
} from "@/lib/articles";
import { openLeadChat } from "@/lib/askChat";
import { SITE, absoluteUrl } from "@/lib/site";

type ArticleViewProps = {
  article: Article;
};

/**
 * Light, SEO / GEO / LLM-optimized article body.
 * Semantic article markup + answer capsule + FAQ for generative engines.
 */
export function ArticleView({ article }: ArticleViewProps) {
  const related = getRelatedArticles(article.slug);

  return (
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
              <Link to="/" hash="resources" viewTransition>
                Resources
              </Link>
            </li>
            <li aria-current="page">
              <span>{article.title}</span>
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

      <figure className="rj-article__hero">
        <img
          src={article.image}
          alt={article.imageAlt}
          width={1600}
          height={900}
          itemProp="image"
          fetchPriority="high"
        />
      </figure>

      {/* Answer-first block for LLM / GEO citation */}
      <section
        className="rj-article__answer"
        aria-label="Direct answer"
        data-speakable="true"
      >
        <h2 className="rj-article__answer-label">In short</h2>
        <p className="rj-article__answer-text" data-geo-answer>
          {article.answerCapsule}
        </p>
      </section>

      <section className="rj-article__takeaways" aria-labelledby="takeaways-heading">
        <h2 id="takeaways-heading">Key takeaways</h2>
        <ul>
          {article.takeaways.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="rj-article__body" itemProp="articleBody">
        {article.sections.map((section) => (
          <section key={section.heading} className="rj-article__section">
            <h2>{section.heading}</h2>
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
        ))}
      </div>

      <section className="rj-article__faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">FAQ</h2>
        <div className="rj-article__faq-list">
          {article.faq.map((item) => (
            <details key={item.question} className="rj-article__faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <aside className="rj-article__cta" aria-label="Talk to UXLAB">
        <h2>Want this applied to your product?</h2>
        <p>
          UXLAB helps teams ship activation, CRO, and AI-native product work
          that moves conversion—not slide decks.
        </p>
        <ArrowLink
          href="#contact"
          className="rj-link-active rj-article__cta-btn"
          onClick={(event) => {
            event.preventDefault();
            openLeadChat();
          }}
        >
          Let&apos;s talk
        </ArrowLink>
      </aside>

      {related.length > 0 ? (
        <section
          className="rj-article__related"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading">Related articles</h2>
          <ul className="rj-blog__grid rj-article__related-grid">
            {related.map((item) => (
              <li key={item.slug} className="rj-blog__card">
                <Link
                  to="/resources/$slug"
                  params={{ slug: item.slug }}
                  viewTransition
                  className="rj-blog__card-link"
                >
                  <div className="rj-blog__media">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <span className="rj-blog__category">{item.category}</span>
                  <h3 className="rj-blog__title">
                    <span className="rj-blog__title-text">{item.title}</span>
                  </h3>
                  <p className="rj-blog__meta">
                    {item.date} — {item.readTime}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="rj-article__entities" hidden>
        Entities: {article.entities.join(", ")}. Keywords:{" "}
        {article.keywords.join(", ")}. Path: {articlePath(article.slug)}.
      </p>
    </article>
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
            item: absoluteUrl("/#resources"),
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
