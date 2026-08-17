import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorkListItem } from "@/components/work/WorkListItem";
import { useWorkCatalog, workCatalogItems } from "@/hooks/useWorkCatalog";
import type { WorkCatalogItem } from "@/lib/workCatalog";

gsap.registerPlugin(ScrollTrigger);

type WorkListProps = {
  items?: WorkCatalogItem[];
};

export function WorkList({ items }: WorkListProps) {
  const rootRef = useRef<HTMLElement>(null);
  const catalog = useWorkCatalog();
  const cases = items ?? workCatalogItems(catalog.data);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = root.querySelectorAll<HTMLElement>("[data-reveal='work-row']");

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(rows, { clearProps: "all", autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(rows, { autoAlpha: 0, y: 36 });

      rows.forEach((row) => {
        gsap.to(row, {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 90%",
            once: true,
          },
        });
      });
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [cases]);

  return (
    <section
      ref={rootRef}
      className="rj-work__list"
      aria-label="Case studies"
    >
      <ul className="rj-work__rows">
        {cases.map((item) => (
          <WorkListItem key={item.slug} item={item} />
        ))}
      </ul>
    </section>
  );
}
