import { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/typography/Text";
import {
  emptyCatalogArticle,
  estimateArticleReadTime,
  formatArticleDisplayDate,
  slugifyArticleTitle,
  ARTICLE_CATEGORIES,
  type CatalogArticle,
} from "@/lib/articleCatalog";
import type { ArticleWriteInput } from "@/lib/admin/articleAdmin.functions";
import type { ArticleFaq, ArticleSection } from "@/lib/articles";

type AdminArticleEditorProps = {
  initial: CatalogArticle | null;
  existingSlugs: string[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (input: ArticleWriteInput, publish: boolean) => void;
};

function newSection(): ArticleSection {
  return { heading: "", paragraphs: [""], bullets: [] };
}

function newFaq(): ArticleFaq {
  return { question: "", answer: "" };
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item!);
  return copy;
}

export function AdminArticleEditor({
  initial,
  existingSlugs,
  saving,
  error,
  onCancel,
  onSave,
}: AdminArticleEditorProps) {
  const [draft, setDraft] = useState<CatalogArticle>(
    () => initial ?? emptyCatalogArticle(),
  );
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));
  const [readTimeLocked, setReadTimeLocked] = useState(
    Boolean(initial?.readTime),
  );

  useEffect(() => {
    setDraft(initial ?? emptyCatalogArticle());
    setSlugLocked(Boolean(initial?.slug));
    setReadTimeLocked(Boolean(initial?.readTime));
  }, [initial]);

  const autoReadTime = useMemo(
    () => estimateArticleReadTime(draft),
    [draft],
  );

  const slugConflict =
    draft.slug &&
    existingSlugs.includes(draft.slug) &&
    draft.slug !== initial?.slug;

  function patch(partial: Partial<CatalogArticle>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function onTitleChange(title: string) {
    if (slugLocked) {
      patch({ title });
      return;
    }
    patch({ title, slug: slugifyArticleTitle(title) });
  }

  function onDatePublishedChange(datePublished: string) {
    patch({
      datePublished,
      date: formatArticleDisplayDate(datePublished),
      dateModified: datePublished,
    });
  }

  function submit(publish: boolean) {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.category.trim()) {
      return;
    }
    if (slugConflict) return;
    const sections = draft.sections.filter(
      (section) => section.heading.trim() || section.paragraphs.some((p) => p.trim()),
    );
    if (sections.length < 1) return;

    onSave(
      {
        id: draft.id || "",
        slug: draft.slug,
        status: publish ? "published" : "draft",
        sortOrder: draft.sortOrder,
        category: draft.category,
        title: draft.title,
        description: draft.description,
        answerCapsule: draft.answerCapsule,
        date: draft.date,
        datePublished: draft.datePublished,
        dateModified: new Date().toISOString().slice(0, 10),
        readTime: readTimeLocked ? draft.readTime : autoReadTime,
        image: draft.image,
        imageAlt: draft.imageAlt,
        author: draft.author,
        keywords: draft.keywords,
        entities: draft.entities,
        takeaways: draft.takeaways,
        sections: draft.sections,
        faq: draft.faq,
      },
      publish,
    );
  }

  return (
    <div className="rj-admin__editor">
      <div className="rj-admin__panel-head">
        <h2 className="rj-admin__panel-title">
          {initial?.id ? "Edit article" : "New article"}
        </h2>
        <div className="rj-admin__btn-row">
          <button
            type="button"
            className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
            onClick={onCancel}
            disabled={saving}
          >
            Back
          </button>
          <button
            type="button"
            className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
            onClick={() => submit(false)}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className="rj-admin__btn rj-admin__btn--sm"
            onClick={() => submit(true)}
            disabled={saving}
          >
            Publish
          </button>
        </div>
      </div>

      {error ? (
        <p className="rj-admin__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rj-admin__form">
        <label className="rj-admin__field">
          <span className="rj-admin__label">Title</span>
          <input
            className="rj-admin__input"
            value={draft.title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </label>

        <div className="rj-admin__grid-2">
          <label className="rj-admin__field">
            <span className="rj-admin__label">Slug</span>
            <input
              className="rj-admin__input"
              value={draft.slug}
              onChange={(e) => {
                setSlugLocked(true);
                patch({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
              }}
              required
            />
            {slugConflict ? (
              <Text muted className="rj-admin__field-hint">
                This slug is already used.
              </Text>
            ) : (
              <Text muted className="rj-admin__field-hint">
                /resources/{draft.slug || "…"}
              </Text>
            )}
          </label>
          <label className="rj-admin__field">
            <span className="rj-admin__label">Category</span>
            <input
              className="rj-admin__input"
              list="rj-admin-article-categories"
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
              required
            />
            <datalist id="rj-admin-article-categories">
              {ARTICLE_CATEGORIES.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="rj-admin__field">
          <span className="rj-admin__label">Description</span>
          <textarea
            className="rj-admin__textarea"
            rows={2}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </label>

        <label className="rj-admin__field">
          <span className="rj-admin__label">Answer capsule</span>
          <textarea
            className="rj-admin__textarea"
            rows={4}
            value={draft.answerCapsule}
            onChange={(e) => patch({ answerCapsule: e.target.value })}
          />
        </label>

        <div className="rj-admin__grid-2">
          <label className="rj-admin__field">
            <span className="rj-admin__label">Published</span>
            <input
              className="rj-admin__input"
              type="date"
              value={draft.datePublished}
              onChange={(e) => onDatePublishedChange(e.target.value)}
            />
          </label>
          <label className="rj-admin__field">
            <span className="rj-admin__label">Read time</span>
            <input
              className="rj-admin__input"
              value={readTimeLocked ? draft.readTime : autoReadTime}
              onChange={(e) => {
                setReadTimeLocked(true);
                patch({ readTime: e.target.value });
              }}
            />
          </label>
        </div>

        <div className="rj-admin__grid-2">
          <label className="rj-admin__field">
            <span className="rj-admin__label">Image URL</span>
            <input
              className="rj-admin__input"
              value={draft.image}
              onChange={(e) => patch({ image: e.target.value })}
            />
          </label>
          <label className="rj-admin__field">
            <span className="rj-admin__label">Image alt</span>
            <input
              className="rj-admin__input"
              value={draft.imageAlt}
              onChange={(e) => patch({ imageAlt: e.target.value })}
            />
          </label>
        </div>

        <div className="rj-admin__grid-2">
          <label className="rj-admin__field">
            <span className="rj-admin__label">Author name</span>
            <input
              className="rj-admin__input"
              value={draft.author.name}
              onChange={(e) =>
                patch({ author: { ...draft.author, name: e.target.value } })
              }
            />
          </label>
          <label className="rj-admin__field">
            <span className="rj-admin__label">Author title</span>
            <input
              className="rj-admin__input"
              value={draft.author.jobTitle}
              onChange={(e) =>
                patch({
                  author: { ...draft.author, jobTitle: e.target.value },
                })
              }
            />
          </label>
        </div>

        <label className="rj-admin__field">
          <span className="rj-admin__label">Author URL</span>
          <input
            className="rj-admin__input"
            value={draft.author.url}
            onChange={(e) =>
              patch({ author: { ...draft.author, url: e.target.value } })
            }
          />
        </label>

        <StringListField
          label="Keywords"
          values={draft.keywords}
          onChange={(keywords) => patch({ keywords })}
        />
        <StringListField
          label="Entities"
          values={draft.entities}
          onChange={(entities) => patch({ entities })}
        />
        <StringListField
          label="Takeaways"
          values={draft.takeaways}
          onChange={(takeaways) => patch({ takeaways })}
        />

        <div className="rj-admin__editor-block">
          <div className="rj-admin__panel-head rj-admin__panel-head--flush">
            <h3 className="rj-admin__panel-title">Sections</h3>
            <button
              type="button"
              className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
              onClick={() => patch({ sections: [...draft.sections, newSection()] })}
            >
              Add section
            </button>
          </div>
          {draft.sections.map((section, index) => (
            <div key={`section-${index}`} className="rj-admin__editor-card">
              <div className="rj-admin__btn-row">
                <span className="rj-admin__muted">Section {index + 1}</span>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() =>
                    patch({ sections: moveItem(draft.sections, index, -1) })
                  }
                  disabled={index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() =>
                    patch({ sections: moveItem(draft.sections, index, 1) })
                  }
                  disabled={index === draft.sections.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() =>
                    patch({
                      sections: draft.sections.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <label className="rj-admin__field">
                <span className="rj-admin__label">Heading</span>
                <input
                  className="rj-admin__input"
                  value={section.heading}
                  onChange={(e) => {
                    const sections = [...draft.sections];
                    sections[index] = { ...section, heading: e.target.value };
                    patch({ sections });
                  }}
                />
              </label>
              <StringListField
                label="Paragraphs"
                values={section.paragraphs}
                textarea
                onChange={(paragraphs) => {
                  const sections = [...draft.sections];
                  sections[index] = { ...section, paragraphs };
                  patch({ sections });
                }}
              />
              <StringListField
                label="Bullets"
                values={section.bullets ?? []}
                onChange={(bullets) => {
                  const sections = [...draft.sections];
                  sections[index] = { ...section, bullets };
                  patch({ sections });
                }}
              />
            </div>
          ))}
        </div>

        <div className="rj-admin__editor-block">
          <div className="rj-admin__panel-head rj-admin__panel-head--flush">
            <h3 className="rj-admin__panel-title">FAQ</h3>
            <button
              type="button"
              className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
              onClick={() => patch({ faq: [...draft.faq, newFaq()] })}
            >
              Add question
            </button>
          </div>
          {draft.faq.map((item, index) => (
            <div key={`faq-${index}`} className="rj-admin__editor-card">
              <div className="rj-admin__btn-row">
                <span className="rj-admin__muted">FAQ {index + 1}</span>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() => patch({ faq: moveItem(draft.faq, index, -1) })}
                  disabled={index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() => patch({ faq: moveItem(draft.faq, index, 1) })}
                  disabled={index === draft.faq.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                  onClick={() =>
                    patch({ faq: draft.faq.filter((_, i) => i !== index) })
                  }
                >
                  Remove
                </button>
              </div>
              <label className="rj-admin__field">
                <span className="rj-admin__label">Question</span>
                <input
                  className="rj-admin__input"
                  value={item.question}
                  onChange={(e) => {
                    const faq = [...draft.faq];
                    faq[index] = { ...item, question: e.target.value };
                    patch({ faq });
                  }}
                />
              </label>
              <label className="rj-admin__field">
                <span className="rj-admin__label">Answer</span>
                <textarea
                  className="rj-admin__textarea"
                  rows={3}
                  value={item.answer}
                  onChange={(e) => {
                    const faq = [...draft.faq];
                    faq[index] = { ...item, answer: e.target.value };
                    patch({ faq });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StringListField({
  label,
  values,
  onChange,
  textarea = false,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  textarea?: boolean;
}) {
  const list = values.length ? values : [""];
  return (
    <div className="rj-admin__field">
      <div className="rj-admin__panel-head rj-admin__panel-head--flush">
        <span className="rj-admin__label">{label}</span>
        <button
          type="button"
          className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
          onClick={() => onChange([...list, ""])}
        >
          Add
        </button>
      </div>
      {list.map((value, index) => (
        <div key={`${label}-${index}`} className="rj-admin__list-row">
          {textarea ? (
            <textarea
              className="rj-admin__textarea"
              rows={3}
              value={value}
              onChange={(e) => {
                const next = [...list];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
          ) : (
            <input
              className="rj-admin__input"
              value={value}
              onChange={(e) => {
                const next = [...list];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
          )}
          <button
            type="button"
            className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
            onClick={() => onChange(list.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
