"use client";

import { TreePine } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { MAX_TREE_ICONS } from "@/lib/constants";
import { formatCo2 } from "@/lib/format";
import type { Co2Data } from "@/lib/types";

interface Co2TreeVisualProps {
  co2: Co2Data;
}

export function Co2TreeVisual({ co2 }: Co2TreeVisualProps) {
  const t = useT();
  const treeCount = co2.treesEquivalent;
  const visibleTrees = Math.min(treeCount, MAX_TREE_ICONS);
  const hasOverflow = treeCount > MAX_TREE_ICONS;

  const equivalentText = t.DASHBOARD_CO2_TREE_EQUIVALENT.replace(
    "{count}",
    String(Math.round(treeCount))
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {t.DASHBOARD_CO2_TREE_TITLE}
          </p>
          <p className="text-sm font-bold text-primary">
            {formatCo2(co2.totalKg)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {Array.from({ length: visibleTrees }).map((_, index) => (
            <TreePine
              key={index}
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
          ))}
          {hasOverflow && (
            <span className="text-sm font-medium text-muted-foreground">
              {t.DASHBOARD_CO2_TREE_OVERFLOW}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{equivalentText}</p>
      </CardContent>
    </Card>
  );
}
