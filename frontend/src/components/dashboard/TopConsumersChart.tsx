"use client";

import { Info, Zap } from "lucide-react";
import { useState } from "react";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { formatKwh, formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
        <div className="shrink-0 px-4 pb-0 pt-4 lg:px-5 lg:pt-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{t.CHART_CONSUMERS_INFO_TITLE}</h3>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.CHART_CONSUMERS_INFO_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 px-4 pb-4 pt-3 lg:px-5 lg:pb-5" style={{ minHeight: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
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

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Header strip */}
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Zap className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_CONSUMERS_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_CONSUMERS_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Color legend */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Ý nghĩa màu sắc
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="h-3 w-8 shrink-0 rounded-full bg-gradient-to-r from-[#43A047] to-[#1B5E20]" />
                <div>
                  <span className="text-xs font-semibold">{t.CHART_CONSUMERS_INFO_NORMAL}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">— {t.CHART_CONSUMERS_INFO_NORMAL_DESC}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-8 shrink-0 rounded-full bg-gradient-to-r from-[#FFB74D] to-[#E65100]" />
                <div>
                  <span className="text-xs font-semibold text-amber-500">{t.CHART_CONSUMERS_INFO_HIGH}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">— {t.CHART_CONSUMERS_INFO_HIGH_DESC}</span>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                💡 {t.CHART_CONSUMERS_INFO_TIP}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_CONSUMERS_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
