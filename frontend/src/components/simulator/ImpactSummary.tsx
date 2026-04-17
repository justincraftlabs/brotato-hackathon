"use client";

import { Leaf, TrendingDown, Zap } from "lucide-react";
import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatCo2, formatKwh, formatVnd } from "@/lib/format";
import { CO2_PER_TREE_PER_YEAR } from "@/lib/constants";
import { SIMULATOR_LABELS } from "@/lib/simulator-constants";

interface ImpactSummaryProps {
  savingsKwh: number;
  savingsVnd: number;
  savingsCo2Kg: number;
}

interface SummaryCardData {
  label: string;
  value: string;
  subtitle: string | null;
  icon: ComponentType<{ className?: string }>;
  delta: number;
}

const ZERO_DELTA = 0;

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
  return "bg-muted";
}

export function ImpactSummary({
  savingsKwh,
  savingsVnd,
  savingsCo2Kg,
}: ImpactSummaryProps) {
  const treesEquivalent = Math.round(
    (savingsCo2Kg / CO2_PER_TREE_PER_YEAR) * 10
  ) / 10;

  const cards: SummaryCardData[] = [
    {
      label: SIMULATOR_LABELS.KWH_SAVED,
      value: formatKwh(savingsKwh),
      subtitle: null,
      icon: Zap,
      delta: savingsKwh,
    },
    {
      label: SIMULATOR_LABELS.VND_SAVED,
      value: formatVnd(savingsVnd),
      subtitle: null,
      icon: TrendingDown,
      delta: savingsVnd,
    },
    {
      label: SIMULATOR_LABELS.CO2_SAVED,
      value: formatCo2(savingsCo2Kg),
      subtitle:
        treesEquivalent > ZERO_DELTA
          ? `~${treesEquivalent} ${SIMULATOR_LABELS.TREE_EQUIVALENT_SUFFIX}`
          : null,
      icon: Leaf,
      delta: savingsCo2Kg,
    },
  ];

  return (
    <div className="sticky top-0 z-10 bg-background pb-2 pt-1">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className={cn("border-0", getDeltaBgColor(card.delta))}
            >
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Icon
                  className={cn("h-4 w-4", getDeltaColor(card.delta))}
                />
                <p
                  className={cn(
                    "text-center text-sm font-bold",
                    getDeltaColor(card.delta)
                  )}
                >
                  {card.value}
                </p>
                <p className="text-center text-[10px] text-muted-foreground">
                  {card.label}
                </p>
                {card.subtitle && (
                  <p className="text-center text-[10px] text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
