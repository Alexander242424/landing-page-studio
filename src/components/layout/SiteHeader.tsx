import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ArrowCue, ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { ARTICLES } from "@/lib/articles";
import { openLeadChat } from "@/lib/askChat";
import {
  articleCatalogItems,
  useArticleCatalog,
} from "@/hooks/useArticleCatalog";
import { megaArticles } from "@/lib/articleCatalog";
import { SOLUTIONS } from "@/lib/solutions";
import {
  solutionHasLanding,
  solutionPath,
} from "@/lib/servicePages";
import { cn } from "@/lib/utils";

type MegaKind = "solutions" | "resources";

/** Keep panel mounted through CSS close (opacity + slight y). */
const MEGA_EXIT_MS = 320;

const NAV_ITEMS = [
  { label: "Case studies", href: "/work" },
  { label: "Solutions", href: "#solutions", mega: "solutions" as const },
  { label: "Resources", href: "/resources", mega: "resources" as const },
] as const;

type NavHref = (typeof NAV_ITEMS)[number]["href"];
type NavItem = (typeof NAV_ITEMS)[number];

function isPathHref(href: string): href is `/${string}` {
  return href.startsWith("/");
}

function navMega(item: NavItem): MegaKind | null {
  return "mega" in item ? item.mega : null;
}

const MEGA_ARTICLES_FALLBACK = ARTICLES.slice(0, 4);

type SiteHeaderProps = {
  /** `home` = hash scroll-spy; `site` = navigate to home sections */
  variant?: "home" | "site";
};

/**
 * Fixed mix-blend header: scroll-spy nav, desktop megas (Solutions / Resources), mobile burger.
 */
