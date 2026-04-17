"use client";

import { TreePine } from "lucide-react";

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
    <div className="glass rounded-2xl overflow-hidden card-hover-glow">
      <div className="flex flex-col gap-2.5 p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            {t.DASHBOARD_CO2_TREE_TITLE}
          </p>
          <p className="text-sm font-black text-primary">
            {formatCo2(co2.totalKg)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: visibleTrees }).map((_, index) => (
            <TreePine
              key={index}
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            />
          ))}
          {hasOverflow && (
            <span className="text-sm font-bold text-muted-foreground">
              {t.DASHBOARD_CO2_TREE_OVERFLOW}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{equivalentText}</p>
      </div>
    </div>
  );
}
