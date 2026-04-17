"use client";

import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Props as LabelProps } from "recharts/types/component/Label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DASHBOARD_LABELS,
  HIGH_CONSUMER_THRESHOLD_PERCENT,
  TOP_CONSUMERS_CHART_HEIGHT,
} from "@/lib/constants";
import { formatPercent } from "@/lib/format";
import type { TopConsumer } from "@/lib/types";

interface TopConsumersChartProps {
  consumers: TopConsumer[];
}

const PRIMARY_GREEN = "#3B8C2A";
const ACCENT_AMBER = "#EF9F27";
const MAX_CONSUMERS = 5;
const FIRST_CONSUMER_INDEX = 0;

interface ChartDataItem {
  name: string;
  kwh: number;
  percent: number;
  percentLabel: string;
  isHighConsumer: boolean;
}

function toChartData(consumers: TopConsumer[]): ChartDataItem[] {
  const limited = consumers.slice(FIRST_CONSUMER_INDEX, MAX_CONSUMERS);
  const totalKwh = limited.reduce((sum, c) => sum + c.monthlyKwh, 0);

  return limited.map((c) => {
    const percent = totalKwh > 0 ? (c.monthlyKwh / totalKwh) * 100 : 0;
    return {
      name: c.name,
      kwh: Math.round(c.monthlyKwh * 10) / 10,
      percent,
      percentLabel: formatPercent(percent),
      isHighConsumer: percent > HIGH_CONSUMER_THRESHOLD_PERCENT,
    };
  });
}

function renderPercentLabel(props: LabelProps): ReactElement {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const value = String(props.value ?? "");

  return (
    <text
      x={x + width + 4}
      y={y + height / 2}
      fill="currentColor"
      textAnchor="start"
      dominantBaseline="middle"
      className="text-xs fill-muted-foreground"
    >
      {value}
    </text>
  );
}

export function TopConsumersChart({ consumers }: TopConsumersChartProps) {
  const chartData = toChartData(consumers);

  return (
    <Card>
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">
          {DASHBOARD_LABELS.TOP_CONSUMERS_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <ResponsiveContainer width="100%" height={TOP_CONSUMERS_CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="kwh" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="percentLabel"
                content={renderPercentLabel}
              />
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.isHighConsumer ? ACCENT_AMBER : PRIMARY_GREEN}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
