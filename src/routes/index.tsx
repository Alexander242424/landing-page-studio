import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UXLAB — Leading UX & Revenue Optimization Agency" },
      {
        name: "description",
        content:
          "UXLAB® partners with product teams to define and ship revenue-critical product experiences from architecture to execution.",
      },
    ],
  }),
  component: LandingPage,
});

/* ─── image constants ────────────────────────────────── */

const CASE_IMAGES = {
  bankrollu:   "https://framerusercontent.com/images/vRITaiEiDsdL2yC1in82xp0kydo.png",
  nespresso:   "https://framerusercontent.com/images/rPU0Qjv0ttziUBWU5IgsdRdQ.jpg",
  tapmy:       "https://framerusercontent.com/images/Ip1iXKcEXgJC1IL75ZdqitIxbWc.jpg",
  firestarter: "https://framerusercontent.com/images/zUXoFmhGfLcY1OSlORzKG7ZnXKE.jpg",
  boostra:     "https://framerusercontent.com/images/WCs2WPTb9F0fANrHFADlOIzZs.jpg",
  tradevision: "https://framerusercontent.com/images/0kzcVOwqKIbN6JsYjUP1JAr1NE.jpg",
  framework:   "https://framerusercontent.com/images/Tmhg35kU1fX4LEqzTWD6IbyaKEI.jpg",
};

/* ─── page root ──────────────────────────────────────── */

function LandingPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main>
        <HeroSection />
        <CaseStudyShowcase />
        <FeaturedEngagements />
        <AboutStats />
        <GrowthFramework />
        <SelectedResults />
        <ChallengesSection />
        <ProcessSection />
        <WorkingModels />
        <GlanceSection />
      </main>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════
   1. NAVBAR
   ═══════════════════════════════════ */

function Navbar() {
  return (
    <nav className="site-nav">
      <a href="/" className="nav-logo">UXLAB®</a>

      <div className="nav-links">
        <a href="#solutions" className="nav-link nav-link--desktop-only">
          Solutions <ArrowIcon />
        </a>
        <a href="#cases" className="nav-link nav-link--desktop-only">
          Case Studies <ArrowIcon />
        </a>
        <a href="mailto:hello@uxlab.digital" className="nav-link">
          Let's talk <ArrowIcon />
        </a>
      </div>
    </nav>
  );
}

function ArrowIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="arrow-icon">
      <path
        d="M1.5 8.5L8.5 1.5M8.5 1.5H2.5M8.5 1.5V7.5"
        stroke={dark ? "#000" : "#fff"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════
   2. HERO
   ═══════════════════════════════════ */

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-subtitle-wrap">
        <p className="hero-subtitle">
          UXLAB® partners with product teams
          <br />
          to define and ship revenue-critical product experiences from
          <br />
          architecture to execution.
        </p>
      </div>

      <h1 className="hero-headline">We Design Revenue</h1>
    </section>
  );
}

/* ═══════════════════════════════════
   3. CASE STUDY SHOWCASE
   ═══════════════════════════════════ */

