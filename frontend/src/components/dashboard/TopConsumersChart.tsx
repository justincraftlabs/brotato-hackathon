"use client";

import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { useT } from "@/hooks/use-t";
import { formatKwh, formatVnd } from "@/lib/format";
import type { TopConsumer } from "@/lib/types";

interface TopConsumersChartProps {
  consumers: TopConsumer[];
}

const MAX_CONSUMERS = 5;
const FIRST_INDEX = 0;
const HIGH_THRESHOLD = 20;
const BAR_RADIUS = 8;
const BAR_SIZE = 36;
const CHART_HEIGHT = 280;

const GRADIENT_NORMAL_START = "#43A047";
const GRADIENT_NORMAL_END = "#1B5E20";
const GRADIENT_WARN_START = "#FFB74D";
const GRADIENT_WARN_END = "#E65100";

interface ChartItem {
  name: string;
  kwh: number;
  cost: number;
  percent: number;
  isHigh: boolean;
}

function toChartData(consumers: TopConsumer[]): ChartItem[] {
  const limited = consumers.slice(FIRST_INDEX, MAX_CONSUMERS);
  const totalKwh = limited.reduce((sum, c) => sum + c.monthlyKwh, 0);

  return limited.map((c) => {
    const percent = totalKwh > 0 ? (c.monthlyKwh / totalKwh) * 100 : 0;
    return {
      name: c.name,
      kwh: Math.round(c.monthlyKwh * 10) / 10,
      cost: c.monthlyCost,
      percent,
      isHigh: percent > HIGH_THRESHOLD,
    };
  });
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = (payload[FIRST_INDEX] as unknown as { payload: ChartItem }).payload;

  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-bold">{item.name}</p>
      <div className="mt-1.5 flex flex-col gap-0.5 text-xs">
        <span className="text-muted-foreground">
          {formatKwh(item.kwh)}
        </span>
        <span className="text-muted-foreground">
          {formatVnd(item.cost)}
        </span>
        <span className="font-semibold text-primary">
          {Math.round(item.percent)}%
        </span>
      </div>
    </div>
  );
}

export function TopConsumersChart({ consumers }: TopConsumersChartProps) {
  const t = useT();
  const chartData = toChartData(consumers);

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover-glow">
      <div className="px-5 pb-0 pt-5 lg:px-6 lg:pt-6">
        <h3 className="text-base font-bold">{t.DASHBOARD_TOP_CONSUMERS_TITLE}</h3>
      </div>
      <div className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="barGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GRADIENT_NORMAL_START} />
                <stop offset="100%" stopColor={GRADIENT_NORMAL_END} />
              </linearGradient>
              <linearGradient id="barAmber" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GRADIENT_WARN_START} />
                <stop offset="100%" stopColor={GRADIENT_WARN_END} />
              </linearGradient>
            </defs>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fontWeight: 500, fill: "hsl(var(--foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={(props) => <CustomTooltip {...props} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: BAR_RADIUS }}
            />
            <Bar
              dataKey="kwh"
              radius={[0, BAR_RADIUS, BAR_RADIUS, 0]}
              barSize={BAR_SIZE}
              animationDuration={1000}
              animationBegin={100}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.isHigh ? "url(#barAmber)" : "url(#barGreen)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
