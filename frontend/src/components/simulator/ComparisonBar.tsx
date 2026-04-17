"use client";

import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatCo2, formatVnd } from "@/lib/format";
import { useT } from "@/hooks/use-t";

interface ComparisonBarProps {
  originalCost: number;
  adjustedCost: number;
  originalCo2: number;
  adjustedCo2: number;
  onReset: () => void;
}

const ZERO_DELTA = 0;

export function ComparisonBar({
  originalCost,
  adjustedCost,
  originalCo2,
  adjustedCo2,
  onReset,
}: ComparisonBarProps) {
  const t = useT();
  const costDelta = originalCost - adjustedCost;
  const co2Delta = originalCo2 - adjustedCo2;

  return (
    <Card className="border-t-2 border-t-primary">
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t.SIMULATOR_CURRENT_LABEL}
            </span>
            <p className="text-sm font-bold">{formatVnd(originalCost)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCo2(originalCo2)}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t.SIMULATOR_ADJUSTED_LABEL}
            </span>
            <p className="text-sm font-bold">{formatVnd(adjustedCost)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCo2(adjustedCo2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <DeltaIndicator
            label={t.SIMULATOR_MONTHLY_COST}
            value={formatVnd(Math.abs(costDelta))}
            delta={costDelta}
          />
          <DeltaIndicator
            label={t.SIMULATOR_MONTHLY_CO2}
            value={formatCo2(Math.abs(co2Delta))}
            delta={co2Delta}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          {t.SIMULATOR_RESET_BUTTON}
        </Button>
      </CardContent>
    </Card>
  );
}

interface DeltaIndicatorProps {
  label: string;
  value: string;
  delta: number;
}

function DeltaIndicator({ label, value, delta }: DeltaIndicatorProps) {
  const isSaving = delta > ZERO_DELTA;
  const isIncrease = delta < ZERO_DELTA;

  return (
    <div className="flex items-center gap-1">
      {isSaving && <ArrowDown className="h-3 w-3 text-primary" />}
      {isIncrease && <ArrowUp className="h-3 w-3 text-accent" />}
      <span
        className={cn(
          "text-xs font-semibold",
          isSaving && "text-primary",
          isIncrease && "text-accent",
          !isSaving && !isIncrease && "text-muted-foreground"
        )}
      >
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
