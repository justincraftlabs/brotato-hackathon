"use client";

import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSchedules } from "@/contexts/schedules-context";
import { formatKwh, formatVnd } from "@/lib/format";
import type { ActivateAllItem, DeviceSuggestion, SuggestionPriority } from "@/lib/types";
import type { Translations } from "@/lib/translations";

type PriorityVariant = "destructive" | "secondary" | "outline";

const PRIORITY_VARIANT: Record<SuggestionPriority, PriorityVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

interface DeviceSuggestionCardProps {
  device: DeviceSuggestion;
  homeId: string;
  roomName: string;
  onActivated?: (roomName: string, applianceName: string, item: ActivateAllItem) => void;
  t: Translations;
}

function getPriorityLabel(priority: SuggestionPriority, t: Translations): string {
  if (priority === 'high') return t.SUGGESTIONS_PRIORITY_HIGH;
  if (priority === 'medium') return t.SUGGESTIONS_PRIORITY_MEDIUM;
  return t.SUGGESTIONS_PRIORITY_LOW;
}

export function DeviceSuggestionCard({ device, homeId, roomName, onActivated, t }: DeviceSuggestionCardProps) {
  const { activate, activatedKeys } = useSchedules();
  const priorityLabel = getPriorityLabel(device.priority, t);
  const [activating, setActivating] = useState(false);

  // Derive from context so page-load (already-scheduled) state reflects correctly
  const activated = activatedKeys.has(`${roomName}:${device.applianceName}`);

  async function handleActivate() {
    setActivating(true);
    const item: ActivateAllItem = {
      applianceName: device.applianceName,
      roomName,
      type: "behavior",
      title: device.tip,
      savingsKwh: device.savingsKwh,
      savingsVnd: device.savingsVnd,
    };
    await activate([item]);
    setActivating(false);
    onActivated?.(roomName, device.applianceName, item);
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{device.applianceName}</p>
        <Badge variant={PRIORITY_VARIANT[device.priority]}>{priorityLabel}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{device.tip}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-xs text-primary font-medium">
          {formatVnd(device.savingsVnd)}{" "}
          <span className="font-normal text-muted-foreground">
            · {formatKwh(device.savingsKwh)} {t.SUGGESTIONS_SAVINGS_PER_MONTH}
          </span>
        </p>
        <Button
          size="sm"
          variant={activated ? "ghost" : "outline"}
          className={`h-7 shrink-0 gap-1 rounded-lg px-2 text-xs ${activated ? "text-primary" : ""}`}
          disabled={activating || activated}
          onClick={handleActivate}
        >
          {activated ? (
            <><CheckCircle2 className="h-3.5 w-3.5" /> Đã lên lịch</>
          ) : activating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> ...</>
          ) : (
            <><Bell className="h-3.5 w-3.5" /> Kích hoạt</>
          )}
        </Button>
      </div>
    </div>
  );
}
