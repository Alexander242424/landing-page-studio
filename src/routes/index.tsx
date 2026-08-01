import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode, type FormEvent } from "react";

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

/* ─── typography constants (exact Framer measurements) ─ */
const TT_THIN = '"TT Hoves Thin", sans-serif';
const TT_LIGHT = '"TT Hoves Light", "TT Hoves Light Placeholder", sans-serif';
const TT_REGULAR = '"TT Hoves Regular", "TT Hoves Regular Placeholder", sans-serif';

/* ─── image urls ───────────────────────────────────────── */
const IMGS = {
  bankrollu: "https://framerusercontent.com/images/vRITaiEiDsdL2yC1in82xp0kydo.png?width=1400&height=880",
  nespresso: "https://framerusercontent.com/images/rPU0Qjv0ttziUBWU5IgsdRdQ.jpg?width=1400&height=880",
  tapmy:     "https://framerusercontent.com/images/Ip1iXKcEXgJC1IL75ZdqitIxbWc.jpg?width=1400&height=880",
  firestarter:"https://framerusercontent.com/images/zUXoFmhGfLcY1OSlORzKG7ZnXKE.jpg?width=1400&height=960",
  boostra:   "https://framerusercontent.com/images/WCs2WPTb9F0fANrHFADlOIzZs.jpg?width=1400&height=880",
  tradevision:"https://framerusercontent.com/images/0kzcVOwqKIbN6JsYjUP1JAr1NE.jpg?width=1400&height=880",
  extra1:    "https://framerusercontent.com/images/gZPVeGM6Vrg0Jw2I60LIIY39qEQ.jpg?width=1400&height=880",
  nespresso2:"https://framerusercontent.com/images/f8xfolsdekANhP4v3mbIaDS58.jpg?width=293&height=268",
  showcase:  "https://framerusercontent.com/images/vlIurghlpS1rVKiFEoBsTYc74.jpg?width=1488&height=1320",
};

/* ─── page ─────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="ux-page">
      <Navbar />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <LogosSection />
        <AboutSection />
        <GrowthSection />
        <ResultsSection />
        <ChallengesSection />
        <ProcessSection />
        <PricingSection />
        <GlanceSection />
        <Footer />
      </main>
    </div>
  );
}

/* ─── 1. NAVBAR ─────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="ux-nav">
      <a href="/" className="ux-nav__logo">UXLAB®</a>
      <div className="ux-nav__links">
        <a href="#solutions" className="ux-nav__link">Solutions</a>
        <a href="#cases" className="ux-nav__link">Cases</a>
        <a href="#process" className="ux-nav__link">Process</a>
        <a href="#pricing" className="ux-nav__link">Pricing</a>
      </div>
      <div className="ux-nav__actions">
        <a href="mailto:hello@uxlab.digital" className="ux-nav__login">Contact</a>
        <a href="https://getboostra.com" className="ux-nav__cta">
          Try Boostra
        </a>
      </div>
    </nav>
  );
}

/* ─── 2. HERO ───────────────────────────────────────────── */
function HeroSection() {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = url.trim() ? `https://getboostra.com/?url=${encodeURIComponent(url)}` : "https://getboostra.com";
    window.open(target, "_blank");
  };

  return (
    <section className="ux-hero">
      <div className="ux-hero__content">
        <h1 className="ux-hero__headline">We Design Revenue</h1>
        <p className="ux-hero__sub">
          UXLAB® partners with product teams to define and ship revenue-critical
          experiences — from architecture to execution.
        </p>

        <form className="ux-hero__input-row" onSubmit={handleSubmit} style={{ width: "100%" }}>
          <GlobeIcon />
          <input
            className="ux-hero__input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com"
          />
          <button type="submit" className="ux-hero__submit">
            Boost page
          </button>
        </form>

        <p className="ux-hero__trust">
          150+ conversion checks · instant action plan · best practices
        </p>
      </div>
    </section>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8.5" stroke="#004bff" strokeWidth="1.4"/>
      <path d="M10 1.5C10 1.5 7 5 7 10C7 15 10 18.5 10 18.5" stroke="#004bff" strokeWidth="1.4"/>
      <path d="M10 1.5C10 1.5 13 5 13 10C13 15 10 18.5 10 18.5" stroke="#004bff" strokeWidth="1.4"/>
      <path d="M1.5 10H18.5" stroke="#004bff" strokeWidth="1.4"/>
      <path d="M2.5 6.5H17.5" stroke="#004bff" strokeWidth="1.4"/>
      <path d="M2.5 13.5H17.5" stroke="#004bff" strokeWidth="1.4"/>
    </svg>
  );
}

