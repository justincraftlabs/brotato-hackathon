"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-0 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_8px_20px_-4px_rgba(0,0,0,0.04)]",
        isIncrease
          ? "bg-red-50 dark:bg-red-950/20"
          : "bg-primary-light dark:bg-primary/10"
      )}
    >
      <CardContent className="flex items-center gap-4 p-5 lg:p-6">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
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
              "text-2xl font-black tabular-nums",
              isIncrease ? "text-red-600 dark:text-red-400" : "text-primary"
            )}
          >
            {percentText}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
