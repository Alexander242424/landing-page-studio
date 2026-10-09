import { useEffect, type MouseEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import {
  getTool,
  getToolCategoryTitle,
  relatedTools,
} from "@/lib/toolverse";
import { ToolPopupChart } from "@/components/toolverse/ToolPopupChart";

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

type ToolPopupProps = {
  slug: string | null;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
};

export function ToolPopup({ slug, onClose, onSelectTool }: ToolPopupProps) {
  const tool = slug ? getTool(slug) : undefined;
  const open = Boolean(tool);
  const category = slug ? getToolCategoryTitle(slug) : undefined;
  const related = slug ? relatedTools(slug) : [];
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

  const handleRelatedClick = (
    event: MouseEvent<HTMLButtonElement>,
    nextSlug: string,
  ) => {
    event.preventDefault();
    onSelectTool(nextSlug);
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
          className="rj-case-popup rj-tool-popup"
          aria-describedby={tool ? "rj-tool-popup-lead" : undefined}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DialogPrimitive.Close
            className="rj-case-popup__close"
            aria-label="Close tool details"
          >
            <CloseIcon />
          </DialogPrimitive.Close>

          {tool ? (
            <div className="rj-case-popup__scroll" data-lenis-prevent>
              <div className="rj-case-popup__stack">
                <header className="rj-case-popup__intro">
                  {category ? (
                    <p className="rj-case-popup__eyebrow">{category}</p>
                  ) : null}
                  <DialogPrimitive.Title className="rj-case-popup__title rj-tool-popup__title">
                    {tool.logoSrc ? (
                      <img
                        className="rj-case-popup__logo rj-tool-popup__logo"
                        src={tool.logoSrc}
                        alt=""
                        width={180}
                        height={48}
                        decoding="async"
                      />
                    ) : (
                      <span className="rj-tool-popup__name">{tool.name}</span>
                    )}
                    {tool.logoSrc ? (
                      <span className="sr-only">{tool.name}</span>
                    ) : null}
                  </DialogPrimitive.Title>
                  <p className="rj-case-popup__lead" id="rj-tool-popup-lead">
                    {tool.blurb}
                  </p>
                </header>

                {tool.review ? (
                  <section className="rj-case-popup__block">
                    <p className="rj-case-popup__copy">{tool.review}</p>
                  </section>
                ) : null}

                {tool.metrics && tool.metrics.length > 0 ? (
                  <dl
                    className="rj-case-popup__metrics"
                    aria-label="Tool benchmarks"
                  >
                    {tool.metrics.map((stat) => (
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
                ) : null}

                {tool.chart ? <ToolPopupChart chart={tool.chart} /> : null}

                {tool.bestFor || tool.watchouts?.length || tool.useWhen ? (
                  <section className="rj-case-popup__block rj-tool-popup__notes">
                    {tool.bestFor ? (
                      <div className="rj-tool-popup__note">
                        <h3 className="rj-case-popup__label">Best for</h3>
                        <p className="rj-case-popup__copy">{tool.bestFor}</p>
                      </div>
                    ) : null}
                    {tool.useWhen ? (
                      <div className="rj-tool-popup__note">
                        <h3 className="rj-case-popup__label">When we pick it</h3>
                        <p className="rj-case-popup__copy">{tool.useWhen}</p>
                      </div>
                    ) : null}
                    {tool.watchouts && tool.watchouts.length > 0 ? (
                      <div className="rj-tool-popup__note">
                        <h3 className="rj-case-popup__label">Watchouts</h3>
                        <ul className="rj-tool-popup__watchouts">
                          {tool.watchouts.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <div className="rj-tool-popup__actions">
                  <ArrowLink
                    href={tool.href}
                    className="rj-link-active rj-hero__cta rj-hero__cta--process"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit {tool.name}
                  </ArrowLink>
                </div>

                {related.length > 0 ? (
                  <section className="rj-case-popup__block">
                    <h3 className="rj-case-popup__label">Related tools</h3>
                    <ul className="rj-tool-popup__related">
                      {related.map((item) => (
                        <li key={item.slug}>
                          <button
                            type="button"
                            className="rj-tool-popup__related-btn"
                            onClick={(event) =>
                              handleRelatedClick(event, item.slug)
                            }
                          >
                            <span
                              className="rj-tool-popup__related-mark"
                              aria-hidden="true"
                            >
                              {item.logoSrc ? (
                                <img
                                  src={item.logoSrc}
                                  alt=""
                                  width={24}
                                  height={24}
                                  decoding="async"
                                />
                              ) : (
                                item.name.slice(0, 1)
                              )}
                            </span>
                            <span className="rj-tool-popup__related-name">
                              {item.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
