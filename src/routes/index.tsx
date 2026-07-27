import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";

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

/* ─── constants ─────────────────────────────────────── */

const TT_THIN = '"TT Hoves Thin", sans-serif';
const TT_LIGHT = '"TT Hoves Light", sans-serif';
const TT_REGULAR = '"TT Hoves Regular", sans-serif';

const CASE_IMAGES = {
  bankrollu: "https://framerusercontent.com/images/vRITaiEiDsdL2yC1in82xp0kydo.png?width=1400&height=880",
  nespresso: "https://framerusercontent.com/images/rPU0Qjv0ttziUBWU5IgsdRdQ.jpg?width=1400&height=880",
  tapmy: "https://framerusercontent.com/images/Ip1iXKcEXgJC1IL75ZdqitIxbWc.jpg?width=1400&height=880",
  firestarter: "https://framerusercontent.com/images/zUXoFmhGfLcY1OSlORzKG7ZnXKE.jpg?width=1400&height=960",
  boostra: "https://framerusercontent.com/images/WCs2WPTb9F0fANrHFADlOIzZs.jpg?width=1400&height=880",
  tradevision: "https://framerusercontent.com/images/0kzcVOwqKIbN6JsYjUP1JAr1NE.jpg?width=1400&height=880",
  extra1: "https://framerusercontent.com/images/gZPVeGM6Vrg0Jw2I60LIIY39qEQ.jpg?width=1400&height=880",
  extra2: "https://framerusercontent.com/images/Tmhg35kU1fX4LEqzTWD6IbyaKEI.jpg?width=992&height=610",
};

/* ─── main page ─────────────────────────────────────── */

