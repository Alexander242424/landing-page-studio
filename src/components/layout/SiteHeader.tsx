import { useEffect, useId, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Pixel-matched Rejouice header: fixed mix-blend difference bar,
 * 12-col grid at lg, link-active underline hover, Let's talk arrow CTA,
 * and mobile Menu/Close panel.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { stop, start } = useSmoothScroll();
  const menuId = useId();

  useEffect(() => {
    if (menuOpen) {
      stop();
      document.documentElement.classList.add("rj-menu-open");
    } else {
      start();
      document.documentElement.classList.remove("rj-menu-open");
    }
    return () => {
      start();
      document.documentElement.classList.remove("rj-menu-open");
    };
  }, [menuOpen, stop, start]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="rj-header">
        <header className="rj-header__shell">
          <div className="rj-header__outer">
            <div className="rj-header__inner">
              <div className="rj-header__logo">
                <Logo className="rj-header__logo-link" markClassName="rj-logo__mark--header" />
              </div>

              <nav className="rj-header__nav" aria-label="Primary">
                <ul className="rj-header__menu">
                  {NAV_ITEMS.map((item, index) => (
                    <li key={item.href} className="rj-header__menu-item">
                      <a
                        href={item.href}
                        className={cn(
                          "rj-link-active",
                          index === 0 && "rj-header__link--active",
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rj-header__book">
                <ArrowLink href="#contact" className="rj-link-active rj-header__cta">
                  Let&apos;s talk
                </ArrowLink>
              </div>

              <div className="rj-header__menu-toggle">
                <button
                  type="button"
                  className="rj-header__cta-menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span
                    className={cn(
                      "rj-header__menu-label",
                      menuOpen ? "rj-header__menu-label--hidden" : undefined,
                    )}
                  >
                    Menu
                  </span>
                  <span
                    className={cn(
                      "rj-header__menu-label rj-header__menu-label--close",
                      menuOpen ? undefined : "rj-header__menu-label--hidden",
                    )}
                  >
                    Close
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div
        id={menuId}
        className={cn("rj-mobile-menu", menuOpen && "rj-mobile-menu--open")}
        aria-hidden={!menuOpen}
      >
        <div className="rj-mobile-menu__inner" data-lenis-prevent="">
          <div className="rj-mobile-menu__button-wrap">
            <ArrowLink href="#contact" className="rj-mobile-menu__talk" onClick={closeMenu}>
              Let&apos;s talk
            </ArrowLink>
          </div>
          <nav className="rj-mobile-menu__links" aria-label="Mobile">
            {NAV_ITEMS.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rj-mobile-menu__link",
                  index === 0 && "rj-mobile-menu__link--active",
                )}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
