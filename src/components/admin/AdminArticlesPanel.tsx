import { useMemo, useState } from "react";
import { AdminArticleEditor } from "@/components/admin/AdminArticleEditor";
import { Text } from "@/components/typography/Text";
import {
  deleteAdminArticle,
  duplicateAdminArticle,
  saveAdminArticle,
  setAdminArticleStatus,
  type ArticleWriteInput,
} from "@/lib/admin/articleAdmin.functions";
import type { ArticleCatalogResult, CatalogArticle } from "@/lib/articleCatalog";
import { cn } from "@/lib/utils";

type AdminArticlesPanelProps = {
  catalog: ArticleCatalogResult | null;
  viewsBySlug: Record<string, number>;
  onRefresh: () => Promise<void>;
};

export function AdminArticlesPanel({
  catalog,
  viewsBySlug,
  onRefresh,
}: AdminArticlesPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CatalogArticle | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = catalog?.items ?? [];
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, categoryFilter, query]);

  async function run(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onSave(input: ArticleWriteInput) {
    setSaving(true);
    setError(null);
    try {
      await saveAdminArticle({ data: input });
      setEditing(null);
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (editing !== null) {
    const initial = editing === "new" ? null : editing;
    return (
      <section className="rj-admin__panel">
        <AdminArticleEditor
          initial={initial}
          existingSlugs={items.map((item) => item.slug)}
          saving={saving}
          error={error}
          onCancel={() => {
            setEditing(null);
            setError(null);
          }}
          onSave={onSave}
        />
      </section>
    );
  }

  return (
    <section className="rj-admin__panel">
      <div className="rj-admin__panel-head">
        <div>
          <h2 className="rj-admin__panel-title">Articles</h2>
          <Text muted className="rj-admin__panel-desc">
            {catalog?.source === "supabase"
              ? "Supabase — published posts appear on /resources without a deploy."
              : "Seed fallback. Run the articles migration to edit live posts."}
          </Text>
        </div>
        <button
          type="button"
          className="rj-admin__btn rj-admin__btn--sm"
          onClick={() => setEditing("new")}
          disabled={catalog?.source !== "supabase"}
        >
          New
        </button>
      </div>

      {error ? (
        <p className="rj-admin__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rj-admin__filters">
        <div className="rj-admin__segment">
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={cn(
                "rj-admin__segment-btn",
                statusFilter === status && "is-active",
              )}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "All" : status === "published" ? "Published" : "Draft"}
            </button>
          ))}
        </div>
        <select
          className="rj-admin__input rj-admin__input--compact"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          className="rj-admin__input rj-admin__input--search"
          placeholder="Search title or slug"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rj-admin__table-wrap" style={{ border: 0 }}>
        {filtered.length === 0 ? (
          <Text muted className="rj-admin__empty">
            No articles match these filters.
          </Text>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const busy = busyId === item.id;
                const views = viewsBySlug[item.slug];
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="rj-admin__truncate">{item.title}</span>
                    </td>
                    <td className="rj-admin__mono">{item.slug}</td>
                    <td className="rj-admin__muted">{item.category}</td>
                    <td>
                      <span
                        className={cn(
                          "rj-admin__chip",
                          item.status === "published" && "rj-admin__chip--lead",
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="rj-admin__muted">{item.date}</td>
                    <td style={{ textAlign: "right" }}>
                      {typeof views === "number" ? views.toLocaleString() : "—"}
                    </td>
                    <td>
                      <div className="rj-admin__btn-row">
                        <button
                          type="button"
                          className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                          onClick={() => setEditing(item)}
                          disabled={busy || catalog?.source !== "supabase"}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                          onClick={() =>
                            void run(item.id, async () => {
                              await duplicateAdminArticle({ data: { id: item.id } });
                            })
                          }
                          disabled={busy || catalog?.source !== "supabase"}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                          onClick={() =>
                            void run(item.id, async () => {
                              await setAdminArticleStatus({
                                data: {
                                  id: item.id,
                                  status:
                                    item.status === "published"
                                      ? "draft"
                                      : "published",
                                },
                              });
                            })
                          }
                          disabled={busy || catalog?.source !== "supabase"}
                        >
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          className="rj-admin__btn rj-admin__btn--ghost rj-admin__btn--sm"
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Delete “${item.title}”? This cannot be undone.`,
                              )
                            ) {
                              return;
                            }
                            void run(item.id, async () => {
                              await deleteAdminArticle({ data: { id: item.id } });
                            });
                          }}
                          disabled={busy || catalog?.source !== "supabase"}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
