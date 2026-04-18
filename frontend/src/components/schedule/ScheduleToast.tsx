"use client";

import { X, CheckCircle2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-t";
import { completeScheduleApp } from "@/lib/api";
import { formatVnd } from "@/lib/format";
import type { ScheduleFiredEvent } from "@/lib/types";

const AUTO_DISMISS_MS = 12000;

interface ScheduleToastProps {
  event: ScheduleFiredEvent;
  onDismiss: (scheduleId: string) => void;
}

export function ScheduleToast({ event, onDismiss }: ScheduleToastProps) {
  const t = useT();
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-dismiss after AUTO_DISMISS_MS
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(event.scheduleId), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [event.scheduleId, onDismiss]);

  async function handleDone() {
    setCompleting(true);
    await completeScheduleApp(event.scheduleId);
    setDone(true);
    setTimeout(() => onDismiss(event.scheduleId), 1200);
  }

  return (
    <div
      className={`
        glass rounded-2xl border border-primary/30 p-4 shadow-lg
        animate-in slide-in-from-bottom-4 duration-300
        transition-opacity
        ${done ? "opacity-0" : "opacity-100"}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary">{t.SCHEDULE_TOAST_TITLE}</p>
          <p className="mt-0.5 text-sm font-medium leading-snug">{event.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {event.roomName} — {event.applianceName}
          </p>
          <p className="mt-1 text-xs text-primary font-semibold">
            {t.SCHEDULE_TOAST_SAVINGS_PREFIX}: {formatVnd(event.savingsVnd)}{t.VAMPIRE_INFO_PER_MONTH}
          </p>
        </div>
        <button
          onClick={() => onDismiss(event.scheduleId)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={t.SCHEDULE_TOAST_CLOSE}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Button
        size="sm"
        className="btn-primary-gradient mt-3 w-full rounded-xl gap-1.5"
        disabled={completing || done}
        onClick={handleDone}
      >
        <CheckCircle2 className="h-4 w-4" />
        {done ? t.SCHEDULE_TOAST_LOGGED : completing ? t.SCHEDULE_TOAST_DOING : t.SCHEDULE_TOAST_DONE}
      </Button>
    </div>
  );
}
