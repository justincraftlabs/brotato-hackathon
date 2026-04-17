"use client";

import { DollarSign, Leaf, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { formatCo2, formatKwh, formatVnd } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

interface EnergyOverviewProps {
  data: DashboardData;
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}

function SummaryCard({ icon, label, value, colorClass }: SummaryCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col items-center gap-1 p-3">
        <div className={colorClass}>{icon}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function EnergyOverview({ data }: EnergyOverviewProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-3 gap-2">
      <SummaryCard
        icon={<Zap className="h-5 w-5" />}
        label={t.DASHBOARD_TOTAL_KWH}
        value={formatKwh(data.totalMonthlyKwh)}
        colorClass="text-primary"
      />
      <SummaryCard
        icon={<DollarSign className="h-5 w-5" />}
        label={t.DASHBOARD_TOTAL_COST}
        value={formatVnd(data.totalMonthlyCost)}
        colorClass="text-accent"
      />
      <SummaryCard
        icon={<Leaf className="h-5 w-5" />}
        label={t.DASHBOARD_TOTAL_CO2}
        value={formatCo2(data.co2.totalKg)}
        colorClass="text-primary"
      />
    </div>
  );
}
