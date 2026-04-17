"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComparisonData } from "@/lib/types";

interface MonthComparisonProps {
  comparison: ComparisonData;
}

const ZERO_THRESHOLD = 0;

export function MonthComparison({ comparison }: MonthComparisonProps) {
  const t = useT();
  const isIncrease = comparison.percentDifference > ZERO_THRESHOLD;
  const percentText = formatPercent(comparison.percentDifference);

  const template = isIncrease
    ? t.DASHBOARD_MONTH_COMPARISON_UP
    : t.DASHBOARD_MONTH_COMPARISON_DOWN;

  const description = template.replace("{percent}", percentText);

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden card-hover-glow",
        isIncrease
          ? "bg-red-50/80 border border-red-200/40 dark:bg-red-950/25 dark:border-red-800/20"
          : "bg-primary/8 border border-primary/12 dark:bg-primary/10 dark:border-primary/15"
      )}
    >
      <div className="flex items-center gap-3 p-4 lg:p-5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isIncrease ? "bg-red-100 dark:bg-red-900/30" : "bg-primary/15"
          )}
        >
          {isIncrease ? (
            <TrendingUp className="h-6 w-6 text-red-500" />
          ) : (
            <TrendingDown className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <p
            className={cn(
              "text-xl font-black tabular-nums",
              isIncrease ? "text-red-600 dark:text-red-400" : "text-primary"
            )}
          >
            {percentText}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
