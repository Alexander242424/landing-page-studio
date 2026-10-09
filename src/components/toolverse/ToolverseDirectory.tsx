import { useState } from "react";
import { ArrowCue } from "@/components/ui/ArrowLink";
import { ToolPopup } from "@/components/toolverse/ToolPopup";
import { TOOL_CATEGORIES, getTool, type ToolEntry } from "@/lib/toolverse";

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

function ToolTile({
  tool,
  onOpen,
}: {
  tool: ToolEntry;
  onOpen: (slug: string) => void;
}) {
  const entry = getTool(tool.slug) ?? tool;

  return (
    <li>
      <button
        type="button"
        className="rj-tv-tool"
        onClick={() => onOpen(tool.slug)}
      >
        <ToolMark tool={entry} />
        <span className="rj-tv-tool__copy">
          <span className="rj-tv-tool__name">{tool.name}</span>
          <span className="rj-tv-tool__blurb">{tool.blurb}</span>
        </span>
        <ArrowCue className="rj-tv-tool__arrow" />
      </button>
    </li>
  );
}

export function ToolverseDirectory() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  return (
    <>
      <div className="rj-tv-dir">
        <nav className="rj-tv-dir__nav" aria-label="Tool categories">
          {TOOL_CATEGORIES.map((category) => (
            <a key={category.id} href={`#${category.id}`}>
              {category.title}
            </a>
          ))}
        </nav>

        <div className="rj-tv-dir__sections">
          {TOOL_CATEGORIES.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className="rj-tv-cat"
              aria-labelledby={`${category.id}-title`}
            >
              <h2 id={`${category.id}-title`} className="rj-tv-cat__title">
                {category.title}
              </h2>
              <ul className="rj-tv-cat__grid">
                {category.tools.map((tool) => (
                  <ToolTile
                    key={tool.slug}
                    tool={tool}
                    onOpen={setSelectedSlug}
                  />
                ))}
              </ul>
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
