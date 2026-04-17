"use client";

import { Info, PieChart as PieChartIcon } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveSlice(null);
  }, []);

  if (!slices.length) return null;

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
        <div className="shrink-0 px-4 pb-0 pt-4 lg:px-5 lg:pt-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{t.CHART_WASTE_TITLE}</h3>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.CHART_WASTE_INFO_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col px-4 pb-4 pt-2 lg:px-5 lg:pb-5">
          <div
            className="relative flex-1"
            style={{ minHeight: CHART_HEIGHT }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <ResponsiveContainer width="100%" height="100%">
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

          {/* Legend — pinned to bottom */}
          <div className="mt-2 shrink-0 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {slices.map((slice, index) => (
              <div
                key={`legend-${index}`}
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

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Header strip */}
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <PieChartIcon className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_WASTE_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_WASTE_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* Center hint */}
            <div className="rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t.CHART_WASTE_INFO_CENTER_HINT}
              </p>
            </div>

            {/* Tiered pricing note */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Điện bậc thang EVN
              </p>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">{t.CHART_WASTE_INFO_TIER_NOTE}</p>
                <p className="text-xs font-semibold text-primary">{t.CHART_WASTE_INFO_TIER_RANGE}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_WASTE_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
