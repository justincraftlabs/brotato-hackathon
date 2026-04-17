import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatKwh, formatVnd } from "@/lib/format";
import { NAV_ROUTES } from "@/lib/constants";
import type { DeviceSuggestion, SuggestionPriority } from "@/lib/types";
import type { Translations } from "@/lib/translations";

type PriorityVariant = "destructive" | "secondary" | "outline";

const PRIORITY_VARIANT: Record<SuggestionPriority, PriorityVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const PRIORITY_BORDER: Record<SuggestionPriority, string> = {
  high: "border-l-destructive/60",
  medium: "border-l-amber-400/60",
  low: "border-l-primary/60",
};

interface DeviceSuggestionCardProps {
  device: DeviceSuggestion;
  t: Translations;
}

function getPriorityLabel(priority: SuggestionPriority, t: Translations): string {
  if (priority === "high") return t.SUGGESTIONS_PRIORITY_HIGH;
  if (priority === "medium") return t.SUGGESTIONS_PRIORITY_MEDIUM;
  return t.SUGGESTIONS_PRIORITY_LOW;
}

export function DeviceSuggestionCard({ device, t }: DeviceSuggestionCardProps) {
  const priorityLabel = getPriorityLabel(device.priority, t);

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-l-4 bg-card p-3",
        PRIORITY_BORDER[device.priority]
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{device.applianceName}</p>
        <Badge variant={PRIORITY_VARIANT[device.priority]}>{priorityLabel}</Badge>
      </div>

      {/* Tip with subtle quote styling via left border already on card */}
      <p className="text-xs text-muted-foreground leading-relaxed">{device.tip}</p>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <p className="text-xs font-medium text-primary">
          {formatVnd(device.savingsVnd)}{" "}
          <span className="font-normal text-muted-foreground">
            · {formatKwh(device.savingsKwh)} {t.SUGGESTIONS_SAVINGS_PER_MONTH}
          </span>
        </p>
        <Link
          href={NAV_ROUTES.SIMULATOR}
          className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          {t.SUGGESTIONS_TRY_SIMULATOR}
        </Link>
      </div>
    </div>
  );
}
