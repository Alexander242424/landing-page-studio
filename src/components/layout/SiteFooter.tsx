import { Logo } from "@/components/brand/Logo";

const STUDIOS = [
  "Product design",
  "Conversion (CRO)",
  "Brand systems",
  "Growth UX",
] as const;

const NAV = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#glance" },
  { label: "Services", href: "#solutions" },
  { label: "Approach", href: "#approach" },
] as const;

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
] as const;

/**
 * Dept-inspired multi-column footer, rendered in Rejouice / UXLAB tokens.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="rj-footer" id="contact">
      <div className="rj-footer__rule" aria-hidden="true" />

      <div className="rj-footer__grid">
        <div className="rj-footer__col rj-footer__col--brand">
          <Logo className="rj-footer__logo" markClassName="rj-footer__logo-mark" />
          <p className="rj-footer__tagline">
            Growth through product performance.
          </p>
          <button type="button" className="rj-footer__locale">
            Poland, Warsaw
            <span className="rj-footer__locale-chevron" aria-hidden="true">
              ▴
            </span>
          </button>
        </div>

        <div className="rj-footer__col">
          <ul className="rj-footer__list">
            {STUDIOS.map((item) => (
              <li key={item}>
                <a href="#solutions" className="rj-link-active">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rj-footer__col">
          <ul className="rj-footer__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="rj-link-active">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rj-footer__col rj-footer__col--actions">
          <a href="mailto:hello@uxlab.studio" className="rj-footer__action">
            <span>Subscribe to our newsletter</span>
            <span className="rj-footer__action-arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a href="mailto:hello@uxlab.studio" className="rj-footer__action">
            <span>Get in touch with us</span>
            <span className="rj-footer__action-arrow" aria-hidden="true">
              →
            </span>
          </a>

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
