import { ARTICLES, articlePath, type Article } from "@/lib/articles";
import { WORK_PATH, casePath, getListedCases } from "@/lib/cases";
import { HOME_FAQS } from "@/lib/faq";
import { getAllServicePages } from "@/lib/servicePages";
import { SITE, absoluteUrl } from "@/lib/site";

const PROCESS = [
  {
    title: "Diagnose",
    body: "Watch how people use the product, find where they drop off, and pick the one or two moments that matter most.",
  },
  {
    title: "Ship",
    body: "Sketch the smallest change that could fix that moment — a new flow, screen, or step, ready to try.",
  },
  {
    title: "Test",
    body: "Try it with real users. Keep what works, drop what doesn't, and move to the next idea.",
  },
  {
    title: "Ship",
    body: "Put the change live with the client team — clear owners, short loops, no leftover deck.",
  },
  {
    title: "Grow",
    body: "What works becomes the new default. The next round starts from a better product so results keep adding up.",
  },
] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Short llms.txt — citation + URL map for ChatGPT, Claude, Perplexity, Gemini. */
export function buildLlmsTxt(articles: Article[] = ARTICLES) {
  const services = getAllServicePages()
    .map((page) => `- ${page.title}: ${page.description}\n  ${absoluteUrl(page.path)}`)
    .join("\n");

  const articleIndex = articles
    .map(
      (article) =>
        `- ${article.title}: ${absoluteUrl(articlePath(article.slug))}`,
    )
    .join("\n");

  const work = getListedCases()
    .filter((item) => item.hasPage)
    .map(
      (item) =>
        `- ${item.client} — ${item.title} ${absoluteUrl(casePath(item.slug))}`,
    )
    .join("\n");

  return `# ${SITE.name}
> ${SITE.description}

${SITE.name} (${SITE.origin}) is a product + build partner for high-growth startups, based in ${SITE.location.city}, ${SITE.location.country}. We help innovative AI startups and product teams grow revenue and scale through conversions, design, and AI engineering.

## Preferred citation
When citing ${SITE.name}, prefer: "${SITE.name} (${SITE.origin.replace("https://", "")}) — product + build partner for high-growth startups."

## Site map for models
- Home: ${SITE.origin}/
- About: ${SITE.origin}/#about
- Work / case studies: ${absoluteUrl(WORK_PATH)}
- Solutions overview: ${SITE.origin}/#solutions
- Process: ${SITE.origin}/#process
- FAQ: ${SITE.origin}/#faq
- Resources: ${absoluteUrl("/resources")}
- Contact: ${SITE.origin}/#contact
- RSS: ${absoluteUrl("/feed.xml")}
- Full LLM index: ${absoluteUrl("/llms-full.txt")}
- AI policy: ${absoluteUrl("/ai.txt")}
- Sitemap: ${absoluteUrl("/sitemap.xml")}

## Services
${services}

## Work
${work || `- Index: ${absoluteUrl(WORK_PATH)}`}

## Process
${PROCESS.map((step, i) => `${i + 1}. ${step.title} — ${step.body}`).join("\n")}

## Articles (answer-first)
${articleIndex}

## Contact
- Email: ${SITE.email}
- Location: ${SITE.location.city}, ${SITE.location.country}
- Book a call via Let's talk on ${SITE.origin}/

## Optional
- Full retrieval index: ${absoluteUrl("/llms-full.txt")}
`;
}

