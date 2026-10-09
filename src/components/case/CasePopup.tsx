import { useEffect, type MouseEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getCase, getCasePopupCopy } from "@/lib/cases";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { openContactChat, openCroAuditChat } from "@/lib/askChat";

function CloseIcon() {
  return (
    <svg
      className="rj-case-popup__close-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type CasePopupProps = {
  slug: string | null;
  onClose: () => void;
};

export function CasePopup({ slug, onClose }: CasePopupProps) {
  const caseStudy = slug ? getCase(slug) : undefined;
  const copy = caseStudy ? getCasePopupCopy(caseStudy) : null;
  const open = Boolean(copy);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("rj-case-popup-open");
    stop();
    return () => {
      root.classList.remove("rj-case-popup-open");
      start();
    };
  }, [open, start, stop]);

  const handleTalkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClose();
    openContactChat();
  };

  const handleAuditClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClose();
    openCroAuditChat();
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="rj-case-popup__overlay" />
        <DialogPrimitive.Content
          className="rj-case-popup"
          aria-describedby={copy ? "rj-case-popup-lead" : undefined}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DialogPrimitive.Close
            className="rj-case-popup__close"
            aria-label="Close case study"
          >
            <CloseIcon />
          </DialogPrimitive.Close>

          {copy ? (
            <div className="rj-case-popup__scroll" data-lenis-prevent>
              <div className="rj-case-popup__stack">
                <header className="rj-case-popup__intro rj-case-popup__reveal">
                  <p className="rj-case-popup__eyebrow">{copy.eyebrow}</p>
                  <DialogPrimitive.Title className="rj-case-popup__title">
                    <img
                      className="rj-case-popup__logo"
                      src={copy.logo}
                      alt={copy.title}
                      width={180}
                      height={40}
                      decoding="async"
                    />
                  </DialogPrimitive.Title>
                  <p className="rj-case-popup__lead" id="rj-case-popup-lead">
                    {copy.lead}
                  </p>
                </header>

                <dl
                  className="rj-case-popup__metrics rj-case-popup__reveal"
                  aria-label="Impact metrics"
                >
                  {copy.metrics.map((stat) => (
                    <div key={stat.label} className="rj-case-popup__metric">
                      <dt className="rj-case-popup__metric-value">
                        {stat.value}
                      </dt>
                      <dd className="rj-case-popup__metric-label">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>

                <figure className="rj-case-popup__figure rj-case-popup__reveal">
                  <div className="rj-case-popup__fig-frame">
                    <img
                      src={copy.figureSrc}
                      alt={copy.figureAlt}
                      width={992}
                      height={661}
                      decoding="async"
                    />
                  </div>
                </figure>

                <section className="rj-case-popup__block rj-case-popup__reveal">
                  <h3 className="rj-case-popup__label">Our Approach</h3>
                  <p className="rj-case-popup__copy">{copy.approach}</p>
                </section>

                <section className="rj-case-popup__block rj-case-popup__reveal">
                  <h3 className="rj-case-popup__label">The Outcome</h3>
                  <p className="rj-case-popup__copy">{copy.outcome}</p>
                </section>

                <footer className="rj-case-popup__footer rj-case-popup__reveal">
                  <h3 className="rj-case-popup__footer-heading">
                    {copy.footerHeading}
                  </h3>
                  <div
                    className="rj-case-popup__actions"
                    aria-label="Case study actions"
                  >
                    <ArrowLink
                      href="#contact"
                      className="rj-link-active rj-hero__cta rj-hero__cta--talk"
                      onClick={handleTalkClick}
                    >
                      Let&apos;s talk
                    </ArrowLink>
                    <ArrowLink
                      href="#contact"
                      className="rj-link-active rj-hero__cta rj-hero__cta--process"
                      onClick={handleAuditClick}
                    >
                      Free CRO audit
                    </ArrowLink>
                  </div>
                </footer>
              </div>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
