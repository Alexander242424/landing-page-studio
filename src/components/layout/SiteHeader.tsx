import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ArrowCue, ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { openLeadChat } from "@/lib/askChat";
import { SOLUTIONS } from "@/lib/solutions";
import {
  solutionHasLanding,
  solutionPath,
} from "@/lib/servicePages";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Case studies", href: "/work" },
  { label: "Solutions", href: "#solutions" },
  { label: "Process", href: "#process" },
] as const;

type NavHref = (typeof NAV_ITEMS)[number]["href"];

function isPathHref(href: string): href is `/${string}` {
  return href.startsWith("/");
}

type SiteHeaderProps = {
  /** `home` = hash scroll-spy; `site` = navigate to home sections */
  variant?: "home" | "site";
};

/**
 * Fixed mix-blend header: scroll-spy nav and mobile burger.
 */
export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const [activeHref, setActiveHref] = useState<NavHref | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileTlRef = useRef<gsap.core.Timeline | null>(null);
  const { lenis } = useSmoothScroll();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = variant === "home" || pathname === "/";

  useEffect(() => {
    return () => {
      mobileTlRef.current?.kill();
    };
  }, []);

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
    openLeadChat();
  };

  const onSolutionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    event.preventDefault();
    setMobileOpen(false);
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
                  onClick={() => setMobileOpen((open) => !open)}
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
                    return (
                      <li key={item.href} className="rj-header__menu-item">
                        <a
                          href={hrefAttr}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "rj-link-active",
                            isActive && "rj-header__link--active",
                          )}
                          onClick={(event) => onNavClick(event, item.href)}
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