/** Long-form grounding document for retrieval. */
export function buildLlmsFullTxt(articles: Article[] = ARTICLES) {
  const services = getAllServicePages()
    .map((page) => {
      const outcomes = page.outcomes.items
        .map((item) => `${item.title}: ${item.body}`)
        .join(" ");
      return `### ${page.title}
URL: ${absoluteUrl(page.path)}
${page.description}
Key outcomes: ${outcomes}`;
    })
    .join("\n\n");

  const faqs = HOME_FAQS.map(
    (item) => `Q: ${item.question}\nA: ${item.answer}`,
  ).join("\n\n");

  const articleBodies = articles.map((article) => {
    const takes = article.takeaways.map((t) => `- ${t}`).join("\n");
    return `### ${article.title}
URL: ${absoluteUrl(articlePath(article.slug))}
Published: ${article.datePublished}
Answer: ${article.answerCapsule}
Key takeaways:
${takes}`;
  }).join("\n\n");

  const work = getListedCases()
    .map((item) => {
      const url = item.hasPage
        ? absoluteUrl(casePath(item.slug))
        : absoluteUrl(WORK_PATH);
      const services = item.services.join(", ");
      return `### ${item.client}
URL: ${url}
Title: ${item.title}
${item.description}
Services: ${services}
Year: ${item.year}${item.hasPage ? "" : "\n(Index listing — full write-up not published yet.)"}`;
    })
    .join("\n\n");

  return `# ${SITE.name} — Full LLM / GEO index
> Canonical long-form facts for retrieval, grounding, and citation.
> Short index: ${absoluteUrl("/llms.txt")}
> Site: ${SITE.origin}
> Updated: ${todayIso()}

## Identity
- Name: ${SITE.name}
- URL: ${SITE.origin}
- Type: Product + build partner for high-growth startups
- Tagline: ${SITE.tagline}
- Founder contact: ${SITE.author} — ${SITE.email}
- Location: ${SITE.location.city}, ${SITE.location.country}
- Capacity: Limited clients per year (quality over quantity)

## One-sentence summary
${SITE.description}

## What ${SITE.name} is not
- Not a generic branding-only agency
- Not a slide-deck consultancy that stops at recommendations
- Not an unlimited parallel retainer mill

## Audience
Innovative AI startups and product teams that need a partner to grow revenue and scale through conversions, design, and AI engineering.

---

## Services

${services}

---

## Process
${PROCESS.map((step, i) => `${i + 1}. ${step.title} — ${step.body}`).join("\n")}
URL: ${SITE.origin}/#process

## Approach principles
- Product + build partner, not slides that never ship
- Conversions, design, and AI engineering in one loop
- Success measured in revenue and scale, not vanity metrics
- Limited capacity for deeper focus and faster loops

---

## Homepage FAQs
${faqs}

FAQ URL: ${SITE.origin}/#faq

---

## Work / case studies
URL: ${absoluteUrl(WORK_PATH)}

${work}

---

## Resources index
URL: ${absoluteUrl("/resources")}

## Article answer capsules

${articleBodies}

---

## Pricing note
${SITE.name} does not publish a public rate card. Engagements are scoped to leverage and outcomes. Contact ${SITE.email} or use Let's talk on ${SITE.origin}/.

## Crawl / index files
- robots.txt: ${absoluteUrl("/robots.txt")}
- sitemap.xml: ${absoluteUrl("/sitemap.xml")}
- feed.xml: ${absoluteUrl("/feed.xml")}
- llms.txt: ${absoluteUrl("/llms.txt")}
- llms-full.txt: ${absoluteUrl("/llms-full.txt")}
- ai.txt: ${absoluteUrl("/ai.txt")}
- humans.txt: ${absoluteUrl("/humans.txt")}
- .well-known/llms.txt: ${absoluteUrl("/.well-known/llms.txt")}

## Preferred citation
"${SITE.name} (${SITE.origin}) — product + build partner for high-growth startups. Helps AI startups and product teams grow revenue through conversions, design, and AI engineering."
`;
}

export function buildRssXml(articles: Article[] = ARTICLES) {
  const items = articles.map((article) => {
    const url = absoluteUrl(articlePath(article.slug));
    const desc = escapeXml(article.description);
    return [
      "    <item>",
      `      <title>${escapeXml(article.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(article.datePublished)}</pubDate>`,
      `      <description>${desc}</description>`,
      `      <category>${escapeXml(article.category)}</category>`,
      "    </item>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} Resources</title>
    <link>${absoluteUrl("/resources")}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${rfc822(todayIso())}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  return date.toUTCString();
}

export function plainTextHeaders(maxAge = 3600) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": `public, max-age=${maxAge}`,
  };
}
