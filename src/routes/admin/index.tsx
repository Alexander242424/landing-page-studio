import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminLogout } from "@/lib/admin/auth.functions";
import {
  getAdminConversation,
  getAdminOverviewCounts,
  listAdminConversations,
  listAdminOrders,
  type ConversationSummary,
  type OrderLead,
} from "@/lib/admin/chatAdmin.functions";
import { getAnalyticsDashboard } from "@/lib/analytics/analytics.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — UXLAB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type AnalyticsDash = Awaited<ReturnType<typeof getAnalyticsDashboard>>;
type ConversationDetail = Awaited<ReturnType<typeof getAdminConversation>>;

function formatWhen(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { admin } = Route.useRouteContext();

  const [analytics, setAnalytics] = useState<AnalyticsDash | null>(null);
  const [counts, setCounts] = useState<{
    activeChats: number;
    newLeads: number;
  } | null>(null);
  const [orders, setOrders] = useState<OrderLead[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    [],
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [a, c, o, conv] = await Promise.all([
          getAnalyticsDashboard(),
          getAdminOverviewCounts(),
          listAdminOrders(),
          listAdminConversations(),
        ]);
        if (cancelled) return;
        setAnalytics(a);
        setCounts({ activeChats: c.activeChats, newLeads: c.newLeads });
        setOrders(o.orders);
        setConversations(conv.conversations);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load admin data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSession) {
      setThread(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await getAdminConversation({
          data: { sessionId: selectedSession },
        });
        if (!cancelled) setThread(detail);
      } catch {
        if (!cancelled) setThread(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSession]);

  async function onLogout() {
    await adminLogout();
    await navigate({ to: "/admin/login" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e7eb] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6b7280]">
            UXLAB Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Signed in as {admin?.email ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="border border-[#d1d5db] bg-white px-3 py-1.5 text-sm text-[#374151] hover:bg-[#f9fafb]"
        >
          Sign out
        </button>
      </header>

      {error ? (
        <p className="mt-6 text-sm text-[#b91c1c]" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-[#6b7280]">Loading…</p>
      ) : (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sessions today"
              value={analytics?.sessionsToday ?? 0}
            />
            <StatCard
              label="Page views today"
              value={analytics?.pageViewsToday ?? 0}
            />
            <StatCard label="Active chats today" value={counts?.activeChats ?? 0} />
            <StatCard label="New leads today" value={counts?.newLeads ?? 0} />
          </section>

          {analytics && analytics.avgDurationSec > 0 ? (
            <p className="mt-3 text-xs text-[#6b7280]">
              Avg time on page (today): {analytics.avgDurationSec}s ·{" "}
              {analytics.totalEvents} analytics events stored
            </p>
          ) : null}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#374151]">
                Orders / Leads
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                Contact, CRO audit, newsletter, booking intents from chat
                persistence.
              </p>
              <div className="mt-3 overflow-hidden border border-[#e5e7eb] bg-white">
                {orders.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-[#6b7280]">
                    No leads yet. They appear when visitors complete chat flows.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase tracking-wide text-[#6b7280]">
                      <tr>
                        <th className="px-3 py-2 font-medium">When</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 40).map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-[#f3f4f6] last:border-0"
                        >
                          <td className="whitespace-nowrap px-3 py-2 text-[#6b7280]">
                            {formatWhen(o.createdAt)}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-block bg-[#f3f4f6] px-1.5 py-0.5 text-xs">
                              {o.type}
                            </span>
                          </td>
                          <td className="max-w-[220px] truncate px-3 py-2">
                            {o.email ?? o.summary}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#374151]">
                Conversations
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                Ask-chat sessions from `.data/chat-events.jsonl`.
              </p>
              <div className="mt-3 overflow-hidden border border-[#e5e7eb] bg-white">
                {conversations.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-[#6b7280]">
                    No conversations persisted yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f3f4f6]">
                    {conversations.slice(0, 30).map((c) => (
                      <li key={c.sessionId}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSession(
                              selectedSession === c.sessionId
                                ? null
                                : c.sessionId,
                            )
                          }
                          className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-[#f9fafb] ${
                            selectedSession === c.sessionId
                              ? "bg-[#f3f4f6]"
                              : ""
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-[#6b7280]">
                              {c.sessionId.slice(0, 8)}…
                            </span>
                            <span className="text-xs text-[#6b7280]">
                              {formatWhen(c.lastAt)}
                            </span>
                          </span>
                          <span className="truncate text-[#111827]">
                            {c.preview}
                          </span>
                          <span className="text-xs text-[#6b7280]">
                            {c.messageCount} msgs
                            {c.hasLead ? " · lead" : ""}
                            {c.intents.length
                              ? ` · ${c.intents.join(", ")}`
                              : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {thread ? (
                <div className="mt-3 max-h-96 overflow-y-auto border border-[#e5e7eb] bg-white p-3">
                  <p className="mb-2 font-mono text-xs text-[#6b7280]">
                    Session {thread.sessionId}
                  </p>
                  <ul className="space-y-2">
                    {thread.events.map((ev) => (
                      <li
                        key={ev.id}
                        className="rounded border border-[#f3f4f6] px-2 py-1.5 text-xs"
                      >
                        <div className="flex justify-between gap-2 text-[#6b7280]">
                          <span>
                            {ev.eventType}
                            {ev.role ? ` · ${ev.role}` : ""}
                            {ev.intent ? ` · ${ev.intent}` : ""}
                          </span>
                          <span>{formatWhen(ev.createdAt)}</span>
                        </div>
                        {ev.content ? (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-[#111827]">
                            {ev.content}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#374151]">
              Page analytics
            </h2>
            <div className="mt-3 grid gap-6 lg:grid-cols-2">
              <div className="border border-[#e5e7eb] bg-white">
                <p className="border-b border-[#e5e7eb] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Top paths today
                </p>
                {analytics?.topPaths.length ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {analytics.topPaths.map((p) => (
                        <tr
                          key={p.path}
                          className="border-b border-[#f3f4f6] last:border-0"
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {p.path}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {p.views}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-3 py-6 text-sm text-[#6b7280]">
                    No page views yet today.
                  </p>
                )}
              </div>

              <div className="border border-[#e5e7eb] bg-white">
                <p className="border-b border-[#e5e7eb] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Recent activity
                </p>
                {analytics?.recent.length ? (
                  <ul className="max-h-72 divide-y divide-[#f3f4f6] overflow-y-auto text-sm">
                    {analytics.recent.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <span>
                          <span className="font-medium">{r.name}</span>{" "}
                          <span className="font-mono text-xs text-[#6b7280]">
                            {r.path}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-[#6b7280]">
                          {formatWhen(r.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-6 text-sm text-[#6b7280]">
                    Analytics events will show after visitors load pages.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#e5e7eb] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
