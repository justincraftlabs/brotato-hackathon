import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatKwh, formatVnd } from "@/lib/format";
import { NAV_ROUTES } from "@/lib/constants";
import type { DeviceSuggestion, SuggestionPriority } from "@/lib/types";
import type { Translations } from "@/lib/translations";

const PRIORITY_BADGE_CLASS: Record<SuggestionPriority, string> = {
  high: "bg-red-500/15 text-red-400 border border-red-400/30",
  medium: "bg-amber-400/15 text-amber-400 border border-amber-400/30",
  low: "bg-blue-400/15 text-blue-400 border border-blue-400/30",
};

const PRIORITY_BORDER: Record<SuggestionPriority, string> = {
  high: "border-l-red-400/60",
  medium: "border-l-amber-400/60",
  low: "border-l-blue-400/60",
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
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
            PRIORITY_BADGE_CLASS[device.priority]
          )}
        >
          {priorityLabel}
        </span>
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
