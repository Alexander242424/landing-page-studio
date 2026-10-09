import { Link } from "@tanstack/react-router";
import { ArrowCue } from "@/components/ui/ArrowLink";
import type { Workflow } from "@/lib/workflows";

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <li className="rj-wf-card">
      <Link
        to="/workflows/$slug"
        params={{ slug: workflow.slug }}
        viewTransition
        className="rj-wf-card__link"
      >
        <div className="rj-wf-card__media">
          <img
            src={workflow.coverSrc}
            alt={workflow.coverAlt}
            width={960}
            height={600}
            decoding="async"
            loading="lazy"
            draggable={false}
          />
        </div>
        <div className="rj-wf-card__body">
          <h3 className="rj-wf-card__title">
            <span className="rj-wf-card__title-text">{workflow.title}</span>
            <ArrowCue className="rj-wf-card__arrow" />
          </h3>
          <p className="rj-wf-card__lede">{workflow.lede}</p>
          <ul className="rj-wf-card__tags" aria-label="Topics">
            {workflow.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </Link>
    </li>
  );
}
