"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatCo2, formatVnd } from "@/lib/format";
import { useT } from "@/hooks/use-t";

interface ComparisonBarProps {
  originalCost: number;
  adjustedCost: number;
  originalCo2: number;
  adjustedCo2: number;
  onReset: () => void;
  unstyled?: boolean;
}

const ZERO = 0;
const PCT_MAX = 100;

function clampPct(value: number): number {
  return Math.max(ZERO, Math.min(PCT_MAX, value));
}

interface MetricRowProps {
  label: string;
  originalValue: string;
  adjustedValue: string;
  /** Width % for the adjusted bar relative to original = 100% */
  adjustedWidthPct: number;
  /** Positive = saving, negative = overspend */
  savingsPct: number;
  barColorClass: string;
}

function MetricRow({
  label,
  originalValue,
  adjustedValue,
  adjustedWidthPct,
  savingsPct,
  barColorClass,
}: MetricRowProps) {
  const isSaving = savingsPct > ZERO;
  const isIncrease = savingsPct < ZERO;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label + badge row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {savingsPct !== ZERO && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              isSaving
                ? "bg-primary/20 text-primary"
                : "bg-accent/20 text-accent"
            )}
          >
            {isIncrease ? "+" : "−"}
            {Math.abs(savingsPct)}%
          </span>
        )}
      </div>

      {/* Progress bar: original = full width, adjusted overlaid */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-300", barColorClass)}
          style={{ width: `${adjustedWidthPct}%` }}
        />
      </div>

      {/* Before / After values */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">
          {originalValue}
        </span>
        <span
          className={cn(
            "text-xs font-semibold",
            isSaving ? "text-primary" : isIncrease ? "text-accent" : "text-foreground"
          )}
        >
          {adjustedValue}
        </span>
      </div>
    </div>
  );
}

export function ComparisonBar({
  originalCost,
  adjustedCost,
  originalCo2,
  adjustedCo2,
  onReset,
  unstyled = false,
}: ComparisonBarProps) {
  const t = useT();

  const costSavingsPct =
    originalCost > ZERO
      ? Math.round(((originalCost - adjustedCost) / originalCost) * PCT_MAX)
      : ZERO;

  const co2SavingsPct =
    originalCo2 > ZERO
      ? Math.round(((originalCo2 - adjustedCo2) / originalCo2) * PCT_MAX)
      : ZERO;

  const costBarWidthPct =
    originalCost > ZERO
      ? clampPct((adjustedCost / originalCost) * PCT_MAX)
      : PCT_MAX;

  const co2BarWidthPct =
    originalCo2 > ZERO
      ? clampPct((adjustedCo2 / originalCo2) * PCT_MAX)
      : PCT_MAX;

  const inner = (
    <div className="flex flex-col gap-4">
      <MetricRow
        label={t.SIMULATOR_MONTHLY_COST}
        originalValue={formatVnd(originalCost)}
        adjustedValue={formatVnd(adjustedCost)}
        adjustedWidthPct={costBarWidthPct}
        savingsPct={costSavingsPct}
        barColorClass="bg-primary/60"
      />

      <MetricRow
        label={t.SIMULATOR_MONTHLY_CO2}
        originalValue={formatCo2(originalCo2)}
        adjustedValue={formatCo2(adjustedCo2)}
        adjustedWidthPct={co2BarWidthPct}
        savingsPct={co2SavingsPct}
        barColorClass="bg-emerald-500/60"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="w-full rounded-xl"
      >
        <RotateCcw className="mr-2 h-3 w-3" />
        {t.SIMULATOR_RESET_BUTTON}
      </Button>
    </div>
  );

  if (unstyled) return inner;

  return (
    <div className="glass rounded-2xl border border-border/50 p-4 lg:p-5">
      {inner}
    </div>
  );
}
