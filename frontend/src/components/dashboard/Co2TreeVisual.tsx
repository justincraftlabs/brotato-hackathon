"use client";

import { Info, TreePine } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { MAX_TREE_ICONS } from "@/lib/constants";
import { formatCo2 } from "@/lib/format";
import type { Co2Data } from "@/lib/types";

interface Co2TreeVisualProps {
  co2: Co2Data;
}

export function Co2TreeVisual({ co2 }: Co2TreeVisualProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);

  const treeCount = co2.treesEquivalent;
  const visibleTrees = Math.min(treeCount, MAX_TREE_ICONS);
  const hasOverflow = treeCount > MAX_TREE_ICONS;

  const equivalentText = t.DASHBOARD_CO2_TREE_EQUIVALENT.replace(
    "{count}",
    String(Math.round(treeCount))
  );

  const formulaRows = [
    { label: t.CHART_CO2_INFO_FACTOR_LABEL, value: t.CHART_CO2_INFO_FACTOR_VALUE },
    { label: t.CHART_CO2_INFO_TREE_LABEL, value: t.CHART_CO2_INFO_TREE_VALUE },
    { label: t.CHART_CO2_INFO_FORMULA_LABEL, value: t.CHART_CO2_INFO_FORMULA_VALUE },
  ];

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden card-hover-glow">
        <div className="flex flex-col gap-2.5 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">
                {t.DASHBOARD_CO2_TREE_TITLE}
              </p>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                title={t.CHART_CO2_INFO_SUBTITLE}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
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

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Header strip */}
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <TreePine className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_CO2_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_CO2_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Formula table */}
          <div className="px-5 py-4">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {formulaRows.map(({ label, value }) => (
                  <tr key={label} className="border-b border-border/20 last:border-0">
                    <td className="py-2.5 pr-3 text-muted-foreground">{label}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-primary">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_CO2_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
