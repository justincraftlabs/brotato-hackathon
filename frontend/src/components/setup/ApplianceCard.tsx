"use client";

import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { calculateMonthlyKwh, calculateMonthlyCost } from "@/lib/calculations";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Appliance } from "@/lib/types";

interface ApplianceCardProps {
  appliance: Appliance;
  onDelete: (applianceId: string) => void;
  onEdit: (appliance: Appliance) => void;
}

export function ApplianceCard({ appliance, onDelete, onEdit }: ApplianceCardProps) {
  const t = useT();

  const monthlyKwh = calculateMonthlyKwh(
    appliance.wattage,
    appliance.dailyUsageHours
  );
  const monthlyCost = calculateMonthlyCost(monthlyKwh);

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{appliance.name}</span>
            <span className="text-xs text-muted-foreground">
              {appliance.wattage}W
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {appliance.dailyUsageHours} {t.LABEL_HOURS_SUFFIX}
            </span>
            <span>
              {t.LABEL_MONTHLY_KWH}: {formatKwh(monthlyKwh)}
            </span>
            <span>
              {t.LABEL_MONTHLY_COST}: {formatVnd(monthlyCost)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(appliance)}
            aria-label={`${t.BUTTON_EDIT_APPLIANCE} ${appliance.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(appliance.id)}
            aria-label={`${t.LABEL_DELETE} ${appliance.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
