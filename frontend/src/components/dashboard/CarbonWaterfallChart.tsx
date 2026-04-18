"use client";

import { motion } from "framer-motion";
import { Info, Leaf } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { CO2_EMISSION_FACTOR } from "@/lib/constants";
import { formatCo2 } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TopConsumer } from "@/lib/types";

interface CarbonWaterfallChartProps {
  co2TotalKg: number;
  consumers: TopConsumer[];
}

interface RankedEmitter {
  name: string;
  co2Kg: number;
  sharePercent: number;
  rank: number;
  isOther: boolean;
}

const MAX_VISIBLE_ITEMS = 5;
const ROUND_FACTOR = 10;
const OTHER_THRESHOLD_KG = 0.5;
const VN_AVG_HOUSEHOLD_CO2 = 150;
const BAR_ANIMATION_STAGGER = 0.07;
const BAR_ANIMATION_DURATION = 0.7;

function round1(value: number): number {
  return Math.round(value * ROUND_FACTOR) / ROUND_FACTOR;
}

function buildEmitters(
  consumers: TopConsumer[],
  co2TotalKg: number,
  otherLabel: string
): RankedEmitter[] {
  const sorted = [...consumers].sort((a, b) => b.monthlyKwh - a.monthlyKwh);
  const top = sorted.slice(0, MAX_VISIBLE_ITEMS);

  const items: RankedEmitter[] = top.map((c, i) => {
    const co2Kg = round1(c.monthlyKwh * CO2_EMISSION_FACTOR);
    return {
      name: c.name,
      co2Kg,
      sharePercent: co2TotalKg > 0 ? (co2Kg / co2TotalKg) * 100 : 0,
      rank: i + 1,
      isOther: false,
    };
  });

  const itemsTotal = items.reduce((sum, it) => sum + it.co2Kg, 0);
  const remaining = round1(co2TotalKg - itemsTotal);
  if (remaining > OTHER_THRESHOLD_KG) {
    items.push({
      name: otherLabel,
      co2Kg: remaining,
      sharePercent: co2TotalKg > 0 ? (remaining / co2TotalKg) * 100 : 0,
      rank: items.length + 1,
      isOther: true,
    });
  }

  return items;
}

export function CarbonWaterfallChart({
  co2TotalKg,
  consumers,
}: CarbonWaterfallChartProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const emitters = buildEmitters(consumers, co2TotalKg, t.CHART_WASTE_OTHER);

  if (!emitters.length) return null;

  const topShare = emitters[0]?.sharePercent ?? 0;
  const vsAvgPercent = Math.round((co2TotalKg / VN_AVG_HOUSEHOLD_CO2) * 100);
  const isAboveAvg = vsAvgPercent > 100;

  return (
    <>
      <div className="glass rounded-2xl card-hover-glow h-full flex flex-col p-3.5 lg:p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex min-w-0 items-center gap-2">
            <Leaf className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold">{t.CHART_CARBON_TITLE}</h3>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.CHART_CARBON_INFO_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className="text-base font-black leading-none text-primary tabular-nums">
              {formatCo2(co2TotalKg)}
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold tabular-nums",
                isAboveAvg ? "text-amber-500" : "text-primary/70"
              )}
            >
              ({isAboveAvg ? "+" : ""}
              {vsAvgPercent - 100}% TB)
            </span>
          </div>
        </div>

        {/* Ranked emitters */}
        <ul className="mt-3 flex flex-1 flex-col gap-1.5">
          {emitters.map((item) => {
            const isTop = item.rank === 1 && !item.isOther;
            const barWidthPercent = topShare > 0 ? (item.sharePercent / topShare) * 100 : 0;

            return (
              <li key={`${item.rank}-${item.name}`} className="flex items-center gap-2.5">
                {/* Rank badge */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                    item.isOther
                      ? "bg-muted/40 text-muted-foreground/70"
                      : isTop
                        ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
                        : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {item.isOther ? "•" : item.rank}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Name · CO2 · share */}
                  <div className="flex items-baseline justify-between gap-2 leading-tight">
                    <span className="truncate text-xs font-semibold">{item.name}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatCo2(item.co2Kg)}
                      <span className="ml-1.5 font-bold text-foreground">
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
                        item.isOther
                          ? "bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50"
                          : isTop
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

        {/* Context footer */}
        <p className="mt-2.5 shrink-0 text-[10px] leading-relaxed text-muted-foreground/80">
          🌍 {t.CHART_CARBON_INFO_CONTEXT}
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Leaf className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_CARBON_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_CARBON_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Thang màu
              </p>
              <div className="h-3 rounded-full bg-gradient-to-r from-[hsl(150_48%_36%)] via-[hsl(64_58%_44%)] to-[hsl(28_78%_52%)]" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.CHART_CARBON_INFO_SCALE_HINT}
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                🌍 {t.CHART_CARBON_INFO_CONTEXT}
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_CARBON_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
