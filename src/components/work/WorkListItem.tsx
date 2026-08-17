import { Link } from "@tanstack/react-router";
import { ArrowCue } from "@/components/ui/ArrowLink";
import type { WorkCatalogItem } from "@/lib/workCatalog";
import { cn } from "@/lib/utils";

type WorkListItemProps = {
  item: WorkCatalogItem;
};

export function WorkListItem({ item }: WorkListItemProps) {
  const hasPage = item.hasPage;

  const body = (
    <div className="rj-work__row-grid">
      <div className="rj-work__brand">
        {item.logo ? (
          <img
            className="rj-work__logo"
            src={item.logo}
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
            item.logo && "rj-work__client--fallback",
          )}
        >
          {item.client}
        </span>
      </div>

      <div className="rj-work__copy">
        <p className="rj-work__description">{item.title}</p>
      </div>

      {hasPage ? (
        <div className="rj-work__preview" aria-hidden="true">
          <div className="rj-work__preview-inner">
            <img
              src={item.image}
              alt=""
              width={640}
              height={400}
              decoding="async"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
      ) : null}

      <ul className="rj-work__services" aria-label="Services">
        {item.services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>

      {hasPage ? (
        <span className="rj-work__cta">
          <span className="rj-work__cta-inner">
            <ArrowCue>View case study</ArrowCue>
          </span>
        </span>
      ) : null}
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
          params={{ slug: item.slug }}
          viewTransition
          className="rj-work__row-link"
          aria-label={`View ${item.client} case study`}
        >
          {body}
        </Link>
      ) : (
        <div className="rj-work__row-link rj-work__row-link--static">{body}</div>
      )}
    </li>
  );
}
