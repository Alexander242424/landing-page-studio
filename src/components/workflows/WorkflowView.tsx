import { Link } from "@tanstack/react-router";
import { GetInTouchSection } from "@/components/home/GetInTouchSection";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { resolveTool } from "@/lib/toolverse";
import {
  relatedWorkflows,
  type Workflow,
} from "@/lib/workflows";

export function WorkflowView({ workflow }: { workflow: Workflow }) {
  const related = relatedWorkflows(workflow.slug);

  return (
    <article className="rj-wf-detail">
      <div className="rj-wf-detail__hero">
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
                  Workflows
                </Link>
              </li>
            </ol>
          </nav>

          <h1 className="rj-wf-detail__title">{workflow.title}</h1>
          <p className="rj-wf-detail__lede">{workflow.description}</p>
        </header>

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
      </div>

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
                        width={28}
                        height={28}
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

      <section className="rj-wf-detail__steps" aria-label="How it works">
        <h2 className="rj-wf-detail__heading">How it works</h2>
        <ol className="rj-wf-steps">
          {workflow.steps.map((step, index) => (
            <li key={step.title} className="rj-wf-step">
              <p className="rj-wf-step__index">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="rj-wf-step__copy">
                <h3 className="rj-wf-step__title">{step.title}</h3>
                <p className="rj-wf-step__intro">{step.intro}</p>
                <ul className="rj-wf-step__points">
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {related.length > 0 ? (
        <section className="rj-wf-detail__related" aria-label="More workflows">
          <h2 className="rj-wf-detail__heading">More playbooks</h2>
          <ul className="rj-wf-grid">
            {related.map((item) => (
              <WorkflowCard key={item.slug} workflow={item} />
            ))}
          </ul>
        </section>
      ) : null}

      <GetInTouchSection />
    </article>
  );
}