function LandingPage() {
  return (
    <div style={{ backgroundColor: "#000", color: "#fff", overflowX: "hidden" }}>
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

/* ─── 1. NAVBAR ─────────────────────────────────────── */

function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <a
        href="/"
        style={{
          fontFamily: TT_REGULAR,
          fontSize: "14px",
          fontWeight: 400,
          color: "#fff",
          letterSpacing: "-0.42px",
          textDecoration: "none",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        UXLAB®
      </a>

      <div style={{ display: "flex" }}>
        {[
          { label: "Solutions", href: "#solutions" },
          { label: "Case Studies", href: "#cases" },
          { label: "Let's talk", href: "mailto:hello@uxlab.digital" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontFamily: TT_REGULAR,
              fontSize: "14px",
              fontWeight: 400,
              color: "#fff",
              letterSpacing: "-0.42px",
              textDecoration: "none",
              padding: "16px 20px 16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {label}
            <ArrowIcon />
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1.5 8.5L8.5 1.5M8.5 1.5H2.5M8.5 1.5V7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── 2. HERO ───────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100dvh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: "52px",
        overflow: "hidden",
      }}
    >
      {/* subtitle text — right side, upper */}
      <div
        style={{
          position: "absolute",
          top: "calc(52px + 80px)",
          right: "24px",
          textAlign: "right",
          maxWidth: "340px",
        }}
      >
        <p
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "20px",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-0.6px",
            lineHeight: "28.8px",
          }}
        >
          UXLAB® partners with product teams
          <br />
          to define and ship revenue-critical product experiences from
          <br />
          architecture to execution.
        </p>
      </div>

      {/* giant headline */}
      <h1
        style={{
          fontFamily: TT_THIN,
          fontSize: "clamp(80px, 19vw, 220px)",
          fontWeight: 250,
          color: "#fff",
          letterSpacing: "clamp(-6px, -1.5vw, -15.5px)",
          lineHeight: 1.2,
          margin: 0,
          padding: "0 0 0 0",
          whiteSpace: "nowrap",
          overflow: "visible",
        }}
      >
        We Design Revenue
      </h1>
    </section>
  );
}

/* ─── 3. CASE STUDY SHOWCASE ────────────────────────── */

function CaseStudyShowcase() {
  const images = [
    CASE_IMAGES.bankrollu,
    CASE_IMAGES.nespresso,
    CASE_IMAGES.tapmy,
    CASE_IMAGES.firestarter,
    CASE_IMAGES.boostra,
    CASE_IMAGES.tradevision,
    CASE_IMAGES.extra1,
    CASE_IMAGES.extra2,
  ];

  return (
    <section
      style={{
        backgroundColor: "#f0ede8",
        overflow: "hidden",
        paddingTop: "0",
        paddingBottom: "0",
      }}
    >
      <div className="case-study-showcase">
        <div className="case-study-showcase-inner">
          {[...images, ...images].map((src, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: "clamp(280px, 30vw, 480px)",
                height: "clamp(200px, 22vw, 340px)",
                overflow: "hidden",
              }}
            >
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. FEATURED ENGAGEMENTS ───────────────────────── */

function FeaturedEngagements() {
  const logos = [
    { name: "Calendly", style: { fontFamily: TT_LIGHT, fontSize: "20px", letterSpacing: "-0.4px" } },
    { name: "Stan", style: { fontFamily: TT_REGULAR, fontSize: "20px", fontWeight: 700, letterSpacing: "0px" } },
    { name: "Forbes", style: { fontFamily: "Georgia, serif", fontSize: "20px", letterSpacing: "0px" } },
    { name: "NESPRESSO", style: { fontFamily: TT_REGULAR, fontSize: "14px", letterSpacing: "2px" } },
    { name: "softr", style: { fontFamily: TT_REGULAR, fontSize: "20px", letterSpacing: "-0.4px" } },
  ];
  const logosRow2 = [
    { name: "ZARA", style: { fontFamily: TT_REGULAR, fontSize: "22px", letterSpacing: "4px" } },
    { name: "Polymarket", style: { fontFamily: TT_REGULAR, fontSize: "18px", letterSpacing: "-0.4px" } },
    { name: "easy®", style: { fontFamily: TT_REGULAR, fontSize: "20px", fontWeight: 700, letterSpacing: "-0.4px" } },
    { name: "Forbes Travel Guide", style: { fontFamily: "Georgia, serif", fontSize: "14px", letterSpacing: "0px" } },
    { name: "Pipedrive", style: { fontFamily: TT_REGULAR, fontSize: "18px", letterSpacing: "-0.4px" } },
  ];

  return (
    <section
      style={{
        backgroundColor: "#000",
        padding: "80px 24px",
      }}
    >
      <p
        style={{
          fontFamily: TT_LIGHT,
          fontSize: "20px",
          fontWeight: 300,
          color: "#fff",
          letterSpacing: "-0.6px",
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        Featured engagements
      </p>

      {[logos, logosRow2].map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(32px, 6vw, 80px)",
            marginBottom: ri === 0 ? "40px" : 0,
          }}
        >
          {row.map(({ name, style }) => (
            <span
              key={name}
              style={{
                ...style,
                color: "rgba(255,255,255,0.85)",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

/* ─── 5. ABOUT + STATS ──────────────────────────────── */

function AboutStats() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        backgroundColor: "#000",
        padding: "80px 24px 80px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "48px",
          alignItems: "start",
          marginBottom: "64px",
        }}
      >
        <p
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "20px",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-0.6px",
            lineHeight: "28.8px",
          }}
        >
          Your growth starts here
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
            }}
          >
            Since 2016, we have partnered with leading teams to define, design, and ship critical product experiences at scale.
          </p>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
            }}
          >
            We embed directly into live products to shape core flows, features, and systems — from strategic direction to production-ready execution.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
          gap: "24px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "48px",
        }}
      >
        {[
          { stat: "1.2B", label: "Global users reached" },
          { stat: "156", label: "Products shipped" },
          { stat: "2", label: "Weeks for the first results" },
        ].map(({ stat, label }) => (
          <div key={stat}>
            <div
              style={{
                fontFamily: TT_THIN,
                fontSize: "clamp(48px, 8vw, 102px)",
                fontWeight: 250,
                color: "#fff",
                letterSpacing: "-7.14px",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {stat}
            </div>
            <p
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "20px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "-0.6px",
                lineHeight: "28.8px",
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 6. GROWTH FRAMEWORK ───────────────────────────── */

function GrowthFramework() {
  const isMobile = useIsMobile();
  return (
    <section
      id="solutions"
      style={{
        backgroundColor: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          minHeight: isMobile ? "auto" : "600px",
        }}
      >
        {/* Left text */}
        <div style={{ padding: "64px 48px 64px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2
              style={{
                fontFamily: TT_THIN,
                fontSize: "clamp(48px, 8vw, 102px)",
                fontWeight: 250,
                color: "#fff",
                letterSpacing: "-7.14px",
                lineHeight: 1,
                marginBottom: "32px",
              }}
            >
              Growth
              <br />
              Framework
            </h2>
            <p
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "20px",
                fontWeight: 300,
                color: "#fff",
                letterSpacing: "-0.6px",
                lineHeight: "28.8px",
                marginBottom: "40px",
                maxWidth: "480px",
              }}
            >
              We take ownership of growth-critical product experiences. From defining key moments to shipping production-ready solutions inside live products.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                "Product & Funnel investigation",
                "Behavioural conversion modelling",
                "Experimentation discovery",
                "Production-ready UX solutions",
                "A/B testing & post-release performance analysis",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    fontFamily: TT_LIGHT,
                    fontSize: "20px",
                    fontWeight: 300,
                    color: "#fff",
                    letterSpacing: "-0.6px",
                    lineHeight: "28.8px",
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <TalkButton dark={false} />
          </div>
        </div>

        {/* Right image */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={CASE_IMAGES.extra2}
            alt="Growth Framework"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: "brightness(0.7)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Button ────────────────────────────────────── */

function TalkButton({ dark }: { dark: boolean }) {
  return (
    <a
      href="mailto:hello@uxlab.digital"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: TT_REGULAR,
        fontSize: "18px",
        fontWeight: 400,
        color: dark ? "#fff" : "#000",
        letterSpacing: "-0.54px",
        backgroundColor: dark ? "#000" : "#fff",
        borderRadius: "100px",
        padding: "12px 24px",
        textDecoration: "none",
        border: dark ? "1px solid rgba(255,255,255,0.2)" : "none",
        lineHeight: "24px",
        transition: "opacity 0.2s",
      }}
    >
      Let's talk
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 12L12 2M12 2H3.5M12 2V10.5" stroke={dark ? "#fff" : "#000"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/* ─── 7. SELECTED RESULTS ───────────────────────────── */

const CASE_STUDIES = [
  {
    id: "bankrollu",
    image: CASE_IMAGES.bankrollu,
    stats: [
      { value: "+ 40%", label: "User LTV" },
      { value: "+27%", label: "Trial completion rate" },
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
      { value: "+18%", label: "Mobile conversion rate" },
      { value: "+24%", label: "Drop-off reduction" },
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
      { value: "1.3B", label: "Global users reached" },
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
      { value: "+66%", label: "Conversion rate" },
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
      { value: "+41%", label: "Trial activation rate" },
      { value: "+30%", label: "Average conversion uplift" },
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
  const isMobile = useIsMobile();
  const [activeFilter, setActiveFilter] = useState("Selected Cases");

  const filtered =
    activeFilter === "Selected Cases"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((c) => c.tags.includes(activeFilter));

  return (
    <section
      id="cases"
      style={{
        backgroundColor: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Huge heading */}
      <div style={{ overflow: "hidden", padding: "0 0 0 0" }}>
        <h2
          style={{
            fontFamily: TT_THIN,
            fontSize: "clamp(60px, 22vw, 248px)",
            fontWeight: 250,
            color: "#fff",
            letterSpacing: "clamp(-3px, -1.5vw, -17.36px)",
            lineHeight: 1,
            margin: 0,
            padding: "48px 0 0 0",
            whiteSpace: "nowrap",
          }}
        >
          Selected
          <br />
          Results
        </h2>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          scrollbarWidth: "none",
        }}
      >
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

      {/* Case cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        {filtered.map((cs, i) => (
          <CaseCard key={cs.id} data={cs} borderRight={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}

function CaseCard({ data, borderRight }: { data: (typeof CASE_STUDIES)[0]; borderRight: boolean }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        borderRight: borderRight ? "1px solid rgba(255,255,255,0.1)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
        <img
          src={data.image}
          alt={data.company}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
        {/* Read case study button */}
        <div style={{ position: "absolute", bottom: "20px", right: "20px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: TT_REGULAR,
              fontSize: "18px",
              fontWeight: 400,
              color: "#000",
              letterSpacing: "-0.54px",
              backgroundColor: "#fff",
              borderRadius: "100px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Read Case Study
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 10.5L10.5 1.5M10.5 1.5H3M10.5 1.5V9" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Text content */}
      <div style={{ padding: "32px 32px 40px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "24px" }}>
          {data.stats.map(({ value, label }) => (
            <div key={value}>
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "48px",
                  fontWeight: 300,
                  color: "#fff",
                  letterSpacing: "-1.92px",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "-0.6px",
                  lineHeight: "28.8px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Headline */}
        <p
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "28px",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-1.12px",
            lineHeight: "36px",
            marginBottom: "20px",
          }}
        >
          {data.headline}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontFamily: TT_LIGHT,
            fontSize: "14px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.56px",
          }}
        >
          <span>{data.company}</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>{data.type}</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>{data.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 8. CHALLENGES WE SOLVE ────────────────────────── */

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
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        backgroundColor: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Giant heading */}
      <div style={{ overflow: "hidden" }}>
        <h2
          style={{
            fontFamily: TT_THIN,
            fontSize: "clamp(60px, 22vw, 248px)",
            fontWeight: 250,
            color: "#fff",
            letterSpacing: "clamp(-3px, -1.5vw, -17.36px)",
            lineHeight: 1,
            margin: 0,
            padding: "48px 0 0 0",
            whiteSpace: "nowrap",
          }}
        >
          Challenges
          <br />
          We Solve
        </h2>
      </div>

      {/* Challenge items */}
      <div style={{ marginTop: "0px" }}>
        {CHALLENGES.map(({ num, title, desc }) => (
          <div
            key={num}
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              padding: isMobile ? "32px 24px" : "40px 24px",
              display: "grid",
              gridTemplateColumns: isMobile ? "40px 1fr" : "80px 1fr auto",
              gap: isMobile ? "16px" : "32px",
              alignItems: "start",
            }}
          >
            <span
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "14px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "-0.42px",
                paddingTop: "8px",
              }}
            >
              {num}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "clamp(24px, 4vw, 48px)",
                  fontWeight: 300,
                  color: "#fff",
                  letterSpacing: "-1.92px",
                  lineHeight: 1.1,
                  marginBottom: "16px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "-0.6px",
                  lineHeight: "28.8px",
                  maxWidth: "540px",
                }}
              >
                {desc}
              </p>
            </div>
            <div style={{ paddingTop: "6px" }}>
              <TalkButton dark={false} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 9. PROCESS STEPS ──────────────────────────────── */

const STEPS = [
  { num: "01", label: "Project Kickoff" },
  { num: "02", label: "UX Strategy" },
  { num: "03", label: "UX Execution" },
  { num: "04", label: "Results" },
  { num: "05", label: "Corrections" },
];

function ProcessSection() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        backgroundColor: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: TT_THIN,
            fontSize: "clamp(32px, 8vw, 102px)",
            fontWeight: 250,
            color: "#fff",
            letterSpacing: "clamp(-2px, -0.7vw, -7.14px)",
            lineHeight: 1.05,
            marginBottom: "64px",
            maxWidth: "900px",
          }}
        >
          After shipping hundreds of products, there are a few key things we've learned are needed to do the best work
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {STEPS.map(({ num, label }, i) => (
            <div
              key={num}
              style={{
                padding: "32px 24px 32px 0",
                borderRight: i < 4 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "14px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "-0.42px",
                  marginBottom: "12px",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "#fff",
                  letterSpacing: "-0.6px",
                  lineHeight: "28.8px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 10. WORKING MODELS ────────────────────────────── */

function WorkingModels() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        backgroundColor: "#f5f5f5",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Giant heading */}
      <div style={{ overflow: "hidden" }}>
        <h2
          style={{
            fontFamily: TT_THIN,
            fontSize: "clamp(60px, 22vw, 248px)",
            fontWeight: 250,
            color: "#000",
            letterSpacing: "clamp(-3px, -1.5vw, -17.36px)",
            lineHeight: 1,
            margin: 0,
            padding: "48px 0 0 0",
            whiteSpace: "nowrap",
          }}
        >
          Working
          <br />
          Models
        </h2>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "0",
          padding: "0",
          marginTop: "48px",
        }}
      >
        {/* Sprint */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "48px 40px 48px",
            borderRight: "1px solid rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          <h3
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "48px",
              fontWeight: 300,
              color: "#000",
              letterSpacing: "-1.92px",
              lineHeight: 1,
              marginBottom: "12px",
            }}
          >
            Sprint
          </h3>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "#000",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
              marginBottom: "8px",
            }}
          >
            Core flow. Fixed scope. Revenue impact. (funnel, paywall, dedicated feature)
          </p>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "rgba(0,0,0,0.6)",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
              marginBottom: "32px",
            }}
          >
            Duration: 2–3 weeks
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0", borderTop: "1px solid rgba(0,0,0,0.1)", marginBottom: "40px" }}>
            {[
              "Revenue flow breakdown",
              "Clear bottleneck resolution",
              "Experiment-ready solutions for rapid rollout",
              "A/B ready specs (events, success metrics)",
              "Dev-handoff (Figma + logic)",
            ].map((item) => (
              <div
                key={item}
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "#000",
                  letterSpacing: "-0.6px",
                  lineHeight: "28.8px",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8L6.5 12L13.5 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <a
              href="mailto:hello@uxlab.digital"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: TT_REGULAR,
                fontSize: "18px",
                fontWeight: 400,
                color: "#fff",
                letterSpacing: "-0.54px",
                backgroundColor: "#000",
                borderRadius: "100px",
                padding: "12px 24px",
                textDecoration: "none",
                lineHeight: "24px",
              }}
            >
              Let's talk
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12L12 2M12 2H3.5M12 2V10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "16px",
                fontWeight: 300,
                color: "rgba(0,0,0,0.7)",
                letterSpacing: "-0.48px",
              }}
            >
              Fixed price: 15,000 USD (sprint)
            </span>
          </div>
        </div>

        {/* Marathon */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "48px 40px 48px",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          <h3
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "48px",
              fontWeight: 300,
              color: "#000",
              letterSpacing: "-1.92px",
              lineHeight: 1,
              marginBottom: "12px",
            }}
          >
            Marathon
          </h3>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "#000",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
              marginBottom: "8px",
            }}
          >
            System-level optimization for sustained growth. Product launch.
          </p>
          <p
            style={{
              fontFamily: TT_LIGHT,
              fontSize: "20px",
              fontWeight: 300,
              color: "rgba(0,0,0,0.6)",
              letterSpacing: "-0.6px",
              lineHeight: "28.8px",
              marginBottom: "32px",
            }}
          >
            Duration: 6–12+ weeks
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0", borderTop: "1px solid rgba(0,0,0,0.1)", marginBottom: "40px" }}>
            {[
              "Deep system-level UX and revenue solutions",
              "End-to-end funnel and monetization optimization",
              "Cross-flow alignment across acquisition, activation, and revenue",
              "Day-to-day iteration and performance tracking",
              "Scalable improvements designed for long-term growth",
            ].map((item) => (
              <div
                key={item}
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "#000",
                  letterSpacing: "-0.6px",
                  lineHeight: "28.8px",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8L6.5 12L13.5 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <a
              href="mailto:hello@uxlab.digital"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: TT_REGULAR,
                fontSize: "18px",
                fontWeight: 400,
                color: "#fff",
                letterSpacing: "-0.54px",
                backgroundColor: "#000",
                borderRadius: "100px",
                padding: "12px 24px",
                textDecoration: "none",
                lineHeight: "24px",
              }}
            >
              Let's talk
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12L12 2M12 2H3.5M12 2V10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "16px",
                fontWeight: 300,
                color: "rgba(0,0,0,0.7)",
                letterSpacing: "-0.48px",
              }}
            >
              Starting from 10,000 USD / Mo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 11. UXLAB AT A GLANCE ─────────────────────────── */

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
    <section
      style={{
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <span
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "20px",
            fontWeight: 300,
            color: "#000",
            letterSpacing: "-0.6px",
          }}
        >
          UXLAB at a Glance
        </span>
        <a
          href="mailto:hello@uxlab.digital"
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "20px",
            fontWeight: 300,
            color: "#000",
            letterSpacing: "-0.6px",
            textDecoration: "none",
          }}
        >
          hello@uxlab.digital
        </a>
      </div>

      {/* Scrolling cards */}
      <div
        className="glance-scroll"
        style={{ cursor: "grab" }}
      >
        {GLANCE_CARDS.map(({ bg, textColor, mutedColor, title, stat, label }, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: "clamp(280px, 28vw, 380px)",
              backgroundColor: bg,
              padding: "40px 32px",
              borderRight: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "380px",
            }}
          >
            <p
              style={{
                fontFamily: TT_LIGHT,
                fontSize: "20px",
                fontWeight: 300,
                color: textColor,
                letterSpacing: "-0.6px",
                lineHeight: "28.8px",
              }}
            >
              {title}
            </p>
            <div>
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "48px",
                  fontWeight: 300,
                  color: textColor,
                  letterSpacing: "-1.92px",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat}
              </div>
              <div
                style={{
                  fontFamily: TT_LIGHT,
                  fontSize: "14px",
                  fontWeight: 300,
                  color: mutedColor,
                  letterSpacing: "-0.56px",
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 12. FOOTER ────────────────────────────────────── */

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#000",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Giant headline */}
      <div style={{ overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2
          style={{
            fontFamily: TT_THIN,
            fontSize: "clamp(48px, 10vw, 140px)",
            fontWeight: 250,
            color: "#fff",
            letterSpacing: "clamp(-2px, -0.8vw, -9px)",
            lineHeight: 1.1,
            margin: 0,
            padding: "64px 24px 48px",
          }}
        >
          Do it once.
          <br />
          Do it right.
        </h2>
      </div>

      {/* Contact row */}
      <div
        style={{
          padding: "32px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "20px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.6px",
          }}
        >
          Contact us:{" "}
          <a
            href="mailto:hello@uxlab.digital"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            hello@uxlab.digital
          </a>
        </p>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: TT_LIGHT,
            fontSize: "14px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.42px",
          }}
        >
          Terms of use ©16—26
        </span>

        <nav style={{ display: "flex", gap: "0px" }}>
          {[
            { label: "Solutions", href: "#solutions" },
            { label: "Cases", href: "#cases" },
            { label: "About", href: "#about" },
            { label: "Instagram", href: "#" },
            { label: "Linkedin", href: "#" },
            { label: "X", href: "#" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: TT_REGULAR,
                fontSize: "14px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "-0.42px",
                textDecoration: "none",
                padding: "8px 16px",
                borderLeft: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
