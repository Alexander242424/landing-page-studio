import { useEffect, useState, type MouseEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { openLeadChat } from "@/lib/askChat";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Work", href: "#glance" },
  { label: "About", href: "#about" },
  { label: "Solutions", href: "#solutions" },
] as const;

type NavHref = (typeof NAV_ITEMS)[number]["href"];

/**
 * Fixed mix-blend header: scroll-spy nav, Lenis anchors, Let's talk CTA.
 */
export function SiteHeader() {
  const [activeHref, setActiveHref] = useState<NavHref>("#hero");
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => ({
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

      let next: NavHref = sections[0].href;
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
  }, [lenis]);

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

  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, href: NavHref) => {
    event.preventDefault();
    setActiveHref(href);
    scrollToHref(href);
  };

  const onConnectClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openLeadChat();
  };

  return (
    <div className="rj-header">
      <header className="rj-header__shell">
        <div className="rj-header__outer">
          <div className="rj-header__inner">
            <div className="rj-header__logo">
              <Logo
                className="rj-header__logo-link"
                markClassName="rj-logo__mark--header"
              />
            </div>

            <nav className="rj-header__nav" aria-label="Primary">
              <ul className="rj-header__menu">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <li key={item.href} className="rj-header__menu-item">
                      <a
                        href={item.href}
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
  );
}