export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const articleCatalog = useArticleCatalog();
  const fromCatalog = megaArticles(articleCatalogItems(articleCatalog.data), 4);
  const megaResourceArticles =
    fromCatalog.length > 0 ? fromCatalog : MEGA_ARTICLES_FALLBACK;
  const [activeHref, setActiveHref] = useState<NavHref | null>(null);
  const [megaKind, setMegaKind] = useState<MegaKind | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTlRef = useRef<gsap.core.Timeline | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileTlRef = useRef<gsap.core.Timeline | null>(null);
  const megaId = useId();
  const { lenis } = useSmoothScroll();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = variant === "home" || pathname === "/";

  const clearMegaClose = () => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  };

  const openMega = (kind: MegaKind) => {
    clearMegaClose();
    setMegaKind(kind);
    setMegaOpen(true);
  };

  const closeMega = () => {
    clearMegaClose();
    setMegaOpen(false);
  };

  const scheduleMegaClose = () => {
    clearMegaClose();
    megaCloseTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  // Unmount panel content after the close transition so it can ease out.
  useEffect(() => {
    if (megaOpen || !megaKind) return;
    const id = window.setTimeout(() => setMegaKind(null), MEGA_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [megaOpen, megaKind]);

  useEffect(() => {
    return () => {
      clearMegaClose();
      megaTlRef.current?.kill();
      mobileTlRef.current?.kill();
    };
  }, []);

  // Desktop mega: divider draw (solutions) + staggered entrance on open.
  useLayoutEffect(() => {
    const root = megaRef.current;
    if (!root) return;

    megaTlRef.current?.kill();
    megaTlRef.current = null;

    const enters = root.querySelectorAll<HTMLElement>(".rj-mega__enter");
    const solutionCards = root.querySelectorAll<HTMLElement>(".rj-mega__card");
    const rulesV = root.querySelectorAll<HTMLElement>(".rj-mega__rule--v");
    const ruleH = root.querySelector<HTMLElement>(".rj-mega__rule--h");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearCardParts = () => {
      solutionCards.forEach((card) => {
        const parts = card.querySelectorAll<HTMLElement>(
          ".rj-mega__card-title, .rj-mega__card-blurb, .rj-mega__card-arrow",
        );
        gsap.set(parts, { clearProps: "opacity,transform" });
      });
      gsap.set(enters, { clearProps: "opacity,transform" });
    };

    if (!megaKind) {
      gsap.set(rulesV, { scaleY: 0 });
      if (ruleH) gsap.set(ruleH, { scaleX: 0 });
      clearCardParts();
      return;
    }

    if (reduced) {
      gsap.set(rulesV, { scaleY: 1 });
      if (ruleH) gsap.set(ruleH, { scaleX: 1 });
      clearCardParts();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: clearCardParts,
    });
    megaTlRef.current = tl;

    if (megaKind === "solutions") {
      gsap.set(rulesV, { scaleY: 0, transformOrigin: "50% 0%" });
      if (ruleH) gsap.set(ruleH, { scaleX: 0, transformOrigin: "0% 50%" });

      tl.to(
        rulesV,
        {
          scaleY: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.02,
      );
      if (ruleH) {
        tl.to(
          ruleH,
          {
            scaleX: 1,
            duration: 0.75,
            ease: "power3.out",
          },
          0.1,
        );
      }

      solutionCards.forEach((card, index) => {
        const title = card.querySelector<HTMLElement>(".rj-mega__card-title");
        const blurb = card.querySelector<HTMLElement>(".rj-mega__card-blurb");
        const arrow = card.querySelector<HTMLElement>(".rj-mega__card-arrow");
        const parts = [title, blurb, arrow].filter(
          (el): el is HTMLElement => Boolean(el),
        );
        if (parts.length === 0) return;

        gsap.set(parts, { opacity: 0, y: 16 });
        tl.to(
          parts,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.05,
          },
          0.18 + index * 0.045,
        );
      });
    } else {
      gsap.set(enters, { opacity: 0, y: 18 });
      tl.to(
        enters,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.045,
        },
        0.06,
      );
    }

    return () => {
      tl.kill();
    };
  }, [megaKind]);

  useEffect(() => {
    const root = mobileMenuRef.current;
    if (!root) return;

    mobileTlRef.current?.kill();
    mobileTlRef.current = null;

    const panel = root.querySelector<HTMLElement>(".rj-mobile-menu__inner");
    const links = root.querySelectorAll<HTMLElement>(".rj-mobile-menu__link");
    const solutionsLabel = root.querySelector<HTMLElement>(
      ".rj-mobile-menu__solutions-label",
    );
    const solutionRows = root.querySelectorAll<HTMLElement>(
      ".rj-mobile-menu__solution",
    );
    const rules = root.querySelectorAll<HTMLElement>(".rj-mobile-menu__rule");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearMotion = () => {
      if (panel) gsap.set(panel, { clearProps: "transform" });
      gsap.set(links, { clearProps: "opacity,transform" });
      if (solutionsLabel) {
        gsap.set(solutionsLabel, { clearProps: "opacity,transform" });
      }
      gsap.set(solutionRows, { clearProps: "opacity,transform" });
      gsap.set(rules, { clearProps: "transform" });
    };

    if (!mobileOpen) {
      clearMotion();
      return;
    }

    if (reduced) {
      clearMotion();
      gsap.set(rules, { scaleX: 1 });
      return;
    }

    if (panel) {
      // Overshoot slightly, then settle into the inset rounded frame.
      gsap.set(panel, { scale: 1.045, y: -10, transformOrigin: "50% 0%" });
    }
    gsap.set(links, { opacity: 0, y: 28 });
    if (solutionsLabel) gsap.set(solutionsLabel, { opacity: 0, y: 16 });
    gsap.set(solutionRows, { opacity: 0, y: 18 });
    gsap.set(rules, { scaleX: 0, transformOrigin: "left center" });

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        // Hand opacity back to CSS (active vs muted links).
        gsap.set(links, { clearProps: "opacity" });
        if (panel) gsap.set(panel, { clearProps: "transform" });
      },
    });
    mobileTlRef.current = tl;

    if (panel) {
      tl.to(
        panel,
        {
          scale: 0.985,
          y: 4,
          duration: 0.32,
          ease: "power2.out",
        },
        0,
      );
      tl.to(
        panel,
        {
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: "expo.out",
        },
        0.28,
      );
    }

    // Top nav first…
    tl.to(
      links,
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
      },
      0.16,
    );

    // …then Solutions block (label → rows + rules).
    const solutionsStart = 0.16 + links.length * 0.08 + 0.12;

    if (solutionsLabel) {
      tl.to(
        solutionsLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        },
        solutionsStart,
      );
    }

    tl.to(
      solutionRows,
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
      },
      solutionsStart + 0.08,
    );

    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.55,
        stagger: 0.05,
        ease: "power3.out",
      },
      solutionsStart + 0.06,
    );

    return () => {
      tl.kill();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMega();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  useEffect(() => {
    if (!isHome) {
      setActiveHref(null);
      return;
    }

    const sections = NAV_ITEMS.filter((item) => !isPathHref(item.href))
      .map((item) => ({
        href: item.href,
        el: document.getElementById(item.href.slice(1)),
      }))
      .filter((item): item is { href: NavHref; el: HTMLElement } => !!item.el)
      .sort((a, b) => a.el.offsetTop - b.el.offsetTop);

    if (!sections.length) return;

    const syncActive = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const headerRem = parseFloat(
        rootStyles.getPropertyValue("--rj-header-height"),
      );
      const rootPx = parseFloat(rootStyles.fontSize) || 10;
      const marker =
        (Number.isFinite(headerRem) ? headerRem : 6.2) * rootPx + 24;

      // No hash section active in the hero — only once a section crosses the header.
      let next: NavHref | null = null;
      for (const section of sections) {
        if (section.el.getBoundingClientRect().top <= marker) {
          next = section.href;
        }
      }

      setActiveHref((prev) => (prev === next ? prev : next));
    };

    syncActive();

    if (lenis) {
      lenis.on("scroll", syncActive);
      return () => {
        lenis.off("scroll", syncActive);
      };
    }

    window.addEventListener("scroll", syncActive, { passive: true });
    return () => window.removeEventListener("scroll", syncActive);
  }, [lenis, isHome]);

  const scrollToHref = (href: string) => {
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToHash = (hash: string) => {
    closeMega();
    setMobileOpen(false);
    if (isHome) {
      scrollToHref(`#${hash}`);
      return;
    }
    void navigate({ to: "/", hash, viewTransition: true });
  };

  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, href: NavHref) => {
    event.preventDefault();
    setMobileOpen(false);
    closeMega();
    if (isPathHref(href)) {
      void navigate({ to: href, viewTransition: true });
      return;
    }
    if (isHome) {
      setActiveHref(href);
      scrollToHref(href);
      return;
    }
    void navigate({ to: "/", hash: href.slice(1), viewTransition: true });
  };

  const onConnectClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMobileOpen(false);
    closeMega();
    openLeadChat();
  };

  const onSolutionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    event.preventDefault();
    setMobileOpen(false);
    closeMega();
    const item = SOLUTIONS.find((entry) => entry.slug === slug);
    if (item && solutionHasLanding(slug)) {
      void navigate({
        to: "/solutions/$slug",
        params: { slug },
        viewTransition: true,
      });
      return;
    }
    goToHash(`solution-${slug}`);
  };

  const logo = isHome ? (
    <Logo
      className="rj-header__logo-link"
      markClassName="rj-logo__mark--header"
    />
  ) : (
    <Link
      to="/"
      viewTransition
      className="rj-header__logo-link rj-logo"
      aria-label="UXLAB"
      onClick={() => setMobileOpen(false)}
    >
      <span
        className="rj-logo__mark rj-logo__mark--header"
        role="img"
        aria-hidden="true"
      />
    </Link>
  );

  return (
    <div className="rj-header-root">
      <div
        className={cn("rj-header", mobileOpen && "rj-header--menu-open")}
      >
        <header className="rj-header__shell">
          <div className="rj-header__outer">
            <div className="rj-header__inner">
              <div className="rj-header__brand">
                <button
                  type="button"
                  className={cn(
                    "rj-header__burger",
                    mobileOpen && "is-open",
                  )}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  aria-controls="rj-mobile-menu"
                  onClick={() => {
                    closeMega();
                    setMobileOpen((open) => !open);
                  }}
                >
                  <span className="rj-header__burger-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
                <div className="rj-header__logo">{logo}</div>
              </div>

              <nav className="rj-header__nav" aria-label="Primary">
                <ul className="rj-header__menu">
                  {NAV_ITEMS.map((item) => {
                    const pathItem = isPathHref(item.href);
                    const isActive = pathItem
                      ? pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      : activeHref === item.href;
                    const hrefAttr = pathItem
                      ? item.href
                      : isHome
                        ? item.href
                        : `/${item.href}`;
                    const kind = navMega(item);
                    const megaActive = kind !== null && megaOpen && megaKind === kind;

                    return (
                      <li
                        key={item.href}
                        className={cn(
                          "rj-header__menu-item",
                          kind && "rj-header__menu-item--mega",
                        )}
                        onMouseEnter={
                          kind ? () => openMega(kind) : undefined
                        }
                        onMouseLeave={
                          kind ? scheduleMegaClose : undefined
                        }
                      >
                        <a
                          href={hrefAttr}
                          aria-current={isActive ? "true" : undefined}
                          aria-expanded={
                            kind ? megaActive : undefined
                          }
                          aria-controls={kind ? megaId : undefined}
                          className={cn(
                            "rj-link-active",
                            isActive && "rj-header__link--active",
                            megaActive && "rj-header__link--mega-open",
                          )}
                          onClick={(event) => onNavClick(event, item.href)}
                          onFocus={
                            kind ? () => openMega(kind) : undefined
                          }
                        >
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="rj-header__book">
                <ArrowLink
                  href="#contact"
                  className="rj-link-active rj-header__cta"
                  onClick={onConnectClick}
                >
                  Let&apos;s talk
                </ArrowLink>
              </div>

              <div className="rj-header__menu-toggle">
                <ArrowLink
                  href="#contact"
                  className="rj-link-active rj-header__cta rj-header__cta--mobile"
                  onClick={onConnectClick}
                >
                  Let&apos;s talk
                </ArrowLink>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div
        id={megaId}
        ref={megaRef}
        className={cn(
          "rj-mega",
          megaOpen && "is-open",
          megaKind && `rj-mega--${megaKind}`,
        )}
        role="region"
        aria-hidden={!megaOpen}
        inert={!megaOpen}
        aria-label={megaKind === "resources" ? "Resources" : "Solutions"}
        onMouseEnter={
          megaOpen && megaKind ? () => openMega(megaKind) : undefined
        }
        onMouseLeave={scheduleMegaClose}
      >
        <div className="rj-mega__panel">
          {megaKind === "resources" ? (
            <>
              <ul className="rj-mega-resources">
                {megaResourceArticles.map((article) => (
                  <li
                    key={article.slug}
                    className="rj-mega-resources__item rj-mega__enter"
                  >
                    <Link
                      to="/resources/$slug"
                      params={{ slug: article.slug }}
                      viewTransition
                      className="rj-mega-resources__card"
                      onClick={closeMega}
                    >
                      <div className="rj-mega-resources__media">
                        <img
                          src={article.image}
                          alt=""
                          width={640}
                          height={400}
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                      <span className="rj-mega-resources__category">
                        {article.category}
                      </span>
                      <h3 className="rj-mega-resources__title">
                        <span className="rj-mega-resources__title-text">
                          {article.title}
                        </span>
                      </h3>
                      <p className="rj-mega-resources__meta">
                        {article.date} — {article.readTime}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="rj-mega__footer rj-mega__enter">
                <Link
                  to="/resources"
                  viewTransition
                  className="rj-mega__footer-link"
                  onClick={closeMega}
                >
                  <ArrowCue>All resources</ArrowCue>
                </Link>
              </div>
            </>
          ) : null}

          {megaKind === "solutions" ? (
            <>
              <ul className="rj-mega__grid">
                {SOLUTIONS.map((item) => (
                  <li key={item.slug} className="rj-mega__item">
                    <a
                      href={
                        solutionHasLanding(item.slug)
                          ? solutionPath(item)
                          : `#solution-${item.slug}`
                      }
                      className="rj-mega__card"
                      onClick={(event) => onSolutionClick(event, item.slug)}
                    >
                      <span className="rj-mega__card-copy">
                        <span className="rj-mega__card-title">{item.title}</span>
                        <span className="rj-mega__card-blurb">{item.blurb}</span>
                      </span>
                      <ArrowCue className="rj-mega__card-arrow" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="rj-mega__rules" aria-hidden="true">
                <span className="rj-mega__rule rj-mega__rule--v rj-mega__rule--v1" />
                <span className="rj-mega__rule rj-mega__rule--v rj-mega__rule--v2" />
                <span className="rj-mega__rule rj-mega__rule--h" />
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div
        id="rj-mobile-menu"
        ref={mobileMenuRef}
        className={cn("rj-mobile-menu", mobileOpen && "rj-mobile-menu--open")}
        aria-hidden={!mobileOpen}
      >
        <div className="rj-mobile-menu__inner" data-lenis-prevent>
          <nav className="rj-mobile-menu__links" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const pathItem = isPathHref(item.href);
              const isActive = pathItem
                ? pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                : activeHref === item.href;
              const hrefAttr = pathItem
                ? item.href
                : isHome
                  ? item.href
                  : `/${item.href}`;

              return (
                <a
                  key={item.href}
                  href={hrefAttr}
                  className={cn(
                    "rj-mobile-menu__link",
                    isActive && "rj-mobile-menu__link--active",
                  )}
                  onClick={(event) => onNavClick(event, item.href)}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="rj-mobile-menu__solutions">
            <p className="rj-mobile-menu__solutions-label">Solutions</p>
            <ul className="rj-mobile-menu__solutions-list">
              {SOLUTIONS.map((item, index) => (
                <li key={item.slug} className="rj-mobile-menu__solution-item">
                  {index === 0 ? (
                    <span className="rj-mobile-menu__rule" aria-hidden="true" />
                  ) : null}
                  <a
                    href={
                      solutionHasLanding(item.slug)
                        ? solutionPath(item)
                        : `#solution-${item.slug}`
                    }
                    className="rj-mobile-menu__solution"
                    onClick={(event) => onSolutionClick(event, item.slug)}
                  >
                    <span>{item.title}</span>
                    <ArrowCue className="rj-link-active" />
                  </a>
                  <span className="rj-mobile-menu__rule" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