function CaseStudyShowcase() {
  const images = [
    CASE_IMAGES.bankrollu,
    CASE_IMAGES.nespresso,
    CASE_IMAGES.tapmy,
    CASE_IMAGES.firestarter,
    CASE_IMAGES.boostra,
    CASE_IMAGES.tradevision,
    CASE_IMAGES.framework,
  ];

  return (
    <section className="showcase-section">
      <div className="case-study-showcase">
        <div className="case-study-showcase-inner">
          {[...images, ...images].map((src, i) => (
            <div key={i} className="showcase-item">
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   4. FEATURED ENGAGEMENTS
   ═══════════════════════════════════ */

function FeaturedEngagements() {
  return (
    <section className="engagements-section">
      <p className="engagements-label">Featured engagements</p>

      <div className="engagements-row">
        <span className="logo-item logo-calendly">Calendly</span>
        <span className="logo-item logo-stan">Stan</span>
        <span className="logo-item logo-forbes">Forbes</span>
        <span className="logo-item logo-nespresso">NESPRESSO</span>
        <span className="logo-item logo-softr">softr</span>
      </div>

      <div className="engagements-row">
        <span className="logo-item logo-zara">ZARA</span>
        <span className="logo-item logo-polymarket">Polymarket</span>
        <span className="logo-item logo-easy">easy®</span>
        <span className="logo-item logo-ftg">Forbes Travel Guide</span>
        <span className="logo-item logo-pipedrive">Pipedrive</span>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   5. ABOUT + STATS
   ═══════════════════════════════════ */

function AboutStats() {
  return (
    <section className="about-section">
      <div className="about-grid">
        <p className="about-col-heading">Your growth starts here</p>
        <div className="about-col-text">
          <p className="about-paragraph">
            Since 2016, we have partnered with leading teams to define, design, and ship
            critical product experiences at scale.
          </p>
          <p className="about-paragraph">
            We embed directly into live products to shape core flows, features, and
            systems — from strategic direction to production-ready execution.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { stat: "1.2B", label: "Global users reached" },
          { stat: "156",  label: "Products shipped" },
          { stat: "2",    label: "Weeks for the first results" },
        ].map(({ stat, label }) => (
          <div key={stat}>
            <div className="stat-number">{stat}</div>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   6. GROWTH FRAMEWORK
   ═══════════════════════════════════ */

function GrowthFramework() {
  return (
    <section className="growth-section" id="solutions">
      <div className="growth-grid">
        {/* Left text column */}
        <div className="growth-left">
          <div>
            <h2 className="growth-heading">
              Growth
              <br />
              Framework
            </h2>
            <p className="growth-desc">
              We take ownership of growth-critical product experiences. From defining
              key moments to shipping production-ready solutions inside live products.
            </p>

            <div className="growth-list">
              {[
                "Product & Funnel investigation",
                "Behavioural conversion modelling",
                "Experimentation discovery",
                "Production-ready UX solutions",
                "A/B testing & post-release performance analysis",
              ].map((item) => (
                <div key={item} className="growth-list-item">
                  <span className="growth-list-dash">—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="growth-cta">
            <TalkButton />
          </div>
        </div>

        {/* Right image column */}
        <div className="growth-right">
          <img
            src={CASE_IMAGES.framework}
            alt="Growth Framework"
            className="growth-image"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   SHARED: TALK BUTTON
   ═══════════════════════════════════ */

function TalkButton({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="mailto:hello@uxlab.digital"
      className={`talk-btn${dark ? " talk-btn--dark" : ""}`}
    >
      Let's talk
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 12L12 2M12 2H3.5M12 2V10.5"
          stroke={dark ? "#fff" : "#000"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

/* ═══════════════════════════════════
   7. SELECTED RESULTS
   ═══════════════════════════════════ */

const CASE_STUDIES = [
  {
    id: "bankrollu",
    image: CASE_IMAGES.bankrollu,
    stats: [
      { value: "+40%",  label: "User LTV" },
      { value: "+27%",  label: "Trial completion rate" },
    ],
    headline: "4× Trial-to-Paid Conversion via experience-led design",
    company: "Bankrollu",
    type: "CRO & Revenue Optimization",
    date: "2025-ongoing",
    tags: ["Gambling & Betting", "Selected Cases"],
  },
  {
    id: "nespresso",
    image: CASE_IMAGES.nespresso,
    stats: [
      { value: "+18%",  label: "Mobile conversion rate" },
      { value: "+24%",  label: "Drop-off reduction" },
    ],
    headline: "+32% Checkout Completion Rate through experience-led optimization",
    company: "Nespresso",
    type: "CRO & UX Strategy",
    date: "2023 - 2024",
    tags: ["eCommerce", "Enterprise", "Selected Cases"],
  },
  {
    id: "tapmy",
    image: CASE_IMAGES.tapmy,
    stats: [
      { value: "+100%", label: "+46% Activation rate" },
      { value: "1.3B",  label: "Global users reached" },
    ],
    headline: "1,000 Paying Users in 3 Months via experience-led monetization",
    company: "Tapmy",
    type: "zero-to-launch",
    date: "2025-ongoing",
    tags: ["Mobile", "AI", "Selected Cases"],
  },
  {
    id: "firestarter",
    image: CASE_IMAGES.firestarter,
    stats: [
      { value: "+142%", label: "User activation" },
      { value: "+66%",  label: "Conversion rate" },
    ],
    headline: "+142% in User Activation via experience-led onboarding",
    company: "Firestarter",
    type: "CRO & Revenue Optimization",
    date: "2023 - 2024",
    tags: ["Saas", "Selected Cases"],
  },
  {
    id: "boostra",
    image: CASE_IMAGES.boostra,
    stats: [
      { value: "+41%",  label: "Trial activation rate" },
      { value: "+30%",  label: "Average conversion uplift" },
    ],
    headline: "+32% Trial-to-Paid Conversion via experience-led design",
    company: "Boostra",
    type: "CRO & UX Strategy",
    date: "2023 - 2024",
    tags: ["Saas", "Selected Cases"],
  },
  {
    id: "tradevision",
    image: CASE_IMAGES.tradevision,
    stats: [
      { value: "+11.6%", label: "Lead-to-Paid conversion" },
      { value: "4 weeks", label: "4-week optimization window" },
    ],
    headline: "+11.6% Lead-to-Paid Conversion in 4 Weeks via experience-led funnel optimization",
    company: "TradeVision",
    type: "CRO & Revenue Optimization",
    date: "2023 - 2024",
    tags: ["Finances & Crypto", "Selected Cases"],
  },
];

const FILTER_TABS = [
  "Selected Cases",
  "Enterprise",
  "AI",
  "Saas",
  "Mobile",
  "Gambling & Betting",
  "Finances & Crypto",
  "eCommerce",
];

function SelectedResults() {
  const [activeFilter, setActiveFilter] = useState("Selected Cases");

  const filtered =
    activeFilter === "Selected Cases"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((c) => c.tags.includes(activeFilter));

  return (
    <section className="results-section" id="cases">
      <h2 className="section-heading">
        Selected
        <br />
        Results
      </h2>

      <div className="filter-bar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`filter-tab${activeFilter === tab ? " active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="cases-grid">
        {filtered.map((cs) => (
          <CaseCard key={cs.id} data={cs} />
        ))}
      </div>
    </section>
  );
}

function CaseCard({ data }: { data: (typeof CASE_STUDIES)[0] }) {
  return (
    <article className="case-card">
      <div className="case-image-wrap">
        <img src={data.image} alt={data.company} loading="lazy" />
        <span className="case-read-badge">
          Read Case Study
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1.5 10.5L10.5 1.5M10.5 1.5H3M10.5 1.5V9"
              stroke="#000"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="case-body">
        <div className="case-stats">
          {data.stats.map(({ value, label }) => (
            <div key={value}>
              <div className="case-stat-value">{value}</div>
              <div className="case-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <p className="case-headline">{data.headline}</p>

        <div className="case-meta">
          <span>{data.company}</span>
          <span className="case-meta-dot">·</span>
          <span>{data.type}</span>
          <span className="case-meta-dot">·</span>
          <span>{data.date}</span>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════
   8. CHALLENGES WE SOLVE
   ═══════════════════════════════════ */

const CHALLENGES = [
  {
    num: "01/",
    title: "Conversion Rate optimization (CRO)",
    desc: "Systematic improvement of conversion across key product and funnel touchpoints through UX changes grounded in user behavior and data.",
  },
  {
    num: "02/",
    title: "Experience-led revenue optimization",
    desc: "Revenue growth driven by improving user journeys, decision points, and product experience across conversion, monetization, and retention.",
  },
  {
    num: "03/",
    title: "End-to-end product design",
    desc: "Holistic design and redesign of products from structure and flows to interaction and visual systems, built for scale and monetization.",
  },
  {
    num: "04/",
    title: "Monetization & funnel architecture",
    desc: "Design of pricing, trials, paywalls, and funnels as a single monetization system that increases predictability and revenue efficiency.",
  },
  {
    num: "05/",
    title: "System-level UX transformation",
    desc: "Unification of fragmented UX decisions into a coherent, scalable product experience aligned with business and growth goals.",
  },
];

function ChallengesSection() {
  return (
    <section className="challenges-section">
      <h2 className="section-heading">
        Challenges
        <br />
        We Solve
      </h2>

      <div className="challenge-list">
        {CHALLENGES.map(({ num, title, desc }) => (
          <div key={num} className="challenge-row">
            <span className="challenge-num">{num}</span>

            <div className="challenge-content">
              <h3 className="challenge-title">{title}</h3>
              <p className="challenge-desc">{desc}</p>
            </div>

            <div className="challenge-cta">
              <TalkButton />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   9. PROCESS STEPS
   ═══════════════════════════════════ */

const STEPS = [
  { num: "01", label: "Project Kickoff" },
  { num: "02", label: "UX Strategy" },
  { num: "03", label: "UX Execution" },
  { num: "04", label: "Results" },
  { num: "05", label: "Corrections" },
];

function ProcessSection() {
  return (
    <section className="process-section">
      <div className="process-inner">
        <h2 className="process-heading">
          After shipping hundreds of products, there are a few key things
          we've learned are needed to do the best work
        </h2>

        <div className="process-grid">
          {STEPS.map(({ num, label }) => (
            <div key={num} className="process-step">
              <div className="process-step-num">{num}</div>
              <div className="process-step-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   10. WORKING MODELS
   ═══════════════════════════════════ */

function WorkingModels() {
  return (
    <section className="models-section">
      <h2 className="models-heading">
        Working
        <br />
        Models
      </h2>

      <div className="models-grid">
        {/* Sprint */}
        <div className="model-card">
          <h3 className="model-title">Sprint</h3>
          <p className="model-desc">Core flow. Fixed scope. Revenue impact. (funnel, paywall, dedicated feature)</p>
          <p className="model-duration">Duration: 2–3 weeks</p>

          <div className="model-features">
            {[
              "Revenue flow breakdown",
              "Clear bottleneck resolution",
              "Experiment-ready solutions for rapid rollout",
              "A/B ready specs (events, success metrics)",
              "Dev-handoff (Figma + logic)",
            ].map((item) => (
              <div key={item} className="model-feature">
                <CheckIcon />
                {item}
              </div>
            ))}
          </div>

          <div className="model-footer">
            <a href="mailto:hello@uxlab.digital" className="model-btn">
              Let's talk
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 12L12 2M12 2H3.5M12 2V10.5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span className="model-price">Fixed price: 15,000 USD (sprint)</span>
          </div>
        </div>

        {/* Marathon */}
        <div className="model-card">
          <h3 className="model-title">Marathon</h3>
          <p className="model-desc">System-level optimization for sustained growth. Product launch.</p>
          <p className="model-duration">Duration: 6–12+ weeks</p>

          <div className="model-features">
            {[
              "Deep system-level UX and revenue solutions",
              "End-to-end funnel and monetization optimization",
              "Cross-flow alignment across acquisition, activation, and revenue",
              "Day-to-day iteration and performance tracking",
              "Scalable improvements designed for long-term growth",
            ].map((item) => (
              <div key={item} className="model-feature">
                <CheckIcon />
                {item}
              </div>
            ))}
          </div>

          <div className="model-footer">
            <a href="mailto:hello@uxlab.digital" className="model-btn">
              Let's talk
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 12L12 2M12 2H3.5M12 2V10.5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span className="model-price">Starting from 10,000 USD / Mo</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="model-feature-check">
      <path
        d="M2.5 8L6.5 12L13.5 4"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════
   11. UXLAB AT A GLANCE
   ═══════════════════════════════════ */

const GLANCE_CARDS = [
  {
    bg: "#5B3FD8",
    textColor: "#fff",
    mutedColor: "rgba(255,255,255,0.7)",
    title: "High-converting creator storefronts that helped Stan generate $2B+ in revenue",
    stat: "$2B+",
    label: "In revenue for 36 months",
  },
  {
    bg: "#111",
    textColor: "#fff",
    mutedColor: "rgba(255,255,255,0.7)",
    title: "Scaling global ecommerce experience",
    stat: "+23%",
    label: "add-to-bag interaction uplift",
  },
  {
    bg: "#f0ede8",
    textColor: "#000",
    mutedColor: "rgba(0,0,0,0.7)",
    title: "Revenue-driven product execution through high-impact user experience",
    stat: "+56%",
    label: "average conversions uplift",
  },
  {
    bg: "#1a1a1a",
    textColor: "#fff",
    mutedColor: "rgba(255,255,255,0.7)",
    title: "Launching a category-defining product",
    stat: "8 weeks",
    label: "go to market",
  },
  {
    bg: "#2D1B69",
    textColor: "#fff",
    mutedColor: "rgba(255,255,255,0.7)",
    title: "Developing scalable growth funnels for web3 products",
    stat: "230%",
    label: "average conversion uplift",
  },
  {
    bg: "#e8e4df",
    textColor: "#000",
    mutedColor: "rgba(0,0,0,0.7)",
    title: "A stress-free stay tailored to your needs",
    stat: "2.8x",
    label: "Global users reached",
  },
];

function GlanceSection() {
  return (
    <section className="glance-section">
      <div className="glance-header">
        <span className="glance-title">UXLAB at a Glance</span>
        <a href="mailto:hello@uxlab.digital" className="glance-email">
          hello@uxlab.digital
        </a>
      </div>

      <div className="glance-scroll">
        {GLANCE_CARDS.map(({ bg, textColor, mutedColor, title, stat, label }, i) => (
          <div
            key={i}
            className="glance-card"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ "--card-bg": bg, "--card-text": textColor, "--card-muted": mutedColor } as any}
          >
            <p className="glance-card-title">{title}</p>
            <div className="glance-card-bottom">
              <div className="glance-card-stat">{stat}</div>
              <div className="glance-card-label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   12. FOOTER
   ═══════════════════════════════════ */

function Footer() {
  return (
    <footer className="site-footer">
      <h2 className="footer-headline">
        Do it once.
        <br />
        Do it right.
      </h2>

      <div className="footer-contact">
        <p className="footer-contact-text">
          Contact us:{" "}
          <a href="mailto:hello@uxlab.digital" className="footer-contact-link">
            hello@uxlab.digital
          </a>
        </p>
      </div>

      <div className="footer-bottom">
        <span className="footer-copyright">Terms of use ©16—26</span>

        <nav className="footer-nav">
          {[
            { label: "Solutions",  href: "#solutions" },
            { label: "Cases",      href: "#cases" },
            { label: "About",      href: "#about" },
            { label: "Instagram",  href: "https://www.instagram.com/uxlab_digital/" },
            { label: "Linkedin",   href: "https://www.linkedin.com/company/uxlabdigital/" },
            { label: "X",          href: "https://x.com/Uxlab_Digital" },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="footer-nav-link">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
