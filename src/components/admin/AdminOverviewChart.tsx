import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDayPoint, AdminOverview } from "@/lib/admin/overview.functions";

type AdminOverviewChartProps = {
  overview: AdminOverview;
};

function formatConversion(orders: number, visitors: number): string {
  if (visitors <= 0) return "—";
  const pct = (orders / visitors) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function Kpi({
  label,
  value,
  live,
}: {
  label: string;
  value: number | string;
  live?: boolean;
}) {
  return (
    <div>
      <p className="rj-admin__kpi-label">
        {live ? <span className="rj-admin__kpi-dot rj-admin__kpi-dot--live" /> : null}
        {label}
      </p>
      <p className="rj-admin__kpi-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

export function AdminOverviewChart({ overview }: AdminOverviewChartProps) {
  const data: AdminDayPoint[] = overview.series;
  const conversion = formatConversion(overview.orders, overview.visitors);

  return (
    <div>
      <div className="rj-admin__kpi-row">
        <Kpi label="Visitors" value={overview.visitors} />
        <Kpi label="Online" value={overview.online} live />
        <Kpi label="Chats conversations" value={overview.chats} />
        <Kpi label="Orders" value={overview.orders} />
        <Kpi label="Conversion" value={conversion} />
      </div>

      <div className="rj-admin__chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="rjAdminVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#000000" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={28}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke="#000000"
              fill="url(#rjAdminVisitors)"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="online"
              name="Online"
              stroke="#8f8f8f"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="chats"
              name="Chats"
              stroke="#010101"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="Orders"
              fill="#8f8f8f"
              radius={[2, 2, 0, 0]}
              maxBarSize={16}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
