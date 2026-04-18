"use client";

import { motion } from "framer-motion";
import { Info, Zap } from "lucide-react";
import { useState } from "react";

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

interface RankedConsumer extends TopConsumer {
  rank: number;
  sharePercent: number;
  isHigh: boolean;
}

const MAX_VISIBLE = 10;
const HIGH_THRESHOLD_PERCENT = 20;
const ROUND_FACTOR = 10;
const BAR_ANIMATION_STAGGER = 0.07;
const BAR_ANIMATION_DURATION = 0.7;

function round1(value: number): number {
  return Math.round(value * ROUND_FACTOR) / ROUND_FACTOR;
}

function rankConsumers(consumers: TopConsumer[]): RankedConsumer[] {
  const limited = [...consumers]
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh)
    .slice(0, MAX_VISIBLE);
  const totalKwh = limited.reduce((sum, c) => sum + c.monthlyKwh, 0);

  return limited.map((c, i) => {
    const sharePercent = totalKwh > 0 ? (c.monthlyKwh / totalKwh) * 100 : 0;
    return {
      ...c,
      monthlyKwh: round1(c.monthlyKwh),
      rank: i + 1,
      sharePercent,
      isHigh: sharePercent > HIGH_THRESHOLD_PERCENT,
    };
  });
}

export function TopConsumersChart({ consumers }: TopConsumersChartProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const ranked = rankConsumers(consumers);

  if (!ranked.length) return null;

  const totalKwh = ranked.reduce((sum, c) => sum + c.monthlyKwh, 0);
  const totalCost = ranked.reduce((sum, c) => sum + c.monthlyCost, 0);
  const topShare = ranked[0]?.sharePercent ?? 0;

  return (
    <>
      <div className="glass rounded-2xl card-hover-glow h-full flex flex-col p-3.5 lg:p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex min-w-0 items-center gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
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

          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className="text-base font-black leading-none text-primary tabular-nums">
              {formatKwh(totalKwh)}
            </span>
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
              · {formatVnd(totalCost)}
            </span>
          </div>
        </div>

        {/* Ranked consumers */}
        <ul className="mt-3 flex flex-1 flex-col gap-2">
          {ranked.map((item) => {
            const isTop = item.rank === 1;
            const barWidthPercent = topShare > 0 ? (item.sharePercent / topShare) * 100 : 0;

            return (
              <li key={item.applianceId} className="flex items-center gap-2.5">
                {/* Rank badge */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                    item.isHigh
                      ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
                      : isTop
                        ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                        : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {item.rank}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Name + room · kWh + share */}
                  <div className="flex items-baseline justify-between gap-2 leading-tight">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <span className="truncate text-xs font-semibold">{item.name}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground/70">
                        · {item.roomName}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatKwh(item.monthlyKwh)}
                      <span
                        className={cn(
                          "ml-1.5 font-bold",
                          item.isHigh ? "text-amber-500" : "text-foreground"
                        )}
                      >
                        {item.sharePercent.toFixed(0)}%
                      </span>
                    </span>
                  </div>

                  {/* Animated bar */}
                  <div className="relative mt-1 h-1 overflow-hidden rounded-full bg-muted/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidthPercent}%` }}
                      transition={{
                        duration: BAR_ANIMATION_DURATION,
                        delay: item.rank * BAR_ANIMATION_STAGGER,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        item.isHigh
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_hsl(38_85%_55%/0.3)]"
                          : "bg-gradient-to-r from-primary/60 to-primary"
                      )}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Tip footer */}
        <p className="mt-2.5 shrink-0 text-[10px] leading-relaxed text-muted-foreground/80">
          💡 {t.CHART_CONSUMERS_INFO_TIP}
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
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

          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Ý nghĩa màu sắc
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="h-3 w-8 shrink-0 rounded-full bg-gradient-to-r from-primary/60 to-primary" />
                <div>
                  <span className="text-xs font-semibold">{t.CHART_CONSUMERS_INFO_NORMAL}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    — {t.CHART_CONSUMERS_INFO_NORMAL_DESC}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-8 shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <div>
                  <span className="text-xs font-semibold text-amber-500">
                    {t.CHART_CONSUMERS_INFO_HIGH}
                  </span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    — {t.CHART_CONSUMERS_INFO_HIGH_DESC}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                💡 {t.CHART_CONSUMERS_INFO_TIP}
              </p>
            </div>
          </div>

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
