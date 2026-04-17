"use client";

import { Globe, Info, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const isIncrease = comparison.percentDifference > ZERO_THRESHOLD;
  const percentText = formatPercent(comparison.percentDifference);

  const template = isIncrease
    ? t.DASHBOARD_MONTH_COMPARISON_UP
    : t.DASHBOARD_MONTH_COMPARISON_DOWN;

  const description = template.replace("{percent}", percentText);

  const householdRows = [
    { label: t.CHART_COMPARISON_INFO_HH_SMALL, value: `~100 ${t.LABEL_MONTHLY_KWH}`, note: "" },
    { label: t.CHART_COMPARISON_INFO_HH_MEDIUM, value: `~165 ${t.LABEL_MONTHLY_KWH}`, note: t.CHART_COMPARISON_INFO_HH_AVG_LABEL },
    { label: t.CHART_COMPARISON_INFO_HH_LARGE, value: `~230 ${t.LABEL_MONTHLY_KWH}`, note: "" },
  ];

  return (
    <>
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
          <div className="flex-1">
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
          {/* Info button */}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            title={t.CHART_COMPARISON_INFO_SUBTITLE}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Header strip */}
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_COMPARISON_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_COMPARISON_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Household averages table */}
          <div className="px-5 py-4">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {householdRows.map(({ label, value, note }) => (
                  <tr key={label} className="border-b border-border/20 last:border-0">
                    <td className="py-2.5 pr-3 text-muted-foreground">{label}</td>
                    <td className="py-2.5 text-right">
                      <span className="font-semibold tabular-nums">{value}</span>
                      {note && (
                        <span className="ml-1.5 rounded-full bg-primary/12 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          {note}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Color meaning */}
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">{t.CHART_COMPARISON_COLOR_GREEN}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">{t.CHART_COMPARISON_COLOR_RED}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_COMPARISON_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
