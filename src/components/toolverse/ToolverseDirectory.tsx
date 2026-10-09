import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowCue } from "@/components/ui/ArrowLink";
import { useSmoothScroll } from "@/components/scroll/SmoothScrollProvider";
import { ToolPopup } from "@/components/toolverse/ToolPopup";
import { TOOL_CATEGORIES, getTool, type ToolEntry } from "@/lib/toolverse";

gsap.registerPlugin(ScrollTrigger);

function scrollToCategory(id: string, lenis: ReturnType<typeof useSmoothScroll>["lenis"]) {
  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) {
    const scrollMargin =
      Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    lenis.scrollTo(target, { offset: -scrollMargin, duration: 1.1 });
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ToolMark({ tool }: { tool: ToolEntry }) {
  const initial = tool.name.slice(0, 1).toUpperCase();

  if (tool.logoSrc) {
    return (
      <span className="rj-tv-tool__mark" aria-hidden="true">
        <img
          src={tool.logoSrc}
          alt=""
          width={32}
          height={32}
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span className="rj-tv-tool__mark" aria-hidden="true">
      {initial}
    </span>
  );
}

function isDirectExternalTool(tool: ToolEntry) {
  return tool.slug === "boostra" || tool.href === "https://getboostra.com";
}

function ToolTile({
  tool,
  onOpen,
  spanFullWidth = false,
}: {
  tool: ToolEntry;
  onOpen: (slug: string) => void;
  spanFullWidth?: boolean;
}) {
  const entry = getTool(tool.slug) ?? tool;
  const external = isDirectExternalTool(entry);

  const content = (
    <>
      <ToolMark tool={entry} />
      <span className="rj-tv-tool__copy">
        <span className="rj-tv-tool__name">{tool.name}</span>
        <span className="rj-tv-tool__blurb">{tool.blurb}</span>
      </span>
      <ArrowCue className="rj-tv-tool__arrow" />
    </>
  );

  return (
    <li
      className={
        spanFullWidth ? "rj-tv-cell rj-tv-cell--span" : "rj-tv-cell"
      }
    >
      {external ? (
        <a
          className="rj-tv-tool"
          href={entry.href}
          target="_blank"
          rel="noreferrer"
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          className="rj-tv-tool"
          onClick={() => onOpen(tool.slug)}
        >
          {content}
        </button>
      )}
    </li>
  );
}

export function ToolverseDirectory() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { lenis } = useSmoothScroll();
  const dirRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = dirRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = () => {
      root.classList.add("rj-tv-dir--revealed");
    };

    const navLinks = root.querySelectorAll<HTMLElement>(".rj-tv-dir__nav a");
    const sections = root.querySelectorAll<HTMLElement>(".rj-tv-cat");

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([navLinks, sections], { clearProps: "opacity,visibility,transform" });
        reveal();
        return;
      }

      gsap.set(navLinks, { autoAlpha: 0, y: 14 });
      sections.forEach((section) => {
        const title = section.querySelector<HTMLElement>(".rj-tv-cat__title");
        const gridWrap = section.querySelector<HTMLElement>(".rj-tv-cat__grid-wrap");
        const tiles = section.querySelectorAll<HTMLElement>(".rj-tv-tool");
        if (title) gsap.set(title, { autoAlpha: 0, y: 36 });
        if (gridWrap) gsap.set(gridWrap, { autoAlpha: 0, y: 28 });
        if (tiles.length) gsap.set(tiles, { autoAlpha: 0, y: 22 });
      });

      gsap.to(navLinks, {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.035,
        ease: "power3.out",
        delay: 2.75,
        onComplete: reveal,
      });

      sections.forEach((section, index) => {
        const title = section.querySelector<HTMLElement>(".rj-tv-cat__title");
        const gridWrap = section.querySelector<HTMLElement>(".rj-tv-cat__grid-wrap");
        const tiles = section.querySelectorAll<HTMLElement>(".rj-tv-tool");

        ScrollTrigger.create({
          trigger: section,
          start: "top 90%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({
              defaults: { ease: "power3.out" },
              delay: index === 0 ? 2.65 : 0,
            });

            if (title) {
              tl.to(title, { autoAlpha: 1, y: 0, duration: 0.85 }, 0);
            }
            if (gridWrap) {
              tl.to(
                gridWrap,
                { autoAlpha: 1, y: 0, duration: 0.75 },
                title ? "-=0.55" : 0,
              );
            }
            if (tiles.length) {
              tl.to(
                tiles,
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.7,
                  stagger: 0.055,
                },
                "-=0.45",
              );
            }
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      root.classList.remove("rj-tv-dir--revealed");
      ctx.revert();
    };
  }, []);

  const onCategoryNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    scrollToCategory(id, lenis);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <div ref={dirRef} className="rj-tv-dir">
        <nav className="rj-tv-dir__nav" aria-label="Tool categories">
          {TOOL_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              onClick={(event) => onCategoryNavClick(event, category.id)}
            >
              {category.title}
            </a>
          ))}
        </nav>

        <div className="rj-tv-dir__sections">
          {TOOL_CATEGORIES.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className={
                category.featured
                  ? "rj-tv-cat rj-tv-cat--featured"
                  : "rj-tv-cat"
              }
              aria-labelledby={`${category.id}-title`}
            >
              <h2 id={`${category.id}-title`} className="rj-tv-cat__title">
                {category.title}
              </h2>
              <div className="rj-tv-cat__grid-wrap">
                <ul className="rj-tv-cat__grid">
                  {category.tools.map((tool) => (
                    <ToolTile
                      key={tool.slug}
                      tool={tool}
                      onOpen={setSelectedSlug}
                      spanFullWidth={Boolean(category.featured)}
                    />
                  ))}
                  {!category.featured && category.tools.length % 2 !== 0 ? (
                    <li className="rj-tv-cell rj-tv-cell--empty" aria-hidden="true" />
                  ) : null}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      <ToolPopup
        slug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
        onSelectTool={setSelectedSlug}
      />
    </>
  );
}
