import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowCue } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { openContactChat, openNewsletterChat } from "@/lib/askChat";
import { SOLUTIONS, solutionChatContext } from "@/lib/solutions";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Case studies", href: "/work" },
  { label: "Playbooks", href: "/workflows" },
  { label: "Toolverse", href: "/toolverse" },
  { label: "Solutions", href: "#solutions" },
] as const;

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
] as const;

type SiteFooterProps = {
  /** `dark` scopes `.theme-dark` tokens (article pages). Home inherits page band. */
  variant?: "inherit" | "dark";
};

/**
 * Dept-inspired multi-column footer, rendered in Rejouice / UXLAB tokens.
 *
 * Desktop (≥1024px): sticky underlay reveal — `main.rj-page__main` paints above
 * and scrolls away to uncover `footer` stuck at the viewport bottom.
 * Mobile keeps normal document flow so the ask bar / touch scroll stay clean.
 */
export function SiteFooter({ variant = "inherit" }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const { lenis } = useSmoothScroll();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

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

  const navHref = (href: string) => {
    if (href.startsWith("/")) return href;
    return isHome ? href : `/${href}`;
  };

  const onHashNavClick =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();
      if (isHome) {
        scrollToHref(href);
        return;
      }
      void navigate({ to: "/", hash: href.slice(1), viewTransition: true });
    };

  return (
    <footer
      className={cn("rj-footer", variant === "dark" && "theme-dark")}
      id="contact"
    >
      <div className="rj-footer__rule" aria-hidden="true" />

      <div className="rj-footer__grid">
        <div className="rj-footer__col rj-footer__col--brand">
          <Logo className="rj-footer__logo" markClassName="rj-footer__logo-mark" />
          <p className="rj-footer__tagline">
            Convert more with confidence.
          </p>
          <p className="rj-footer__locale">Poland, Warsaw</p>
        </div>

        <div className="rj-footer__col">
          <ul className="rj-footer__list">
            {SOLUTIONS.map((item) => (
              <li key={item.slug}>
                <a
                  href="#contact"
                  className="rj-link-active"
                  onClick={(event) => {
                    event.preventDefault();
                    openContactChat({
                      service: solutionChatContext(item),
                      source: "footer_solutions",
                    });
                  }}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rj-footer__col">
          <ul className="rj-footer__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={navHref(item.href)}
                  className="rj-link-active"
                  onClick={
                    item.href.startsWith("#")
                      ? onHashNavClick(item.href)
                      : undefined
                  }
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rj-footer__col rj-footer__col--actions">
          <button
            type="button"
            className="rj-footer__action"
            onClick={() => openNewsletterChat()}
          >
            <ArrowCue className="rj-footer__action-cue">
              Subscribe to our newsletter
            </ArrowCue>
          </button>
          <button
            type="button"
            className="rj-footer__action"
            onClick={() => openContactChat()}
          >
            <ArrowCue className="rj-footer__action-cue">
              Get in touch with us
            </ArrowCue>
          </button>

          <ul className="rj-footer__socials">
            {SOCIALS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="rj-link-active"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="rj-footer__copy">© {year} UXLAB</p>
        </div>
      </div>
    </footer>
  );
}
