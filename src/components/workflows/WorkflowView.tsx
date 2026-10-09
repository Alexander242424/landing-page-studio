import { Link } from "@tanstack/react-router";
import { useId, useState, type FormEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { openLeadChat } from "@/lib/askChat";
import { resolveTool } from "@/lib/toolverse";
import {
  relatedWorkflows,
  type Workflow,
} from "@/lib/workflows";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function triggerFileDownload(src: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = src;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function WorkflowLeadForm({ workflow }: { workflow: Workflow }) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const trimmed = email.trim();
  const canSubmit = looksLikeEmail(trimmed);
  const hasDownload = Boolean(workflow.downloadSrc);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    const source = hasDownload
      ? "workflow_playbook_download"
      : "workflow_playbook";
    openLeadChat({
      prefill: { email: trimmed },
      source,
    });
    if (workflow.downloadSrc) {
      const filename =
        workflow.downloadFilename ??
        `${workflow.slug}.pdf`;
      triggerFileDownload(workflow.downloadSrc, filename);
    }
  }

  return (
    <form
      className="rj-wf-detail__lead-form"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${inputId}-cta`}
    >
      <p className="rj-wf-detail__lead-form-cta" id={`${inputId}-cta`}>
        Get the playbook
      </p>
      <div className="rj-wf-detail__lead-form-bar rj-ask__bar">
        <div className="rj-ask__value">
          <label className="sr-only" htmlFor={inputId}>
            Email
          </label>
          <input
            id={inputId}
            className="rj-ask__input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Work email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        </div>
        {hasDownload ? (
          <button
            type="submit"
            className="rj-hero__cta rj-hero__cta--talk rj-wf-detail__lead-form-submit"
            disabled={!canSubmit}
          >
            Download
            <svg
              className="rj-wf-detail__lead-form-submit-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className={`rj-ask__btn rj-ask__btn--send${canSubmit ? " is-ready" : ""}`}
            aria-label="Get the playbook"
            disabled={!canSubmit}
          >
            <svg
              className="rj-ask__icon rj-ask__icon--send"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 19V7M7.5 11.5 12 7l4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      {error ? (
        <p
          className="rj-wf-detail__lead-form-error"
          id={`${inputId}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function WorkflowView({ workflow }: { workflow: Workflow }) {
  const related = relatedWorkflows(workflow.slug);

  return (
    <article className="rj-wf-detail">
      <div className="rj-wf-detail__layout">
        <div className="rj-wf-detail__hero-copy">
          <header className="rj-wf-detail__header">
            <nav className="rj-article__crumbs rj-work__crumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to="/" viewTransition>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/workflows" viewTransition>
                    Playbooks
                  </Link>
                </li>
              </ol>
            </nav>

            <h1 className="rj-wf-detail__title">{workflow.title}</h1>
            <div className="rj-wf-detail__lede">
              {workflow.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </header>

          <WorkflowLeadForm workflow={workflow} />

          <section className="rj-wf-detail__tools" aria-label="Tools used">
            <h2 className="rj-wf-detail__label">Tools used</h2>
            <ul className="rj-wf-detail__tool-list">
              {workflow.tools.map((name) => {
                const tool = resolveTool(name);
                return (
                  <li key={tool.slug}>
                    <a
                      className="rj-wf-tool"
                      href={tool.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="rj-wf-tool__logo" aria-hidden="true">
                        {tool.logoSrc ? (
                          <img
                            src={tool.logoSrc}
                            alt=""
                            width={24}
                            height={24}
                            decoding="async"
                          />
                        ) : (
                          tool.name.slice(0, 1)
                        )}
                      </span>
                      <span className="rj-wf-tool__name">{tool.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <figure className="rj-wf-detail__cover">
          <img
            src={workflow.coverSrc}
            alt={workflow.coverAlt}
            width={1600}
            height={1000}
            decoding="async"
            fetchPriority="high"
          />
        </figure>

        <div className="rj-wf-detail__body">
          <section className="rj-wf-detail__steps" aria-label="How it works">
            <h2 className="rj-wf-detail__heading">How it works</h2>
            <Accordion type="single" collapsible className="rj-wf-steps">
              {workflow.steps.map((step, index) => (
                <AccordionItem
                  key={step.title}
                  value={`step-${index}`}
                  className="rj-wf-step"
                >
                  <AccordionTrigger
                    hideChevron
                    className="rj-wf-step__trigger hover:no-underline py-0 items-center font-normal text-inherit"
                  >
                    <span className="rj-wf-step__trigger-grid">
                      <span className="rj-wf-step__index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rj-wf-step__title">{step.title}</span>
                    </span>
                    <span className="rj-wf-step__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M12 5v14M5 12h14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="rj-wf-step__panel">
                    <div className="rj-wf-step__copy">
                      <p className="rj-wf-step__intro">{step.intro}</p>
                      <ul className="rj-wf-step__points">
                        {step.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="rj-wf-grid-wrap rj-wf-detail__related-wrap">
          <div className="rj-wf-grid-inner">
            <section className="rj-wf-detail__related" aria-label="More workflows">
              <h2 className="rj-wf-detail__heading">More playbooks</h2>
              <ul className="rj-wf-grid">
                {related.map((item) => (
                  <WorkflowCard key={item.slug} workflow={item} />
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </article>
  );
}
