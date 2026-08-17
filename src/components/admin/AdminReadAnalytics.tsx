import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Text } from "@/components/typography/Text";
import type { ArticleAnalyticsDashboard } from "@/lib/analytics/articleAnalytics.functions";
import type { CatalogArticle } from "@/lib/articleCatalog";
import { cn } from "@/lib/utils";

type AdminReadAnalyticsProps = {
  dashboard: ArticleAnalyticsDashboard | null;
  articles: CatalogArticle[];
  rangeDays: 7 | 30 | 90;
  onRange: (days: 7 | 30 | 90) => void;
};

function titleFor(slug: string, articles: CatalogArticle[]): string {
  return articles.find((item) => item.slug === slug)?.title ?? slug;
}

function formatDuration(ms: number | null): string {
  if (ms == null || ms < 0) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

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

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="rj-admin__kpi-label">{label}</p>
      <p className="rj-admin__kpi-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

export function AdminReadAnalytics({
  dashboard,
  articles,
  rangeDays,
  onRange,
}: AdminReadAnalyticsProps) {
  return (
    <div className="rj-admin__stack">
      <section className="rj-admin__panel">
        <div className="rj-admin__panel-head">
          <div>
            <h2 className="rj-admin__panel-title">Read analytics</h2>
            <Text muted className="rj-admin__panel-desc">
              Anonymous sessions on article pages. No names or IP addresses.
            </Text>
          </div>
          <div className="rj-admin__segment">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={cn(
                  "rj-admin__segment-btn",
                  rangeDays === d && "is-active",
                )}
                onClick={() => onRange(d)}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {dashboard ? (
          <div className="rj-admin__kpi-row">
            <Kpi label="Views" value={dashboard.kpis.views} />
            <Kpi label="Unique sessions" value={dashboard.kpis.uniqueSessions} />
            <Kpi
              label="Avg time on article"
              value={
                dashboard.kpis.avgDurationSec > 0
                  ? `${dashboard.kpis.avgDurationSec}s`
                  : "—"
              }
            />
            <Kpi
              label="Avg scroll depth"
              value={
                dashboard.kpis.avgScrollPct > 0
                  ? `${dashboard.kpis.avgScrollPct}%`
                  : "—"
              }
            />
          </div>
        ) : (
          <Text muted className="rj-admin__empty">
            Loading analytics…
          </Text>
        )}

        {dashboard && dashboard.source === "empty" ? (
          <Text muted className="rj-admin__section-note">
            No analytics_events yet. Run the analytics migration, then open an
            article to start collecting reads.
          </Text>
        ) : null}

        {dashboard?.series.length ? (
          <div className="rj-admin__chart" style={{ marginTop: "var(--rj-space-5)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboard.series}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.12)",
                    fontFamily: "var(--rj-font-sans)",
                    fontSize: "1.3rem",
                    fontWeight: 300,
                  }}
                />
                <Bar
                  dataKey="views"
                  name="Views"
                  fill="#000000"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </section>

      <div className="rj-admin__grid-2">
        <section className="rj-admin__panel">
          <h3 className="rj-admin__panel-title">Top articles</h3>
          {dashboard?.topArticles.length ? (
            <div
              className="rj-admin__table-wrap"
              style={{ marginTop: "var(--rj-space-4)", border: 0 }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th style={{ textAlign: "right" }}>Views</th>
                    <th style={{ textAlign: "right" }}>Readers</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topArticles.map((row) => (
                    <tr key={row.slug}>
                      <td>
                        <span className="rj-admin__truncate">
                          {titleFor(row.slug, articles)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>{row.views}</td>
                      <td style={{ textAlign: "right" }}>
                        {row.uniqueSessions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Text muted className="rj-admin__empty">
              No article views in this range.
            </Text>
          )}
        </section>

        <section className="rj-admin__panel">
          <h3 className="rj-admin__panel-title">Devices</h3>
          {dashboard?.devices.length ? (
            <div
              className="rj-admin__table-wrap"
              style={{ marginTop: "var(--rj-space-4)", border: 0 }}
            >
              <table>
                <tbody>
                  {dashboard.devices.map((row) => (
                    <tr key={row.device}>
                      <td>{row.device}</td>
                      <td style={{ textAlign: "right" }}>{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Text muted className="rj-admin__empty">
              Device split appears after article reads.
            </Text>
          )}
        </section>
      </div>

      <div className="rj-admin__grid-2">
        <section className="rj-admin__panel">
          <h3 className="rj-admin__panel-title">Referrers</h3>
          {dashboard?.referrers.length ? (
            <div
              className="rj-admin__table-wrap"
              style={{ marginTop: "var(--rj-space-4)", border: 0 }}
            >
              <table>
                <tbody>
                  {dashboard.referrers.map((row) => (
                    <tr key={row.key}>
                      <td className="rj-admin__mono">{row.key}</td>
                      <td style={{ textAlign: "right" }}>{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Text muted className="rj-admin__empty">
              Referrers appear as readers arrive.
            </Text>
          )}
        </section>

        <section className="rj-admin__panel">
          <h3 className="rj-admin__panel-title">UTM source</h3>
          {dashboard?.utmSources.length ? (
            <div
              className="rj-admin__table-wrap"
              style={{ marginTop: "var(--rj-space-4)", border: 0 }}
            >
              <table>
                <tbody>
                  {dashboard.utmSources.map((row) => (
                    <tr key={row.key}>
                      <td className="rj-admin__mono">{row.key}</td>
                      <td style={{ textAlign: "right" }}>{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Text muted className="rj-admin__empty">
              UTM tags show when campaign links are used.
            </Text>
          )}
        </section>
      </div>

      {dashboard?.chatFollow.length ? (
        <section className="rj-admin__panel">
          <h3 className="rj-admin__panel-title">After reading</h3>
          <Text muted className="rj-admin__panel-desc">
            Summarize / Let&apos;s talk chips from the same article path.
          </Text>
          <div
            className="rj-admin__table-wrap"
            style={{ marginTop: "var(--rj-space-4)", border: 0 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th style={{ textAlign: "right" }}>Summarize</th>
                  <th style={{ textAlign: "right" }}>Let&apos;s talk</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.chatFollow.map((row) => (
                  <tr key={row.slug}>
                    <td>
                      <span className="rj-admin__truncate">
                        {titleFor(row.slug, articles)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{row.summarize}</td>
                    <td style={{ textAlign: "right" }}>{row.letsTalk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rj-admin__panel">
        <h3 className="rj-admin__panel-title">Recent sessions</h3>
        {dashboard?.recent.length ? (
          <div
            className="rj-admin__table-wrap"
            style={{ marginTop: "var(--rj-space-4)", border: 0 }}
          >
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Article</th>
                  <th>Device</th>
                  <th>From</th>
                  <th>Time</th>
                  <th style={{ textAlign: "right" }}>Scroll</th>
                  <th>Session</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent.map((row, index) => (
                  <tr key={`${row.sessionId}-${row.articleSlug}-${index}`}>
                    <td className="rj-admin__muted">{formatWhen(row.at)}</td>
                    <td>
                      <span className="rj-admin__truncate">
                        {titleFor(row.articleSlug, articles)}
                      </span>
                    </td>
                    <td>{row.device ?? "—"}</td>
                    <td className="rj-admin__mono">
                      {row.country ? `${row.referrer} · ${row.country}` : row.referrer}
                    </td>
                    <td>{formatDuration(row.durationMs)}</td>
                    <td style={{ textAlign: "right" }}>
                      {row.scrollPct != null ? `${row.scrollPct}%` : "—"}
                    </td>
                    <td className="rj-admin__mono">{row.sessionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Text muted className="rj-admin__empty">
            Sessions appear after visitors open articles.
          </Text>
        )}
      </section>
    </div>
  );
}
