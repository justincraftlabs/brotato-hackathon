"use client";

import { Leaf, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/cn";
import { formatCo2, formatKwh, formatVnd } from "@/lib/format";
import { CO2_PER_TREE_PER_YEAR } from "@/lib/constants";
import { useT } from "@/hooks/use-t";

interface ImpactSummaryProps {
  savingsKwh: number;
  savingsVnd: number;
  savingsCo2Kg: number;
  originalKwh?: number;
  originalCost?: number;
  originalCo2?: number;
  unstyled?: boolean;
}

interface SummaryCardData {
  label: string;
  value: string;
  subtitle: string | null;
  icon: ComponentType<{ className?: string }>;
  delta: number;
  pctChange: number | null;
}

const ZERO_DELTA = 0;
const PCT_ROUND = 0;

function getDeltaColor(delta: number): string {
  if (delta > ZERO_DELTA) {
    return "text-primary";
  }
  if (delta < ZERO_DELTA) {
    return "text-accent";
  }
  return "text-muted-foreground";
}

function getDeltaBgColor(delta: number): string {
  if (delta > ZERO_DELTA) {
    return "bg-primary/10";
  }
  if (delta < ZERO_DELTA) {
    return "bg-accent/10";
  }
  return "bg-muted/40";
}

// Returns rounded percentage: positive = saving, negative = increase
function computePct(savings: number, original: number | undefined): number | null {
  if (original === undefined || original <= ZERO_DELTA) {
    return null;
  }
  const pct = Math.round((savings / original) * 100);
  return pct === PCT_ROUND ? null : pct;
}

export function ImpactSummary({
  savingsKwh,
  savingsVnd,
  savingsCo2Kg,
  originalKwh,
  originalCost,
  originalCo2,
  unstyled = false,
}: ImpactSummaryProps) {
  const t = useT();
  const treesEquivalent =
    Math.round((savingsCo2Kg / CO2_PER_TREE_PER_YEAR) * 10) / 10;

  const cards: SummaryCardData[] = [
    {
      label: t.SIMULATOR_KWH_SAVED,
      value: formatKwh(savingsKwh),
      subtitle: null,
      icon: Zap,
      delta: savingsKwh,
      pctChange: computePct(savingsKwh, originalKwh),
    },
    {
      label: t.SIMULATOR_VND_SAVED,
      value: formatVnd(savingsVnd),
      subtitle: null,
      icon: savingsVnd >= ZERO_DELTA ? TrendingDown : TrendingUp,
      delta: savingsVnd,
      pctChange: computePct(savingsVnd, originalCost),
    },
    {
      label: t.SIMULATOR_CO2_SAVED,
      value: formatCo2(savingsCo2Kg),
      subtitle:
        treesEquivalent > ZERO_DELTA
          ? `~${treesEquivalent} ${t.SIMULATOR_TREE_EQUIVALENT_SUFFIX}`
          : null,
      icon: Leaf,
      delta: savingsCo2Kg,
      pctChange: computePct(savingsCo2Kg, originalCo2),
    },
  ];

  const inner = (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSaving = card.delta > ZERO_DELTA;
        const isIncrease = card.delta < ZERO_DELTA;
        return (
          <div
            key={card.label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl p-2",
              getDeltaBgColor(card.delta)
            )}
          >
            <div
              className={cn(
                "rounded-full p-1.5",
                card.delta > ZERO_DELTA
                  ? "bg-primary/15"
                  : card.delta < ZERO_DELTA
                    ? "bg-accent/15"
                    : "bg-muted/60"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", getDeltaColor(card.delta))} />
            </div>

            <p className={cn("text-center text-sm font-bold leading-tight", getDeltaColor(card.delta))}>
              {card.value}
            </p>

            {card.pctChange !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  isSaving
                    ? "bg-primary/20 text-primary"
                    : isIncrease
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isSaving ? "−" : "+"}
                {Math.abs(card.pctChange)}%
              </span>
            )}

            <p className="text-center text-[10px] text-muted-foreground">
              {card.label}
            </p>

            {card.subtitle && (
              <p className="text-center text-[10px] text-muted-foreground">
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  if (unstyled) return inner;

  return (
    <div className="glass rounded-2xl border border-border/50 p-3 lg:p-4">
      {inner}
    </div>
  );
}
