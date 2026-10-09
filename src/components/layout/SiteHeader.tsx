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
import { ArrowCue, ArrowIcon, ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { openContactChat, openLeadChat } from "@/lib/askChat";
import { SOLUTIONS } from "@/lib/solutions";
import {
  solutionHasLanding,
  solutionPath,
} from "@/lib/servicePages";
import { cn } from "@/lib/utils";

type MegaKind = "solutions";

/** Keep panel mounted through CSS close (opacity + slight y). */
const MEGA_EXIT_MS = 320;

const NAV_ITEMS = [
  { label: "Solutions", href: "#solutions", mega: "solutions" as const },
  { label: "Workflows", href: "#process" },
  { label: "Toolverse", href: "#toolverse" },
  { label: "Customers", href: "#customers" },
] as const;

type NavHref = (typeof NAV_ITEMS)[number]["href"];
type NavItem = (typeof NAV_ITEMS)[number];

function isPathHref(href: string): href is `/${string}` {
  return href.startsWith("/");
}

function navMega(item: NavItem): MegaKind | null {
  return "mega" in item ? item.mega : null;
}

type SiteHeaderProps = {
  /** `home` = hash scroll-spy; `site` = navigate to home sections */
  variant?: "home" | "site";
};

/**
 * Fixed mix-blend header: scroll-spy nav, Solutions desktop mega, mobile burger.
 */
export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const [activeHref, setActiveHref] = useState<NavHref | null>(null);
  const [megaKind, setMegaKind] = useState<MegaKind | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
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

  useLayoutEffect(() => {
    const root = megaRef.current;
    if (!root) return;

    megaTlRef.current?.kill();
    megaTlRef.current = null;

    const rows = root.querySelectorAll<HTMLElement>(".rj-mega__row");
    const banner = root.querySelector<HTMLElement>(".rj-mega__banner");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearMotion = () => {
      rows.forEach((row) => {
        const parts = row.querySelectorAll<HTMLElement>(
          ".rj-mega__row-title, .rj-mega__row-blurb",
        );
        gsap.set(parts, { clearProps: "opacity,transform" });
      });
      if (banner) gsap.set(banner, { clearProps: "opacity,transform" });
    };

    if (!megaKind) {
      clearMotion();
      return;
    }

    if (reduced) {
      clearMotion();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: clearMotion,
    });
    megaTlRef.current = tl;

    if (banner) gsap.set(banner, { opacity: 0, y: 12 });

    if (banner) {
      tl.to(
        banner,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
        },
        0.12,
      );
    }

    rows.forEach((row, index) => {
      const title = row.querySelector<HTMLElement>(".rj-mega__row-title");
      const blurb = row.querySelector<HTMLElement>(".rj-mega__row-blurb");
      const parts = [title, blurb].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      if (parts.length === 0) return;

      gsap.set(parts, { opacity: 0, y: 12 });
      tl.to(
        parts,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.04,
        },
        0.14 + index * 0.045,
      );
    });

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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearMotion = () => {
      if (panel) gsap.set(panel, { clearProps: "transform" });
      gsap.set(links, { clearProps: "opacity,transform" });
    };

    if (!mobileOpen) {
      clearMotion();
      return;
    }

    if (reduced) {
      clearMotion();
      return;
    }

    if (panel) {
      gsap.set(panel, { scale: 1.045, y: -10, transformOrigin: "50% 0%" });
    }
    gsap.set(links, { opacity: 0, y: 28 });

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
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

    return () => {
      tl.kill();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      setMobileSolutionsOpen(false);
      return;
    }
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

  const onStrategyCallClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMobileOpen(false);
    closeMega();
    openContactChat({ source: "header_strategy_call" });
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
                    const megaActive =
                      kind !== null && megaOpen && megaKind === kind;

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
                          aria-expanded={kind ? megaActive : undefined}
                          aria-controls={kind ? megaId : undefined}
                          className={cn(
                            "rj-link-active",
                            isActive && "rj-header__link--active",
                            megaActive && "rj-header__link--mega-open",
                          )}
                          onClick={(event) => onNavClick(event, item.href)}
                          onFocus={kind ? () => openMega(kind) : undefined}
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
        aria-label="Solutions"
        onMouseEnter={
          megaOpen && megaKind ? () => openMega(megaKind) : undefined
        }
        onMouseLeave={scheduleMegaClose}
      >
        <div className="rj-mega__panel">
          {megaKind === "solutions" ? (
            <div className="rj-mega__layout">
              <div className="rj-mega__list-col">
                <ul className="rj-mega__list">
                  {SOLUTIONS.map((item) => (
                    <li key={item.slug} className="rj-mega__item">
                      <a
                        href={
                          solutionHasLanding(item.slug)
                            ? solutionPath(item)
                            : `#solution-${item.slug}`
                        }
                        className="rj-mega__row"
                        onClick={(event) => onSolutionClick(event, item.slug)}
                        onFocus={() => openMega("solutions")}
                      >
                        <span className="rj-mega__row-copy">
                          <span className="rj-mega__row-title">
                            <span className="rj-mega__row-title-text">
                              {item.title}
                            </span>
                            <span
                              className="rj-mega__row-arrow"
                              aria-hidden="true"
                            >
                              <ArrowIcon />
                            </span>
                          </span>
                          <span className="rj-mega__row-blurb">
                            {item.blurb}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#contact"
                className="rj-mega__banner"
                onClick={onStrategyCallClick}
                onFocus={() => openMega("solutions")}
              >
                <span className="rj-mega__banner-copy">
                  <span className="rj-mega__banner-title">
                    Get a 30-min strategy call
                  </span>
                  <span className="rj-mega__banner-blurb">
                    We&apos;ll find revenue leaks on the traffic you already
                    have — conversion, pricing, and the journeys that stall.
                  </span>
                </span>
                <ArrowCue className="rj-link-active rj-mega__banner-arrow rj-hero__cta rj-hero__cta--talk">
                  Let&apos;s talk
                </ArrowCue>
              </a>
            </div>
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
              const isSolutions = navMega(item) === "solutions";

              if (isSolutions) {
                return (
                  <div key={item.href} className="rj-mobile-menu__group">
                    <button
                      type="button"
                      className={cn(
                        "rj-mobile-menu__link",
                        mobileSolutionsOpen && "rj-mobile-menu__link--active",
                      )}
                      aria-expanded={mobileSolutionsOpen}
                      aria-controls="rj-mobile-solutions"
                      onClick={() =>
                        setMobileSolutionsOpen((open) => !open)
                      }
                    >
                      {item.label}
                    </button>
                    <div
                      id="rj-mobile-solutions"
                      className={cn(
                        "rj-mobile-menu__accordion",
                        mobileSolutionsOpen &&
                          "rj-mobile-menu__accordion--open",
                      )}
                    >
                      <ul className="rj-mobile-menu__solutions-list">
                        {SOLUTIONS.map((solution) => (
                          <li
                            key={solution.slug}
                            className="rj-mobile-menu__solution-item"
                          >
                            <a
                              href={
                                solutionHasLanding(solution.slug)
                                  ? solutionPath(solution)
                                  : `#solution-${solution.slug}`
                              }
                              className="rj-mobile-menu__solution"
                              onClick={(event) =>
                                onSolutionClick(event, solution.slug)
                              }
                            >
                              <span>{solution.title}</span>
                              <ArrowCue className="rj-link-active" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

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
        </div>
      </div>
    </div>
  );
}
