"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatVnd } from "@/lib/format";

interface MonthlyBillProjectionProps {
  totalMonthlyCost: number;
}

const DAYS_IN_MONTH = 30;
const MIN_DAY = 1;

interface DayPoint {
  day: number;
  actual: number | null;
  projected: number | null;
}

function buildProjectionData(totalMonthlyCost: number, today: number): DayPoint[] {
  const safeDays = Math.max(today, MIN_DAY);
  const dailyRate = totalMonthlyCost / safeDays;

  return Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const day = i + 1;
    return {
      day,
      actual: day <= today ? Math.round(dailyRate * day) : null,
      projected: day >= today ? Math.round(totalMonthlyCost + dailyRate * (day - today)) : null,
    };
  });
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null; name: string }>;
  label?: number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = (payload[0]?.value ?? payload[1]?.value) as number | null;
  if (val === null || val === undefined) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-muted-foreground">Ngày {label}</p>
      <p className="text-sm font-bold">{formatVnd(val)}</p>
    </div>
  );
}

const CHART_MIN_HEIGHT = 200;

export function MonthlyBillProjection({ totalMonthlyCost }: MonthlyBillProjectionProps) {
  const today = new Date().getDate();
  const safeDays = Math.max(today, MIN_DAY);
  const dailyRate = totalMonthlyCost / safeDays;
  const projectedTotal = Math.round(dailyRate * DAYS_IN_MONTH);
  const daysLeft = DAYS_IN_MONTH - today;
  const data = buildProjectionData(totalMonthlyCost, today);

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-0 lg:px-5 lg:pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold">Dự báo hóa đơn tháng này</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground">Dự kiến cuối tháng</p>
            <p className="text-sm font-bold text-primary">{formatVnd(projectedTotal)}</p>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ngày {today}/{DAYS_IN_MONTH} · {formatVnd(totalMonthlyCost)} đã dùng · còn {daysLeft} ngày
        </p>
      </div>

      {/* Chart */}
      <div
        className="flex-1 px-2 pb-4 pt-2 lg:px-3 lg:pb-5"
        style={{ minHeight: CHART_MIN_HEIGHT }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 68% 54%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(142 68% 54%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 88% 55%)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="hsl(38 88% 55%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.25}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis hide />

            {/* "Today" marker */}
            <ReferenceLine
              x={today}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 2"
              strokeOpacity={0.5}
            />

            <Tooltip
              content={(p) => (
                <ChartTooltip
                  active={p.active}
                  payload={p.payload as Array<{ value: number | null; name: string }>}
                  label={p.label as number}
                />
              )}
            />

            {/* Actual spend (solid green) */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="hsl(142 68% 54%)"
              strokeWidth={2}
              fill="url(#gradActual)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(142 68% 54%)" }}
              isAnimationActive
              animationDuration={900}
            />

            {/* Projected spend (dashed amber) */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="hsl(38 88% 55%)"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradProjected)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(38 88% 55%)" }}
              isAnimationActive
              animationDuration={900}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="shrink-0 flex gap-4 px-4 pb-3 lg:px-5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-block h-2 w-5 rounded-full bg-primary" />
          Đã dùng
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className="inline-block h-0.5 w-5 rounded-full bg-amber-400"
            style={{ borderTop: "2px dashed hsl(38 88% 55%)" }}
          />
          Dự báo
        </div>
      </div>
    </div>
  );
}
