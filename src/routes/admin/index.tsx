import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminOverviewChart } from "@/components/admin/AdminOverviewChart";
import { Text } from "@/components/typography/Text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminLogout } from "@/lib/admin/auth.functions";
import {
  getAdminConversation,
  listAdminConversations,
  listAdminOrders,
  type ConversationSummary,
  type OrderLead,
} from "@/lib/admin/chatAdmin.functions";
import {
  getAdminOverview,
  type AdminOverview,
} from "@/lib/admin/overview.functions";
import { getAnalyticsDashboard } from "@/lib/analytics/analytics.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — UXLAB" },
      { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" },
      { name: "googlebot", content: "noindex,nofollow,noarchive,nosnippet" },
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

  const [rangeDays, setRangeDays] = useState<7 | 30>(30);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsDash | null>(null);
  const [orders, setOrders] = useState<OrderLead[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    [],
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(days: 7 | 30, soft = false) {
    if (!soft) setLoading(true);
    setError(null);
    try {
      const [ov, a, o, conv] = await Promise.all([
        getAdminOverview({ data: { days } }),
        getAnalyticsDashboard(),
        listAdminOrders(),
        listAdminConversations(),
      ]);
      setOverview(ov);
      setAnalytics(a);
      setOrders(o.orders);
      setConversations(conv.conversations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll(rangeDays);

    const POLL_MS = 6_000;
    const intervalId = window.setInterval(() => {
      void loadAll(rangeDays, true);
    }, POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadAll(rangeDays, true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rangeDays]);

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
    <div className="rj-admin__shell">
      <header className="rj-admin__header">
        <div className="rj-admin__brand">
          <Text as="h1" variant="heading" className="rj-admin__title">
            Dashboard
          </Text>
        </div>
        <button
          type="button"
          className="rj-admin__btn rj-admin__btn--ghost"
          onClick={() => void onLogout()}
        >
          Sign out
        </button>
      </header>

      {error ? (
        <p className="rj-admin__error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rj-admin__stack">
          <div className="rj-admin__skeleton" />
          <div className="rj-admin__skeleton" style={{ height: "24rem" }} />
        </div>
      ) : (
        <div className="rj-admin__stack">
          <section className="rj-admin__panel">
            <div className="rj-admin__panel-head">
              <div className="rj-admin__segment">
                {([7, 30] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={cn(
                      "rj-admin__segment-btn",
                      rangeDays === d && "is-active",
                    )}
                    onClick={() => setRangeDays(d)}
                  >
                    Last {d} days
                  </button>
                ))}
              </div>
            </div>
            {overview ? <AdminOverviewChart overview={overview} /> : null}
          </section>

          <section className="rj-admin__panel">
            <Tabs defaultValue="conversations">
              <div className="rj-admin__panel-head rj-admin__panel-head--flush">
                <h2 className="rj-admin__panel-title">Inbox</h2>
                <TabsList className="rj-admin__tabs">
                  <TabsTrigger
                    value="conversations"
                    className="rj-admin__tab"
                  >
                    Conversations
                    <span className="rj-admin__count">
                      {conversations.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="rj-admin__tab">
                    Orders
                    <span className="rj-admin__count">{orders.length}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="conversations">
                <div className="rj-admin__split">
                  <div className="rj-admin__table-wrap">
                    {conversations.length === 0 ? (
                      <Text muted className="rj-admin__empty">
                        No conversations persisted yet.
                      </Text>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Session</th>
                            <th>Preview</th>
                            <th>Msgs</th>
                            <th style={{ textAlign: "right" }}>When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conversations.slice(0, 60).map((c) => (
                            <tr
                              key={c.sessionId}
                              className={cn(
                                "rj-admin__row-btn",
                                selectedSession === c.sessionId && "is-active",
                              )}
                              onClick={() =>
                                setSelectedSession(
                                  selectedSession === c.sessionId
                                    ? null
                                    : c.sessionId,
                                )
                              }
                            >
                              <td>
                                <span className="rj-admin__mono">
                                  {c.sessionId.slice(0, 10)}…
                                </span>
                                {c.hasLead ? (
                                  <span className="rj-admin__chip rj-admin__chip--lead">
                                    lead
                                  </span>
                                ) : null}
                              </td>
                              <td>
                                <span className="rj-admin__truncate">
                                  {c.preview}
                                </span>
                              </td>
                              <td>{c.messageCount}</td>
                              <td
                                className="rj-admin__muted"
                                style={{ textAlign: "right" }}
                              >
                                {formatWhen(c.lastAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="rj-admin__thread">
                    {thread ? (
                      <>
                        <p className="rj-admin__mono">
                          Session {thread.sessionId}
                        </p>
                        {thread.events.map((ev) => (
                          <div key={ev.id} className="rj-admin__thread-item">
                            <div className="rj-admin__thread-meta">
                              <span>
                                {ev.eventType}
                                {ev.role ? ` · ${ev.role}` : ""}
                                {ev.intent ? ` · ${ev.intent}` : ""}
                              </span>
                              <span>{formatWhen(ev.createdAt)}</span>
                            </div>
                            {ev.content ? (
                              <Text variant="body">{ev.content}</Text>
                            ) : null}
                          </div>
                        ))}
                      </>
                    ) : (
                      <Text muted className="rj-admin__empty">
                        Select a conversation to read the thread.
                      </Text>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="rj-admin__table-wrap">
                  {orders.length === 0 ? (
                    <Text muted className="rj-admin__empty">
                      No leads yet. They appear when visitors complete chat
                      flows.
                    </Text>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Type</th>
                          <th>Email</th>
                          <th>Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 80).map((o: OrderLead) => (
                          <tr key={o.id}>
                            <td className="rj-admin__muted">
                              {formatWhen(o.createdAt)}
                            </td>
                            <td>
                              <span className="rj-admin__chip">{o.type}</span>
                            </td>
                            <td>{o.email ?? "—"}</td>
                            <td>
                              <span className="rj-admin__truncate">
                                {o.summary}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <section>
            <Text
              as="h2"
              variant="caption"
              className="rj-admin__section-title"
              style={{
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Page analytics
            </Text>
            {analytics ? (
              <Text
                variant="caption"
                muted
                className="rj-admin__section-note"
              >
                Today: {analytics.sessionsToday} sessions ·{" "}
                {analytics.pageViewsToday} page views
                {analytics.avgDurationSec > 0
                  ? ` · avg ${analytics.avgDurationSec}s on page`
                  : ""}{" "}
                · {analytics.totalEvents} events stored
              </Text>
            ) : null}

            <div className="rj-admin__grid-2">
              <div className="rj-admin__panel">
                <h3 className="rj-admin__panel-title">Top paths today</h3>
                {analytics?.topPaths.length ? (
                  <div
                    className="rj-admin__table-wrap"
                    style={{ marginTop: "var(--rj-space-4)", border: 0 }}
                  >
                    <table>
                      <tbody>
                        {analytics.topPaths.map((p) => (
                          <tr key={p.path}>
                            <td className="rj-admin__mono">{p.path}</td>
                            <td style={{ textAlign: "right" }}>{p.views}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Text muted className="rj-admin__empty">
                    No page views yet today.
                  </Text>
                )}
              </div>

              <div className="rj-admin__panel">
                <h3 className="rj-admin__panel-title">Top countries today</h3>
                {analytics?.topCountries.length ? (
                  <div
                    className="rj-admin__table-wrap"
                    style={{ marginTop: "var(--rj-space-4)", border: 0 }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th style={{ textAlign: "right" }}>Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topCountries.map((c) => (
                          <tr key={c.countryCode ?? c.country}>
                            <td>
                              {c.country}
                              {c.countryCode ? (
                                <span className="rj-admin__muted">
                                  {" "}
                                  · {c.countryCode}
                                </span>
                              ) : null}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {c.sessions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Text muted className="rj-admin__empty">
                    Country data appears as visitors browse.
                  </Text>
                )}
              </div>
            </div>

            <div
              className="rj-admin__grid-2"
              style={{ marginTop: "var(--rj-space-5)" }}
            >
              <div className="rj-admin__panel">
                <h3 className="rj-admin__panel-title">Top cities today</h3>
                {analytics?.topCities.length ? (
                  <div
                    className="rj-admin__table-wrap"
                    style={{ marginTop: "var(--rj-space-4)", border: 0 }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>City</th>
                          <th style={{ textAlign: "right" }}>Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topCities.map((c) => (
                          <tr
                            key={`${c.city}-${c.country ?? "unknown"}`}
                          >
                            <td>
                              {c.city}
                              {c.country ? (
                                <span className="rj-admin__muted">
                                  {" "}
                                  · {c.country}
                                </span>
                              ) : null}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {c.sessions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Text muted className="rj-admin__empty">
                    City data appears as visitors browse.
                  </Text>
                )}
              </div>

              <div className="rj-admin__panel">
                <h3 className="rj-admin__panel-title">Recent activity</h3>
                {analytics?.recent.length ? (
                  <ul
                    className="rj-admin__list"
                    style={{ marginTop: "var(--rj-space-4)" }}
                  >
                    {analytics.recent.map((r) => (
                      <li key={r.id}>
                        <span>
                          {r.name}{" "}
                          <span className="rj-admin__mono">{r.path}</span>
                          <span className="rj-admin__muted">
                            {" "}
                            · {r.location}
                          </span>
                        </span>
                        <span className="rj-admin__muted">
                          {formatWhen(r.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text muted className="rj-admin__empty">
                    Analytics events will show after visitors load pages.
                  </Text>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
