import { Badge } from "@/components/ui/badge";
import { formatKwh, formatVnd } from "@/lib/format";
import type { DeviceSuggestion, SuggestionPriority } from "@/lib/types";
import type { Translations } from "@/lib/translations";

type PriorityVariant = "destructive" | "secondary" | "outline";

const PRIORITY_VARIANT: Record<SuggestionPriority, PriorityVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

interface DeviceSuggestionCardProps {
  device: DeviceSuggestion;
  t: Translations;
}

const PRIORITY_LABEL_MAP: Record<SuggestionPriority, keyof Translations> = {
  high: "SUGGESTIONS_PRIORITY_HIGH",
  medium: "SUGGESTIONS_PRIORITY_MEDIUM",
  low: "SUGGESTIONS_PRIORITY_LOW",
};

export function DeviceSuggestionCard({ device, t }: DeviceSuggestionCardProps) {
  const labelKey = PRIORITY_LABEL_MAP[device.priority];
  const priorityLabel = t[labelKey] as string;

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{device.applianceName}</p>
        <Badge variant={PRIORITY_VARIANT[device.priority]}>{priorityLabel}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{device.tip}</p>
      <p className="text-xs text-primary font-medium">
        {formatVnd(device.savingsVnd)}{" "}
        <span className="font-normal text-muted-foreground">
          · {formatKwh(device.savingsKwh)} {t.SUGGESTIONS_SAVINGS_PER_MONTH}
        </span>
      </p>
    </div>
  );
}
