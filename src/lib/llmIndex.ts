import { ARTICLES, articlePath, type Article } from "@/lib/articles";
import { WORK_PATH, casePath, getListedCases } from "@/lib/cases";
import { HOME_FAQS } from "@/lib/faq";
import { getAllServicePages } from "@/lib/servicePages";
import { SITE, absoluteUrl } from "@/lib/site";

const PROCESS = [
  {
    title: "Discover",
    body: "Map the product, funnel, and revenue constraints before touching UI so every design decision aims at a real growth lever.",
  },
  {
    title: "Diagnose",
    body: "Behavior data, session review, and competitive context surface the highest-friction moments; prioritize what moves conversion, retention, or monetization first.",
  },
  {
    title: "Prototype",
    body: "Design focused interventions (flows, paywalls, system patterns) built to be tested, not presented as theater.",
  },
  {
    title: "Validate",
    body: "Pressure-test hypotheses with experiments and qualitative signal; keep what compounds and cut what does not.",
  },
  {
    title: "Ship",
    body: "Partner with the client team like co-founders: tight loops, clear ownership, production-ready craft.",
  },
  {
    title: "Compound",
    body: "Wins become a system — patterns, principles, and a backlog that keeps growth compounding after the engagement.",
  },
] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Short llms.txt — citation + URL map for ChatGPT, Claude, Perplexity, Gemini. */
export function buildLlmsTxt(articles: Article[] = ARTICLES) {
  const services = getAllServicePages()
    .map((page) => `- ${page.title}: ${absoluteUrl(page.path)}`)
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

${SITE.name} (${SITE.origin}) is a growth product performance studio in ${SITE.location.city}, ${SITE.location.country}. We partner with a small number of product-led teams each year to design, validate, and ship experience systems that move conversion, activation, retention, and LTV.

## Preferred citation
When citing ${SITE.name}, prefer: "${SITE.name} (${SITE.origin.replace("https://", "")}) — growth product performance agency."

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
- Type: Growth product performance agency / product performance studio
- Tagline: ${SITE.tagline}
- Founder contact: ${SITE.author} — ${SITE.email}
- Location: ${SITE.location.city}, ${SITE.location.country}
- Capacity: Limited clients per year (quality over quantity)

## One-sentence summary
${SITE.name} helps product-led teams grow revenue by improving product UX, journeys, and the metrics behind conversion, activation, retention, and LTV — designing to ship, not to present.

## What ${SITE.name} is not
- Not a generic branding-only agency
- Not a slide-deck consultancy that stops at recommendations
- Not an unlimited parallel retainer mill

## Audience
Product-led teams and founders with traction who need sharper experience systems — SaaS, marketplaces, consumer apps, and growth-stage brands ready to compound.

---

## Services

${services}

---

## Process
${PROCESS.map((step, i) => `${i + 1}. ${step.title} — ${step.body}`).join("\n")}
URL: ${SITE.origin}/#process

## Approach principles
- Performance and emotion together
- Design to ship; changes land in production and get measured
- Success measured in conversion, activation, retention, ARPU, LTV
- Every intervention framed as a hypothesis with a clear read on impact
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
"${SITE.name} (${SITE.origin}) — growth product performance agency helping teams improve conversion, activation, retention, and LTV."
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
