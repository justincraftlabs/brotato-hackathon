"use client";

import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/contexts/schedules-context";
import { formatKwh, formatVnd } from "@/lib/format";
import { NAV_ROUTES } from "@/lib/constants";
import type { ActivateAllItem, DeviceSuggestion, SuggestionPriority } from "@/lib/types";
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
  homeId: string;
  roomName: string;
  onActivated?: (roomName: string, applianceName: string, item: ActivateAllItem) => void;
  t: Translations;
}

function getPriorityLabel(priority: SuggestionPriority, t: Translations): string {
  if (priority === "high") return t.SUGGESTIONS_PRIORITY_HIGH;
  if (priority === "medium") return t.SUGGESTIONS_PRIORITY_MEDIUM;
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

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className="text-xs font-medium text-primary">
          {formatVnd(device.savingsVnd)}{" "}
          <span className="font-normal text-muted-foreground">
            · {formatKwh(device.savingsKwh)} {t.SUGGESTIONS_SAVINGS_PER_MONTH}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={NAV_ROUTES.SIMULATOR}
            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {t.SUGGESTIONS_TRY_SIMULATOR}
          </Link>
          <Button
            size="sm"
            variant={activated ? "ghost" : "outline"}
            className={`h-7 gap-1 rounded-lg px-2 text-xs ${activated ? "text-primary" : ""}`}
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
    </div>
  );
}
