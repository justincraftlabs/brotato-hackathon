"use client";

import { Pencil, PlugZap, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { motion } from "@/components/ui/motion";
import { useT } from "@/hooks/use-t";
import { calculateMonthlyKwh, calculateMonthlyCost } from "@/lib/calculations";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Appliance } from "@/lib/types";

interface ApplianceCardProps {
  appliance: Appliance;
  onDelete: (applianceId: string) => void;
  onEdit: (appliance: Appliance) => void;
}

const HOVER_SCALE = 1.008;
const HOVER_TRANSITION = { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] } as const;

export function ApplianceCard({ appliance, onDelete, onEdit }: ApplianceCardProps) {
  const t = useT();

  const monthlyKwh = calculateMonthlyKwh(appliance.wattage, appliance.dailyUsageHours);
  const monthlyCost = appliance.monthlyCost > 0 ? appliance.monthlyCost : calculateMonthlyCost(monthlyKwh);

  const vampireBadge = appliance.standbyWattage > 0 && (
    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
      <PlugZap className="h-2.5 w-2.5" />
      {appliance.standbyWattage}W
    </span>
  );

  const actionButtons = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
        onClick={() => onEdit(appliance)}
        aria-label={`${t.BUTTON_EDIT_APPLIANCE} ${appliance.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(appliance.id)}
        aria-label={`${t.LABEL_DELETE} ${appliance.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <motion.div
      className="glass rounded-xl card-hover-glow"
      whileHover={{ scale: HOVER_SCALE }}
      transition={HOVER_TRANSITION}
      layout
    >
      {/* Desktop: table row */}
      <div className="hidden md:grid md:grid-cols-[1fr_72px_88px_100px_116px_72px] items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{appliance.name}</span>
          {vampireBadge}
        </div>
        <span className="text-sm font-semibold text-primary">{appliance.wattage}W</span>
        <span className="text-sm text-muted-foreground">
          {appliance.dailyUsageHours} {t.LABEL_HOURS_SUFFIX}
        </span>
        <span className="text-sm text-muted-foreground">{formatKwh(monthlyKwh)}</span>
        <span className="text-sm text-muted-foreground">{formatVnd(monthlyCost)}</span>
        <div className="flex shrink-0 items-center justify-end gap-0.5">{actionButtons}</div>
      </div>

      {/* Mobile: card */}
      <div className="p-3 md:hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{appliance.name}</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {appliance.wattage}W
              </span>
              {vampireBadge}
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
              {appliance.standbyWattage > 0 && (
                <span className="text-amber-400/80">
                  {t.VAMPIRE_STANDBY_WATTAGE}: {appliance.standbyWattage}W
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">{actionButtons}</div>
        </div>
      </div>
    </motion.div>
  );
}
