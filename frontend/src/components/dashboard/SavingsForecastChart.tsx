"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { useT } from "@/hooks/use-t";
import { formatVnd } from "@/lib/format";

interface SavingsForecastChartProps {
  monthlyCost: number;
}

interface ForecastDataPoint {
  label: string;
  months: number;
  rate10: number;
  rate20: number;
  rate30: number;
}

const TIME_PERIODS_MONTHS = [1, 3, 6, 12, 24, 36, 60] as const;
const MILLION = 1_000_000;
const RATE_10 = 0.1;
const RATE_20 = 0.2;
const RATE_30 = 0.3;
const CHART_HEIGHT = 280;
const MONTHS_PER_YEAR = 12;
const FIVE_YEAR_MONTHS = 60;

const COLOR_10 = "#66BB6A";
const COLOR_20 = "#1B5E20";
const COLOR_30 = "#EF9F27";

function toLabel(months: number, monthShort: string, yearShort: string): string {
  if (months < MONTHS_PER_YEAR) {
    return `${months}${monthShort}`;
  }
  return `${months / MONTHS_PER_YEAR}${yearShort}`;
}

function buildForecastData(
  monthlyCost: number,
  monthShort: string,
  yearShort: string
): ForecastDataPoint[] {
  return TIME_PERIODS_MONTHS.map((months) => ({
    label: toLabel(months, monthShort, yearShort),
    months,
    rate10: (monthlyCost * RATE_10 * months) / MILLION,
    rate20: (monthlyCost * RATE_20 * months) / MILLION,
    rate30: (monthlyCost * RATE_30 * months) / MILLION,
  }));
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-bold text-muted-foreground">{label}</p>
      {(payload as unknown as TooltipPayloadEntry[]).map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.name}</span>
          <span className="ml-auto text-xs font-bold">
            {formatVnd(entry.value * MILLION)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SavingsForecastChart({ monthlyCost }: SavingsForecastChartProps) {
  const t = useT();
  const data = buildForecastData(
    monthlyCost,
    t.CHART_FORECAST_MONTH_SHORT,
    t.CHART_FORECAST_YEAR_SHORT
  );

  const fiveYearAt20 = (monthlyCost * RATE_20 * FIVE_YEAR_MONTHS) / MILLION;

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
      <div className="shrink-0 px-4 pb-0 pt-4 lg:px-5 lg:pt-5">
        <h3 className="text-sm font-bold">{t.CHART_FORECAST_TITLE}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.CHART_FORECAST_5Y_HINT}{" "}
          <span className="font-bold text-primary">
            {formatVnd(fiveYearAt20 * MILLION)}
          </span>
        </p>
      </div>
      <div className="flex-1 flex flex-col px-4 pb-4 pt-3 lg:px-5 lg:pb-5">
        <div className="flex-1" style={{ minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grad10" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_10} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLOR_10} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad20" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_20} stopOpacity={0.5} />
                <stop offset="100%" stopColor={COLOR_20} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad30" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_30} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLOR_30} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              stroke="hsl(var(--border))"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => `${val.toFixed(1)}`}
              width={36}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} />} />
            <Area
              type="monotone"
              dataKey="rate10"
              name={t.CHART_FORECAST_10}
              stroke={COLOR_10}
              strokeWidth={3}
              fill="url(#grad10)"
              dot={false}
              activeDot={{ r: 6, stroke: COLOR_10, strokeWidth: 2.5, fill: "white" }}
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="rate20"
              name={t.CHART_FORECAST_20}
              stroke={COLOR_20}
              strokeWidth={3.5}
              fill="url(#grad20)"
              dot={false}
              activeDot={{ r: 7, stroke: COLOR_20, strokeWidth: 2.5, fill: "white" }}
              animationDuration={1200}
              animationBegin={200}
            />
            <Area
              type="monotone"
              dataKey="rate30"
              name={t.CHART_FORECAST_30}
              stroke={COLOR_30}
              strokeWidth={3}
              fill="url(#grad30)"
              dot={false}
              activeDot={{ r: 6, stroke: COLOR_30, strokeWidth: 2.5, fill: "white" }}
              animationDuration={1200}
              animationBegin={400}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>

        {/* Legend — pinned to bottom */}
        <div className="mt-3 shrink-0 flex justify-center gap-5">
          {[
            { color: COLOR_10, label: t.CHART_FORECAST_10 },
            { color: COLOR_20, label: t.CHART_FORECAST_20 },
            { color: COLOR_30, label: t.CHART_FORECAST_30 },
          ].map(({ color, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <div
                className="h-1.5 w-5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
