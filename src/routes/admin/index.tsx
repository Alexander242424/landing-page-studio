import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          setError(
            e instanceof Error ? e.message : "Failed to load admin data",
          );
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
    <div className="mx-auto max-w-6xl px-[var(--rj-grid-margin)] py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="space-y-3">
          <Logo className="rj-logo text-[var(--rj-black)]" href="/" />
          <div>
            <p className="text-[1.1rem] font-light uppercase tracking-[0.14em] text-[var(--rj-fg-muted)]">
              Admin
            </p>
            <h1 className="mt-1 text-[2.8rem] font-light tracking-[-0.03em] text-[var(--rj-black)]">
              Dashboard
            </h1>
            <p className="mt-1 text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
              Signed in as {admin?.email ?? "—"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void onLogout()}
          className="h-11 rounded-full border-[var(--rj-border)] bg-[var(--rj-white)] px-6 text-[1.4rem] font-light text-[var(--rj-fg)] shadow-none hover:bg-[var(--rj-surface)]"
        >
          Sign out
        </Button>
      </header>

      <Separator className="bg-[var(--rj-border)]" />

      {error ? (
        <Alert
          variant="destructive"
          className="mt-8 rounded-[4px] border-red-200 bg-red-50 text-[1.4rem] font-light"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[4px] bg-black/5" />
          ))}
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sessions today"
              value={analytics?.sessionsToday ?? 0}
            />
            <StatCard
              label="Page views today"
              value={analytics?.pageViewsToday ?? 0}
            />
            <StatCard
              label="Active chats today"
              value={counts?.activeChats ?? 0}
            />
            <StatCard label="New leads today" value={counts?.newLeads ?? 0} />
          </section>

          {analytics && analytics.avgDurationSec > 0 ? (
            <p className="mt-4 text-[1.2rem] font-light text-[var(--rj-fg-muted)]">
              Avg time on page (today): {analytics.avgDurationSec}s ·{" "}
              {analytics.totalEvents} analytics events stored
            </p>
          ) : null}

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-[1.2rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg)]">
                  Orders / Leads
                </CardTitle>
                <CardDescription className="text-[1.3rem] font-light">
                  Contact, CRO audit, newsletter, booking intents from chat.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <p className="px-6 py-8 text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
                    No leads yet. They appear when visitors complete chat flows.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[var(--rj-border)] hover:bg-transparent">
                        <TableHead className="h-10 px-6 text-[1.1rem] font-light uppercase tracking-wide text-[var(--rj-fg-muted)]">
                          When
                        </TableHead>
                        <TableHead className="h-10 px-3 text-[1.1rem] font-light uppercase tracking-wide text-[var(--rj-fg-muted)]">
                          Type
                        </TableHead>
                        <TableHead className="h-10 px-6 text-[1.1rem] font-light uppercase tracking-wide text-[var(--rj-fg-muted)]">
                          Detail
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 40).map((o: OrderLead) => (
                        <TableRow
                          key={o.id}
                          className="border-[var(--rj-border)]"
                        >
                          <TableCell className="whitespace-nowrap px-6 py-3 text-[1.3rem] font-light text-[var(--rj-fg-muted)]">
                            {formatWhen(o.createdAt)}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <Badge
                              variant="secondary"
                              className="rounded-[4px] border-0 bg-black/[0.06] text-[1.1rem] font-light text-[var(--rj-fg)] shadow-none"
                            >
                              {o.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate px-6 py-3 text-[1.4rem] font-light">
                            {o.email ?? o.summary}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-[1.2rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg)]">
                  Conversations
                </CardTitle>
                <CardDescription className="text-[1.3rem] font-light">
                  Ask-chat sessions from on-site chat persistence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {conversations.length === 0 ? (
                  <p className="py-6 text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
                    No conversations persisted yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--rj-border)] rounded-[4px] border border-[var(--rj-border)]">
                    {conversations.slice(0, 30).map((c: ConversationSummary) => (
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
                          className={cn(
                            "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-black/[0.03]",
                            selectedSession === c.sessionId && "bg-black/[0.05]",
                          )}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[1.1rem] text-[var(--rj-fg-muted)]">
                              {c.sessionId.slice(0, 8)}…
                            </span>
                            <span className="text-[1.1rem] font-light text-[var(--rj-fg-muted)]">
                              {formatWhen(c.lastAt)}
                            </span>
                          </span>
                          <span className="truncate text-[1.4rem] font-light text-[var(--rj-black)]">
                            {c.preview}
                          </span>
                          <span className="text-[1.1rem] font-light text-[var(--rj-fg-muted)]">
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

                {thread ? (
                  <ScrollArea className="h-80 rounded-[4px] border border-[var(--rj-border)]">
                    <div className="space-y-3 p-4">
                      <p className="font-mono text-[1.1rem] text-[var(--rj-fg-muted)]">
                        Session {thread.sessionId}
                      </p>
                      {thread.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-[4px] border border-[var(--rj-border)] px-3 py-2"
                        >
                          <div className="flex justify-between gap-2 text-[1.1rem] font-light text-[var(--rj-fg-muted)]">
                            <span>
                              {ev.eventType}
                              {ev.role ? ` · ${ev.role}` : ""}
                              {ev.intent ? ` · ${ev.intent}` : ""}
                            </span>
                            <span>{formatWhen(ev.createdAt)}</span>
                          </div>
                          {ev.content ? (
                            <p className="mt-1.5 whitespace-pre-wrap text-[1.4rem] font-light text-[var(--rj-black)]">
                              {ev.content}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <section className="mt-12">
            <h2 className="text-[1.2rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg)]">
              Page analytics
            </h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <Card className="rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-[1.2rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg-muted)]">
                    Top paths today
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {analytics?.topPaths.length ? (
                    <Table>
                      <TableBody>
                        {analytics.topPaths.map((p) => (
                          <TableRow
                            key={p.path}
                            className="border-[var(--rj-border)]"
                          >
                            <TableCell className="px-6 py-3 font-mono text-[1.2rem]">
                              {p.path}
                            </TableCell>
                            <TableCell className="px-6 py-3 text-right text-[1.4rem] font-light tabular-nums">
                              {p.views}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="px-6 py-8 text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
                      No page views yet today.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-[1.2rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg-muted)]">
                    Recent activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {analytics?.recent.length ? (
                    <ScrollArea className="h-72">
                      <ul className="divide-y divide-[var(--rj-border)]">
                        {analytics.recent.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between gap-2 px-6 py-3 text-[1.4rem] font-light"
                          >
                            <span>
                              <span className="text-[var(--rj-black)]">
                                {r.name}
                              </span>{" "}
                              <span className="font-mono text-[1.1rem] text-[var(--rj-fg-muted)]">
                                {r.path}
                              </span>
                            </span>
                            <span className="shrink-0 text-[1.1rem] text-[var(--rj-fg-muted)]">
                              {formatWhen(r.timestamp)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  ) : (
                    <p className="px-6 py-8 text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
                      Analytics events will show after visitors load pages.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
      <CardContent className="p-5">
        <p className="text-[1.1rem] font-light uppercase tracking-[0.08em] text-[var(--rj-fg-muted)]">
          {label}
        </p>
        <p className="mt-2 text-[3.2rem] font-light tabular-nums tracking-[-0.03em] text-[var(--rj-black)]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
