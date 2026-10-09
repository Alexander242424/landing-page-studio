import type { ToolChartSeries } from "@/lib/toolverse";

type ToolPopupChartProps = {
  chart: ToolChartSeries;
};

function formatValue(value: number, unit?: string) {
  const base = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return unit ? `${base}${unit}` : base;
}

export function ToolPopupChart({ chart }: ToolPopupChartProps) {
  const max = Math.max(...chart.points.map((point) => point.value), 1);

  return (
    <figure className="rj-tool-popup__chart" aria-label={chart.caption}>
      <figcaption className="rj-case-popup__label">{chart.caption}</figcaption>
      <div className="rj-tool-popup__chart-bars">
        {chart.points.map((point) => (
          <div key={point.label} className="rj-tool-popup__chart-row">
            <span className="rj-tool-popup__chart-label">{point.label}</span>
            <div
              className="rj-tool-popup__chart-track"
              aria-hidden="true"
            >
              <div
                className="rj-tool-popup__chart-bar"
                style={{ width: `${(point.value / max) * 100}%` }}
              />
            </div>
            <span className="rj-tool-popup__chart-value">
              {formatValue(point.value, chart.unit)}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
