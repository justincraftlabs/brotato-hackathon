"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { formatPercent } from "@/lib/format";
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
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        {isIncrease ? (
          <TrendingUp className="h-6 w-6 shrink-0 text-red-500" />
        ) : (
          <TrendingDown className="h-6 w-6 shrink-0 text-primary" />
        )}
        <p
          className={`text-sm font-medium ${isIncrease ? "text-red-500" : "text-primary"}`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
