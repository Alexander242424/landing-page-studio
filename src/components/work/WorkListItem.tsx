import { Link } from "@tanstack/react-router";
import { ArrowCue } from "@/components/ui/ArrowLink";
import { caseHoverImage, type CaseStudy } from "@/lib/cases";
import { cn } from "@/lib/utils";

type WorkListItemProps = {
  caseStudy: CaseStudy;
};

export function WorkListItem({ caseStudy }: WorkListItemProps) {
  const hasPage = caseStudy.hasPage;
  const hoverSrc = caseHoverImage(caseStudy);

  const body = (
    <div className="rj-work__row-grid">
      <div className="rj-work__brand">
        {caseStudy.logo ? (
          <img
            className="rj-work__logo"
            src={caseStudy.logo}
            alt=""
            width={160}
            height={40}
            decoding="async"
            draggable={false}
          />
        ) : null}
        <span
          className={cn(
            "rj-work__client",
            caseStudy.logo && "rj-work__client--fallback",
          )}
        >
          {caseStudy.client}
        </span>
      </div>

      <div className="rj-work__copy">
        <p className="rj-work__description">{caseStudy.description}</p>
        {hasPage ? (
          <span className="rj-work__cta">
            <span className="rj-work__cta-inner">
              <ArrowCue>View case study</ArrowCue>
            </span>
          </span>
        ) : null}
      </div>

      {hasPage ? (
        <div className="rj-work__preview" aria-hidden="true">
          <div className="rj-work__preview-inner">
            <div className="rj-work__preview-frame">
              <img
                src={hoverSrc}
                alt=""
                width={640}
                height={440}
                decoding="async"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ul className="rj-work__services" aria-label="Services">
        {caseStudy.services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <li
      className={cn(
        "rj-work__row",
        hasPage ? "rj-work__row--linkable" : "rj-work__row--listed",
      )}
      data-reveal="work-row"
    >
      {hasPage ? (
        <Link
          to="/work/$slug"
          params={{ slug: caseStudy.slug }}
          viewTransition
          className="rj-work__row-link"
          aria-label={`View ${caseStudy.client} case study`}
        >
          {body}
        </Link>
      ) : (
        <div className="rj-work__row-link rj-work__row-link--static">{body}</div>
      )}
    </li>
  );
}
