import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTextReveal } from "@/lib/textReveal";

gsap.registerPlugin(ScrollTrigger);
import { CasePopup } from "@/components/case/CasePopup";
import { ArrowCue, ArrowLink } from "@/components/ui/ArrowLink";
import {
  customerLogoGrid,
  logoCaseSlug,
  type ClientLogo,
} from "@/lib/clientLogos";
import { DEFAULT_HOME_INTRO } from "@/components/home/HomeIntro";
import { casePath, getCase, type CaseStudy } from "@/lib/cases";

const SECTION_TAGLINE = DEFAULT_HOME_INTRO.taglineBefore;

const LOGO_COLUMNS_DESKTOP = 4;
const FEATURED_SLUG = "nespresso";
const FEATURED_HEADLINE =
  "How Nespresso Generated a 9x Revenue Lift by Boosting Conversions";

function LogoCell({
  logo,
  onOpenCase,
}: {
  logo: ClientLogo;
  onOpenCase: (slug: string) => void;
}) {
  // Prefer a mapped case; otherwise open the featured study so every cell pops up.
  const slug = logoCaseSlug(logo.id) ?? FEATURED_SLUG;

  return (
    <a
      href={casePath(slug)}
      className="rj-customers__logo-cell"
      aria-label={`${logo.alt} case study`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onOpenCase(slug);
      }}
    >
      <img
        className="rj-customers__logo-img"
        src={logo.src}
        alt=""
        width={160}
        height={48}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <ArrowCue className="rj-customers__logo-arrow" />
    </a>
  );
}

function TestimonialCard({
  featured,
  onOpenCase,
}: {
  featured: CaseStudy;
  onOpenCase: (slug: string) => void;
}) {
  const stats = featured.heroStats.slice(0, 2);

  return (
    <article className="rj-customers__card">
      <div className="rj-customers__card-brand" aria-hidden="true">
        <img
          src={featured.logo}
          alt=""
          width={96}
          height={32}
          className="rj-customers__card-brand-logo"
        />
      </div>

      <h2 className="rj-customers__card-title">{FEATURED_HEADLINE}</h2>

      <div className="rj-customers__metrics">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index === 2
                ? "rj-customers__metric rj-customers__metric--wide"
                : "rj-customers__metric"
            }
          >
            <p className="rj-customers__metric-value">{stat.value}</p>
            <p className="rj-customers__metric-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rj-customers__card-cta">
        <ArrowLink
          href={casePath(featured.slug)}
          className="rj-link-active rj-customers__study-cta"
          onClick={(event) => {
            event.preventDefault();
            onOpenCase(featured.slug);
          }}
        >
          See Case Study
        </ArrowLink>
      </div>
    </article>
  );
}

export function CustomersSection() {
  const rootRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const logos = customerLogoGrid();
  const featured = getCase(FEATURED_SLUG);
  const [casePopupSlug, setCasePopupSlug] = useState<string | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const tagline = taglineRef.current;
    const lead = root?.querySelector<HTMLElement>(".rj-customers__lead");
    const inner = root?.querySelector<HTMLElement>(".rj-customers__inner");
    const card = root?.querySelector<HTMLElement>(".rj-customers__card");
    if (!root || !tagline || !lead) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup: (() => void) | undefined;

    const ctx = gsap.context(() => {
      cleanup = createTextReveal(tagline, {
        trigger: lead,
        start: "top 85%",
        animateLinkScale: true,
        duration: 1.6,
        wordsStagger: 0.014,
      });

      if (!inner || !card) return;

      const bits = card.querySelectorAll<HTMLElement>(
        ".rj-customers__card-brand, .rj-customers__card-title, .rj-customers__metrics, .rj-customers__card-cta",
      );
      const cells = inner.querySelectorAll<HTMLElement>(".rj-customers__logo-cell");

      const reveal = () => {
        root.classList.add("rj-customers--revealed");
      };

      if (reduced) {
        gsap.set([card, ...bits, ...cells], {
          clearProps: "opacity,visibility,transform",
        });
        reveal();
        return;
      }

      gsap.set(card, { autoAlpha: 0, y: 36, scale: 0.97 });
      gsap.set(bits, { autoAlpha: 0, y: 18 });
      if (cells.length) gsap.set(cells, { autoAlpha: 0, y: 14 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: {
          trigger: inner,
          start: "top 82%",
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: reveal,
      });

      tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1 }, 0);
      tl.to(
        bits,
        { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1 },
        0.22,
      );
      if (cells.length) {
        tl.to(
          cells,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: { each: 0.035, from: "start" },
            ease: "power3.out",
          },
          0.28,
        );
      }
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, []);

  if (!featured) return null;

  return (
    <section
      ref={rootRef}
      className="rj-customers theme-dark"
      id="customers"
      aria-label="Customers"
    >
      <div className="rj-customers__lead">
        <div className="rj-intro__tagline-inner">
          <div className="rj-intro__space" aria-hidden="true" />
          <div className="rj-intro__content">
            <p
              ref={taglineRef}
              className="rj-customers__tagline"
              id="about"
            >
              {SECTION_TAGLINE}
            </p>
          </div>
        </div>
      </div>
      <div className="rj-customers__inner">
        <div className="rj-customers__card-wrap">
          <TestimonialCard
            featured={featured}
            onOpenCase={(slug) => setCasePopupSlug(slug)}
          />
        </div>

        <div className="rj-customers__logos">
          <ul
            className="rj-customers__logo-table"
            style={
              {
                "--rj-customers-logo-cols": LOGO_COLUMNS_DESKTOP,
              } as CSSProperties & { "--rj-customers-logo-cols": number }
            }
            aria-label="Clients and partners"
          >
            {logos.map((logo) => (
              <li key={logo.id} className="rj-customers__logo-item">
                <LogoCell
                  logo={logo}
                  onOpenCase={(slug) => setCasePopupSlug(slug)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CasePopup
        slug={casePopupSlug}
        onClose={() => setCasePopupSlug(null)}
      />
    </section>
  );
}