/* ─── 3. SHOWCASE (scrolling mockups) ──────────────────── */
function ShowcaseSection() {
  const images = [
    IMGS.bankrollu, IMGS.nespresso, IMGS.tapmy, IMGS.firestarter,
    IMGS.boostra, IMGS.tradevision, IMGS.extra1, IMGS.showcase,
    // duplicate for seamless loop
    IMGS.bankrollu, IMGS.nespresso, IMGS.tapmy, IMGS.firestarter,
    IMGS.boostra, IMGS.tradevision, IMGS.extra1, IMGS.showcase,
  ];
  return (
    <section className="ux-showcase">
      <div className="ux-showcase__track">
        {images.map((src, i) => (
          <div key={i} className="ux-showcase__item">
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 4. LOGOS ─────────────────────────────────────────── */
/* Logos extracted as SVG-like inline brand marks */
function LogosSection() {
  return (
    <section className="ux-section ux-section--pad-top">
      <p className="ux-text-body ux-text-center ux-mb-logos-label">Featured engagements</p>
      <div className="ux-logos-grid">
        <LogoCell><CalendlyLogo /></LogoCell>
        <LogoCell><StanLogo /></LogoCell>
        <LogoCell><ForbesLogo /></LogoCell>
        <LogoCell><NespressoLogo /></LogoCell>
        <LogoCell><SoftrLogo /></LogoCell>
        <LogoCell><ZaraLogo /></LogoCell>
        <LogoCell><PolymarketLogo /></LogoCell>
        <LogoCell><EasyJetLogo /></LogoCell>
        <LogoCell><ForbesTravelLogo /></LogoCell>
        <LogoCell><PipedriveLogo /></LogoCell>
      </div>
    </section>
  );
}

function LogoCell({ children }: { children: ReactNode }) {
  return <div className="ux-logo-cell">{children}</div>;
}

function CalendlyLogo() {
  return (
    <svg viewBox="0 0 143 34" fill="none" className="ux-logo" style={{width:143,height:34}}>
      <path d="M27.3 17c0 5.5-3.5 9.8-8.7 9.8-5.3 0-8.9-4.3-8.9-9.8s3.6-9.8 8.9-9.8c5.2 0 8.7 4.3 8.7 9.8zM34 17C34 7.6 27.1 1 18.6 1 9.9 1 3 7.6 3 17s6.9 16 15.6 16C27.1 33 34 26.4 34 17z" fill="white"/>
      <text x="40" y="23" fill="white" fontFamily="Arial" fontSize="14" fontWeight="400">Calendly</text>
    </svg>
  );
}

function StanLogo() {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{width:28,height:28,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{color:'#000',fontFamily:'sans-serif',fontWeight:700,fontSize:14}}>S</span>
      </div>
      <span style={{color:'white',fontFamily:TT_REGULAR,fontSize:20,fontWeight:400}}>Stan</span>
    </div>
  );
}

function ForbesLogo() {
  return <span style={{color:'white',fontFamily:'Georgia,serif',fontSize:22,letterSpacing:0}}>Forbes</span>;
}

function NespressoLogo() {
  return <span style={{color:'white',fontFamily:TT_REGULAR,fontSize:12,letterSpacing:'3px',fontWeight:400}}>NESPRESSO</span>;
}

function SoftrLogo() {
  return <span style={{color:'white',fontFamily:TT_LIGHT,fontSize:20,letterSpacing:'-0.4px'}}>softr</span>;
}

function ZaraLogo() {
  return <span style={{color:'white',fontFamily:TT_REGULAR,fontSize:24,letterSpacing:'5px',fontWeight:400}}>ZARA</span>;
}

function PolymarketLogo() {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" fill="none" stroke="white" strokeWidth="1.5"/>
      </svg>
      <span style={{color:'white',fontFamily:TT_REGULAR,fontSize:16}}>Polymarket</span>
    </div>
  );
}

function EasyJetLogo() {
  return <span style={{color:'white',fontFamily:'sans-serif',fontSize:20,fontWeight:700}}>easy<sup style={{fontSize:12}}>®</sup></span>;
}

function ForbesTravelLogo() {
  return <span style={{color:'white',fontFamily:'Georgia,serif',fontSize:12,letterSpacing:'1px'}}>Forbes Travel Guide</span>;
}

function PipedriveLogo() {
  return <span style={{color:'white',fontFamily:TT_REGULAR,fontSize:16}}>Pipedrive</span>;
}

/* ─── 5. ABOUT + STATS ──────────────────────────────────── */
function AboutSection() {
  return (
    <section className="ux-section ux-section--pad-top ux-section--border-top">
      {/* Big full-width heading */}
      <h2 className="ux-about-heading ux-mb-40">
        Leading user experience and conversion rate optimization firm behind the world&apos;s fast-growing innovative digital products.
      </h2>

      {/* Two-column row */}
      <div className="ux-about-row">
        {/* Left: label */}
        <div className="ux-about-label">
          <p className="ux-text-body ux-text-muted">Your growth starts here</p>
        </div>
        {/* Right: description + stats */}
        <div className="ux-about-right">
          <p className="ux-text-body ux-mb-20">
            Since 2016, we have partnered with leading teams to define, design, and ship critical product experiences at scale.
          </p>
          <p className="ux-text-body ux-mb-stats">
            We embed directly into live products to shape core flows, features, and systems — from strategic direction to production-ready execution.
          </p>

          {/* Stats inside right column */}
          <div className="ux-stats-row">
            {[
              { n: "1.2B", label: "Global users reached" },
              { n: "156",  label: "Products shipped" },
              { n: "2",    label: "Weeks for the first results" },
            ].map(({ n, label }) => (
              <div key={n} className="ux-stat">
                <div className="ux-stat__num">{n}</div>
                <p className="ux-text-body ux-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. GROWTH FRAMEWORK ───────────────────────────────── */
function GrowthSection() {
  const items = [
    "Product & Funnel investigation",
    "Behavioural conversion modelling",
    "Experimentation discovery",
    "Production-ready UX solutions",
    "A/B testing & post-release performance analysis",
  ];
  return (
    <section id="solutions" className="ux-section ux-section--border-top ux-growth">
      <div className="ux-growth__left">
        <h2 className="ux-heading-lg ux-mb-32">Growth<br/>Framework</h2>
        <p className="ux-text-body ux-mb-40 ux-text-muted-desc">
          We take ownership of growth-critical product experiences. From defining key moments to shipping production-ready solutions inside live products.
        </p>
        <div className="ux-list">
          {items.map((item) => (
            <div key={item} className="ux-list__item">
              <span className="ux-list__dash">—</span>
              <span className="ux-text-body">{item}</span>
            </div>
          ))}
        </div>
        <div className="ux-mt-40">
          <TalkBtn onDark={false} />
        </div>
      </div>
      <div className="ux-growth__right">
        <img src={IMGS.nespresso} alt="Case study" loading="lazy" />
      </div>
    </section>
  );
}

/* ─── reusable CTA button ──────────────────────────────── */
function TalkBtn({ onDark }: { onDark: boolean }) {
  return (
    <a href="mailto:hello@uxlab.digital" className={`ux-btn ${onDark ? "ux-btn--dark" : "ux-btn--light"}`}>
      Let&apos;s talk
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1.5 11.5L11.5 1.5M11.5 1.5H3M11.5 1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
}

/* ─── 7. SELECTED RESULTS ───────────────────────────────── */
const CASES = [
  {
    id:"bankrollu", img:IMGS.bankrollu,
    stats:[{v:"+ 40%",l:"User LTV"},{v:"+27%",l:"Trial completion rate"}],
    headline:"4× Trial-to-Paid Conversion via experience-led design",
    co:"Bankrollu", type:"CRO & Revenue Optimization", date:"2025-ongoing",
    tags:["Selected Cases","Gambling & Betting"],
  },
  {
    id:"nespresso", img:IMGS.nespresso,
    stats:[{v:"+18%",l:"Mobile conversion rate"},{v:"+24%",l:"Drop-off reduction"}],
    headline:"+32% Checkout Completion Rate through experience-led optimization",
    co:"Nespresso", type:"CRO & UX Strategy", date:"2023 - 2024",
    tags:["Selected Cases","Enterprise","eCommerce"],
  },
  {
    id:"tapmy", img:IMGS.tapmy,
    stats:[{v:"+100%",l:"+46% Activation rate"},{v:"1.3B",l:"Global users reached"}],
    headline:"1,000 Paying Users in 3 Months via experience-led monetization",
    co:"Tapmy", type:"zero-to-launch", date:"2025-ongoing",
    tags:["Selected Cases","AI","Mobile"],
  },
  {
    id:"firestarter", img:IMGS.firestarter,
    stats:[{v:"+142%",l:"User activation"},{v:"+66%",l:"Conversion rate"}],
    headline:"+142% in User Activation via experience-led onboarding",
    co:"Firestarter", type:"CRO & Revenue Optimization", date:"2023 - 2024",
    tags:["Selected Cases","Saas"],
  },
  {
    id:"boostra", img:IMGS.boostra,
    stats:[{v:"+41%",l:"Trial activation rate"},{v:"+30%",l:"Average conversion uplift"}],
    headline:"+32% Trial-to-Paid Conversion via experience-led design",
    co:"Boostra", type:"CRO & UX Strategy", date:"2023 - 2024",
    tags:["Selected Cases","Saas"],
  },
  {
    id:"tradevision", img:IMGS.tradevision,
    stats:[{v:"+11.6%",l:"Lead-to-Paid conversion"},{v:"4 weeks",l:"4-week optimization window"}],
    headline:"+11.6% Lead-to-Paid Conversion in 4 Weeks via experience-led funnel optimization",
    co:"TradeVision", type:"CRO & Revenue Optimization", date:"2023 - 2024",
    tags:["Selected Cases","Finances & Crypto"],
  },
];

const FILTERS = ["Selected Cases","Enterprise","AI","Saas","Mobile","Gambling & Betting","Finances & Crypto","eCommerce"];

function ResultsSection() {
  const [active, setActive] = useState("Selected Cases");
  const visible = active === "Selected Cases" ? CASES : CASES.filter(c => c.tags.includes(active));
  return (
    <section id="cases" className="ux-section--border-top">
      {/* Giant heading */}
      <div className="ux-giant-heading-wrap">
        <h2 className="ux-giant-heading">Selected<br/>Results</h2>
      </div>
      {/* Filter tabs */}
      <div className="ux-filters" role="tablist">
        {FILTERS.map(f => (
          <button key={f} role="tab" aria-selected={active===f} onClick={()=>setActive(f)} className={`ux-filter-btn${active===f?" active":""}`}>{f}</button>
        ))}
      </div>
      {/* Grid */}
      <div className="ux-cases-grid">
        {visible.map((c, i) => <CaseCard key={c.id} data={c} rightBorder={i%2===0} />)}
      </div>
    </section>
  );
}

function CaseCard({ data, rightBorder }: { data: typeof CASES[0]; rightBorder: boolean }) {
  return (
    <article className={`ux-case${rightBorder ? " ux-case--border-right" : ""}`}>
      <div className="ux-case__img-wrap">
        <img src={data.img} alt={data.co} loading="lazy" />
        <span className="ux-read-btn">Read Case Study <UpArrow /></span>
      </div>
      <div className="ux-case__body">
        <div className="ux-case__stats">
          {data.stats.map(({ v, l }) => (
            <div key={v} className="ux-case__stat">
              <span className="ux-case__stat-num">{v}</span>
              <span className="ux-case__stat-label">{l}</span>
            </div>
          ))}
        </div>
        <p className="ux-case__headline">{data.headline}</p>
        <div className="ux-case__meta">
          <span>{data.co}</span>
          <span className="ux-dot">·</span>
          <span>{data.type}</span>
          <span className="ux-dot">·</span>
          <span>{data.date}</span>
        </div>
      </div>
    </article>
  );
}

/* ─── 8. CHALLENGES ─────────────────────────────────────── */
const CHALLENGES = [
  { n:"01/", title:"Conversion Rate optimization (CRO)",
    desc:"Systematic improvement of conversion across key product and funnel touchpoints through UX changes grounded in user behavior and data." },
  { n:"02/", title:"Experience-led revenue optimization",
    desc:"Revenue growth driven by improving user journeys, decision points, and product experience across conversion, monetization, and retention." },
  { n:"03/", title:"End-to-end product design",
    desc:"Holistic design and redesign of products from structure and flows to interaction and visual systems, built for scale and monetization." },
  { n:"04/", title:"Monetization & funnel architecture",
    desc:"Design of pricing, trials, paywalls, and funnels as a single monetization system that increases predictability and revenue efficiency." },
  { n:"05/", title:"System-level UX transformation",
    desc:"Unification of fragmented UX decisions into a coherent, scalable product experience aligned with business and growth goals." },
];

function ChallengesSection() {
  return (
    <section className="ux-section--border-top">
      <div className="ux-giant-heading-wrap">
        <h2 className="ux-giant-heading">Challenges<br/>We Solve</h2>
      </div>
      <div className="ux-challenges">
        {CHALLENGES.map(({ n, title, desc }) => (
          <div key={n} className="ux-challenge">
            <span className="ux-challenge__num">{n}</span>
            <div className="ux-challenge__content">
              <h3 className="ux-challenge__title">{title}</h3>
              <p className="ux-text-body ux-text-muted">{desc}</p>
            </div>
            <div className="ux-challenge__cta">
              <TalkBtn onDark={false} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 9. PROCESS ────────────────────────────────────────── */
const STEPS = [
  { n:"01", label:"Project Kickoff",
    desc:"Alignment on business goals, revenue priorities, constraints, and success metrics to anchor every decision in measurable outcomes." },
  { n:"02", label:"UX Strategy",
    desc:"Identification of revenue-critical journeys, friction points, and opportunities where experience changes directly impact conversion and growth." },
  { n:"03", label:"UX Execution",
    desc:"Translation of strategy into production-ready UX solutions for core flows and features that drive user behavior and monetization." },
  { n:"04", label:"Results",
    desc:"Performance validation through data, experimentation, and real usage to measure impact on conversion, retention, and revenue." },
  { n:"05", label:"Corrections",
    desc:"Continuous refinement based on post-release insights to improve funnel efficiency and commercial performance over time." },
];

function ProcessSection() {
  return (
    <section id="process" className="ux-section ux-section--pad ux-section--border-top">
      <h2 className="ux-heading-lg ux-heading-process">
        After shipping hundreds of products, there are a few key things we've learned are needed to do the best work
      </h2>
      <div className="ux-steps">
        {STEPS.map(({ n, label, desc }, i) => (
          <div key={n} className={`ux-step${i < STEPS.length-1 ? " ux-step--border-right" : ""}`}>
            <span className="ux-step__num">{n}</span>
            <p className="ux-text-body ux-step__label">{label}</p>
            <p className="ux-text-body ux-text-muted ux-step__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 10. PRICING (WORKING MODELS) ─────────────────────── */
const SPRINT_FEATURES = [
  "Revenue flow breakdown",
  "Clear bottleneck resolution",
  "Experiment-ready solutions for rapid rollout",
  "A/B ready specs (events, success metrics)",
  "Dev-handoff (Figma + logic)",
];
const MARATHON_FEATURES = [
  "Deep system-level UX and revenue solutions",
  "End-to-end funnel and monetization optimization",
  "Cross-flow alignment across acquisition, activation, and revenue",
  "Day-to-day iteration and performance tracking",
  "Scalable improvements designed for long-term growth",
];

function PricingSection() {
  return (
    <section id="pricing" className="ux-pricing">
      <div className="ux-giant-heading-wrap ux-giant-heading-wrap--dark">
        <h2 className="ux-giant-heading ux-giant-heading--dark">Working<br/>Models</h2>
      </div>
      <div className="ux-pricing__cards">
        <PricingCard
          title="Sprint"
          sub="Core flow. Fixed scope. Revenue impact. (funnel, paywall, dedicated feature)"
          duration="Duration: 2–3 weeks"
          features={SPRINT_FEATURES}
          price="Fixed price: 15,000 USD (sprint)"
        />
        <PricingCard
          title="Marathon"
          sub="System-level optimization for sustained growth. Product launch."
          duration="Duration: 6–12+ weeks"
          features={MARATHON_FEATURES}
          price="Starting from 10,000 USD / Mo"
        />
      </div>
    </section>
  );
}

function PricingCard({ title, sub, duration, features, price }: {
  title: string; sub: string; duration: string; features: string[]; price: string;
}) {
  return (
    <div className="ux-pricing-card">
      <h3 className="ux-pricing-card__title">{title}</h3>
      <p className="ux-text-body ux-mb-8">{sub}</p>
      <p className="ux-text-body ux-text-muted-dark ux-mb-32">{duration}</p>
      <div className="ux-features">
        {features.map(f => (
          <div key={f} className="ux-feature">
            <CheckIcon />
            <span className="ux-text-body">{f}</span>
          </div>
        ))}
      </div>
      <div className="ux-pricing-card__footer">
        <a href="mailto:hello@uxlab.digital" className="ux-btn ux-btn--pricing">
          Let&apos;s talk
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 11.5L11.5 1.5M11.5 1.5H3M11.5 1.5V10" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
        <span className="ux-pricing-card__price">{price}</span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
      <path d="M2.5 8L6.5 12L13.5 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── 11. GLANCE ────────────────────────────────────────── */
const GLANCE_CARDS = [
  { bg:"#5B3FD8", tc:"#fff", mc:"rgba(255,255,255,0.7)",
    title:"High-converting creator storefronts that helped Stan generate $2B+ in revenue",
    stat:"$2B+", label:"In revenue for 36 months" },
  { bg:"#111", tc:"#fff", mc:"rgba(255,255,255,0.7)",
    title:"Scaling global ecommerce experience",
    stat:"+23%", label:"add-to-bag interaction uplift" },
  { bg:"#F0EDE8", tc:"#000", mc:"rgba(0,0,0,0.7)",
    title:"Revenue-driven product execution through high-impact user experience",
    stat:"+56%", label:"average conversions uplift" },
  { bg:"#1A1A1A", tc:"#fff", mc:"rgba(255,255,255,0.7)",
    title:"Launching a category-defining product",
    stat:"8 weeks", label:"go to market" },
  { bg:"#2D1B69", tc:"#fff", mc:"rgba(255,255,255,0.7)",
    title:"Developing scalable growth funnels for web3 products",
    stat:"230%", label:"avarage conversion uplift" },
  { bg:"#E8E4DF", tc:"#000", mc:"rgba(0,0,0,0.7)",
    title:"A stress-free stays tailored to your needs",
    stat:"2.8x", label:"Global users reached" },
  { bg:"#E8E4DF", tc:"#000", mc:"rgba(0,0,0,0.7)",
    title:"A stress-free stays tailored to your needs",
    stat:"2.8x", label:"Global users reached" },
];

function GlanceSection() {
  return (
    <section className="ux-glance">
      <div className="ux-glance__header">
        <span className="ux-text-body ux-text-black">UXLAB at a Glance</span>
        <a href="mailto:hello@uxlab.digital" className="ux-text-body ux-text-black ux-link-plain">hello@uxlab.digital</a>
      </div>
      <div className="ux-glance__row">
        {GLANCE_CARDS.map((c, i) => (
          <div key={i} className="ux-glance-card" style={{ backgroundColor: c.bg }}>
            <p className="ux-glance-card__title" style={{ color: c.tc }}>{c.title}</p>
            <div>
              <div className="ux-glance-card__stat" style={{ color: c.tc }}>{c.stat}</div>
              <div className="ux-glance-card__label" style={{ color: c.mc }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 12. FOOTER ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="ux-footer">
      <div className="ux-footer__headline-wrap">
        <h2 className="ux-footer__headline">Do it once.<br/>Do it right.</h2>
      </div>
      <div className="ux-footer__contact">
        <p className="ux-text-body ux-text-muted">
          Contact us:{" "}
          <a href="mailto:hello@uxlab.digital" className="ux-link-white">hello@uxlab.digital</a>
        </p>
      </div>
      <div className="ux-footer__bottom">
        <span className="ux-footer__copy">Terms of use ©16—26</span>
        <nav className="ux-footer__nav">
          {[
            { l:"Solutions", h:"#solutions" },
            { l:"Cases", h:"#cases" },
            { l:"About", h:"#" },
            { l:"Instagram", h:"#" },
            { l:"Linkedin", h:"#" },
            { l:"X", h:"#" },
          ].map(({ l, h }) => (
            <a key={l} href={h} className="ux-footer__nav-link">{l}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
