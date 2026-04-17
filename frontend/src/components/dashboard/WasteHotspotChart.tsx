"use client";

import { useCallback, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import { useT } from "@/hooks/use-t";
import { formatVnd } from "@/lib/format";
import type { TopConsumer } from "@/lib/types";

interface WasteHotspotChartProps {
  consumers: TopConsumer[];
  totalMonthlyCost: number;
}

interface SliceData {
  name: string;
  value: number;
  percent: number;
}

const DONUT_COLORS = [
  "#1B5E20",
  "#2E7D32",
  "#43A047",
  "#66BB6A",
  "#A5D6A7",
  "#C8E6C9",
];
const MAX_SLICES = 5;
const DONUT_INNER_RADIUS = 55;
const DONUT_OUTER_RADIUS = 105;
const CHART_HEIGHT = 260;
const FIRST_INDEX = 0;
const STROKE_WIDTH = 4;
const TOOLTIP_OFFSET_X = 16;
const TOOLTIP_OFFSET_Y = 16;

function toSliceData(
  consumers: TopConsumer[],
  totalMonthlyCost: number,
  otherLabel: string
): SliceData[] {
  const top = consumers.slice(FIRST_INDEX, MAX_SLICES);
  const slices: SliceData[] = top.map((c) => ({
    name: c.name,
    value: c.monthlyCost,
    percent:
      totalMonthlyCost > 0 ? (c.monthlyCost / totalMonthlyCost) * 100 : 0,
  }));

  const topTotal = top.reduce((sum, c) => sum + c.monthlyCost, 0);
  const remaining = totalMonthlyCost - topTotal;
  if (remaining > 0) {
    slices.push({
      name: otherLabel,
      value: remaining,
      percent: (remaining / totalMonthlyCost) * 100,
    });
  }

  return slices;
}

interface MouseTooltipProps {
  data: SliceData | null;
  x: number;
  y: number;
}

function MouseTooltip({ data, x, y }: MouseTooltipProps) {
  if (!data) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-sm"
      style={{ left: x + TOOLTIP_OFFSET_X, top: y + TOOLTIP_OFFSET_Y }}
    >
      <p className="text-sm font-bold">{data.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatVnd(data.value)}
      </p>
      <p className="text-lg font-black text-primary">
        {Math.round(data.percent)}%
      </p>
    </div>
  );
}

export function WasteHotspotChart({
  consumers,
  totalMonthlyCost,
}: WasteHotspotChartProps) {
  const t = useT();
  const slices = toSliceData(consumers, totalMonthlyCost, t.CHART_WASTE_OTHER);
  const biggest = slices[FIRST_INDEX];

  const [activeSlice, setActiveSlice] = useState<SliceData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveSlice(null);
  }, []);

  if (!slices.length) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover-glow">
      <div className="px-5 pb-0 pt-5 lg:px-6 lg:pt-6">
        <h3 className="text-base font-bold">{t.CHART_WASTE_TITLE}</h3>
      </div>
      <div className="px-5 pb-5 pt-2 lg:px-6 lg:pb-6">
        <div
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={DONUT_INNER_RADIUS}
                outerRadius={DONUT_OUTER_RADIUS}
                dataKey="value"
                paddingAngle={3}
                stroke="hsl(var(--card))"
                strokeWidth={STROKE_WIDTH}
                animationDuration={1000}
                animationBegin={200}
                onMouseEnter={(_, index) => setActiveSlice(slices[index])}
                onMouseLeave={() => setActiveSlice(null)}
              >
                {slices.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <p className="max-w-[90px] truncate text-center text-xs text-muted-foreground">
              {biggest?.name}
            </p>
            <p className="text-3xl font-black text-primary">
              {biggest ? `${Math.round(biggest.percent)}%` : ""}
            </p>
          </div>
        </div>

        <MouseTooltip data={activeSlice} x={mousePos.x} y={mousePos.y} />

        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {slices.map((slice, index) => (
            <div
              key={slice.name}
              className="flex items-center gap-1.5 text-xs"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    DONUT_COLORS[index % DONUT_COLORS.length],
                }}
              />
              <span className="text-muted-foreground">{slice.name}</span>
              <span className="font-bold">{Math.round(slice.percent)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
