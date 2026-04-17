"use client";

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { CO2_EMISSION_FACTOR } from "@/lib/constants";
import { formatCo2 } from "@/lib/format";
import type { TopConsumer } from "@/lib/types";

interface CarbonWaterfallChartProps {
  co2TotalKg: number;
  consumers: TopConsumer[];
}

interface ChartItem {
  name: string;
  co2Kg: number;
  percent: number;
}

const CHART_HEIGHT = 280;
const MAX_ITEMS = 6;
const FIRST_INDEX = 0;
const BAR_RADIUS = 8;
const BAR_SIZE = 36;
const ROUND_FACTOR = 10;
const Y_AXIS_WIDTH = 110;

const GRADIENT_COLORS = [
  { start: "#C62828", end: "#EF5350" },
  { start: "#D84315", end: "#FF7043" },
  { start: "#E65100", end: "#FF9800" },
  { start: "#EF6C00", end: "#FFB74D" },
  { start: "#F9A825", end: "#FFEE58" },
  { start: "#558B2F", end: "#8BC34A" },
];

function round1(value: number): number {
  return Math.round(value * ROUND_FACTOR) / ROUND_FACTOR;
}

function toChartData(
  consumers: TopConsumer[],
  co2TotalKg: number,
  otherLabel: string
): ChartItem[] {
  const sorted = [...consumers].sort((a, b) => b.monthlyKwh - a.monthlyKwh);
  const top = sorted.slice(FIRST_INDEX, MAX_ITEMS);

  const items: ChartItem[] = top.map((c) => {
    const co2Kg = round1(c.monthlyKwh * CO2_EMISSION_FACTOR);
    return {
      name: c.name,
      co2Kg,
      percent: co2TotalKg > 0 ? (co2Kg / co2TotalKg) * 100 : 0,
    };
  });

  const itemsTotal = items.reduce((sum, item) => sum + item.co2Kg, 0);
  const remaining = round1(co2TotalKg - itemsTotal);
  if (remaining > 0.5) {
    items.push({
      name: otherLabel,
      co2Kg: remaining,
      percent: co2TotalKg > 0 ? (remaining / co2TotalKg) * 100 : 0,
    });
  }

  return items;
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = (payload[FIRST_INDEX] as unknown as { payload: ChartItem }).payload;

  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-bold">{item.name}</p>
      <div className="mt-1.5 flex flex-col gap-0.5 text-xs">
        <span className="text-muted-foreground">
          {formatCo2(item.co2Kg)}
        </span>
        <span className="font-semibold text-primary">
          {Math.round(item.percent)}%
        </span>
      </div>
    </div>
  );
}

export function CarbonWaterfallChart({
  co2TotalKg,
  consumers,
}: CarbonWaterfallChartProps) {
  const t = useT();
  const chartData = toChartData(consumers, co2TotalKg, t.CHART_WASTE_OTHER);

  if (!chartData.length) return null;

  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_8px_20px_-4px_rgba(0,0,0,0.04)]">
      <CardHeader className="px-5 pb-0 pt-5 lg:px-6 lg:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            {t.CHART_CARBON_TITLE}
          </CardTitle>
          <p className="text-sm font-black text-primary">
            {formatCo2(co2TotalKg)}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.CHART_CARBON_UNIT}
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <defs>
              {GRADIENT_COLORS.map((color, index) => (
                <linearGradient
                  key={`carbon-grad-${index}`}
                  id={`carbonGrad${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={color.start} />
                  <stop offset="100%" stopColor={color.end} />
                </linearGradient>
              ))}
            </defs>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={Y_AXIS_WIDTH}
              tick={{
                fontSize: 12,
                fontWeight: 500,
                fill: "hsl(var(--foreground))",
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={(props) => <CustomTooltip {...props} />}
              cursor={{
                fill: "hsl(var(--muted))",
                opacity: 0.4,
                radius: BAR_RADIUS,
              }}
            />
            <Bar
              dataKey="co2Kg"
              radius={[0, BAR_RADIUS, BAR_RADIUS, 0]}
              barSize={BAR_SIZE}
              animationDuration={1000}
              animationBegin={100}
              label={{
                position: "right",
                fontSize: 11,
                fontWeight: 700,
                fill: "hsl(var(--muted-foreground))",
                formatter: (value: unknown) => `${Math.round((Number(value) / co2TotalKg) * 100)}%`,
              }}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#carbonGrad${index % GRADIENT_COLORS.length})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
