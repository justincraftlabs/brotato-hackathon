"use client";

import {
  Bell,
  Clock,
  Flame,
  Loader2,
  Pause,
  Play,
  Rocket,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { fireAllSchedules, fireScheduleApi } from "@/lib/api";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import type { Translations } from "@/lib/translations";
import type { Schedule } from "@/lib/types";
import { useSchedules } from "@/contexts/schedules-context";
import Link from "next/link";

const FIRE_ALL_TOAST_MS = 5000;

function getScheduleTypeLabel(type: Schedule["type"], t: Translations): string {
  if (type === "behavior") return t.SCHEDULES_TYPE_BEHAVIOR;
  if (type === "upgrade") return t.SCHEDULES_TYPE_UPGRADE;
  if (type === "schedule") return t.SCHEDULES_TYPE_SCHEDULE;
  return t.SCHEDULES_TYPE_VAMPIRE;
}

function getStatusLabel(status: Schedule["status"], t: Translations): string {
  if (status === "active") return t.SCHEDULES_STATUS_ACTIVE;
  if (status === "paused") return t.SCHEDULES_STATUS_PAUSED;
  return t.SCHEDULES_STATUS_COMPLETED;
}

const STATUS_COLORS: Record<Schedule["status"], string> = {
  active: "text-primary",
  paused: "text-muted-foreground",
  completed: "text-chart-2",
};

interface NoHomeStateProps {
  t: Translations;
}

function NoHomeState({ t }: NoHomeStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Bell className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{t.SCHEDULES_NO_HOME_TITLE}</p>
        <p className="text-sm text-muted-foreground">{t.SCHEDULES_NO_HOME_MESSAGE}</p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>{t.SCHEDULES_NO_HOME_CTA}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ScheduleCardProps {
  schedule: Schedule;
  onToggle: (id: string) => void;
  onFire: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
  t: Translations;
}

function ScheduleCard({ schedule, onToggle, onFire, onDelete, busy, t }: ScheduleCardProps) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{schedule.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {schedule.roomName} — {schedule.applianceName}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {getScheduleTypeLabel(schedule.type, t)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {schedule.scheduledTime}
            </span>
            <span className={`text-[10px] font-medium ${STATUS_COLORS[schedule.status]}`}>
              {getStatusLabel(schedule.status, t)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-xl bg-primary/5 px-3 py-2 text-xs">
        <span className="text-muted-foreground">{t.SCHEDULES_SAVINGS_LABEL}</span>
        <span className="font-semibold text-primary">
          {formatVnd(schedule.savingsVnd)}
          {t.SCHEDULES_SAVINGS_SUFFIX}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5"
          disabled={busy || schedule.status === "completed"}
          onClick={() => onToggle(schedule.scheduleId)}
        >
          {schedule.status === "active" ? (
            <><Pause className="h-3.5 w-3.5" /> {t.SCHEDULES_BUTTON_PAUSE}</>
          ) : (
            <><Play className="h-3.5 w-3.5" /> {t.SCHEDULES_BUTTON_ACTIVATE}</>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-orange-500 border-orange-500/40 hover:bg-orange-500/10"
          disabled={busy || schedule.status !== "active"}
          onClick={() => onFire(schedule.scheduleId)}
        >
          <Flame className="h-3.5 w-3.5" />
          {t.SCHEDULES_BUTTON_DEMO}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={busy}
          onClick={() => onDelete(schedule.scheduleId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SchedulesPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const { schedules, loading, toggle, remove, refresh } = useSchedules();
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [firingAll, setFiringAll] = useState(false);
  const [fireAllMsg, setFireAllMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("completed") === "1") {
      refresh();
    }
  }, [refresh]);

  function markBusy(id: string) {
    setBusyIds((prev) => { const n = new Set(prev); n.add(id); return n; });
  }
  function clearBusy(id: string) {
    setBusyIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function handleToggle(scheduleId: string) {
    markBusy(scheduleId);
    await toggle(scheduleId);
    clearBusy(scheduleId);
  }

  async function handleFire(scheduleId: string) {
    markBusy(scheduleId);
    await fireScheduleApi(scheduleId);
    clearBusy(scheduleId);
  }

  async function handleDelete(scheduleId: string) {
    markBusy(scheduleId);
    await remove(scheduleId);
    clearBusy(scheduleId);
  }

  async function handleFireAll() {
    if (!homeId) return;
    setFiringAll(true);
    setFireAllMsg(null);
    const result = await fireAllSchedules(homeId);
    setFiringAll(false);
    if (result.success) {
      setFireAllMsg(
        t.SCHEDULES_DEMO_SENT.replace("{count}", String(result.data.queued))
      );
      setTimeout(() => setFireAllMsg(null), FIRE_ALL_TOAST_MS);
    }
  }

  if (!homeId) return <NoHomeState t={t} />;

  const activeCount = schedules.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t.SCHEDULES_PAGE_TITLE}</h1>
          <p className="text-sm text-muted-foreground">
            {t.SCHEDULES_PAGE_STATS
              .replace("{active}", String(activeCount))
              .replace("{total}", String(schedules.length))}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          {t.SCHEDULES_REFRESH}
        </Button>
      </div>

      <div className="glass rounded-2xl border border-orange-500/20 p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold">{t.SCHEDULES_DEMO_TITLE}</p>
        <p className="text-xs text-muted-foreground">
          {t.SCHEDULES_DEMO_DESCRIPTION}
        </p>
        {fireAllMsg && (
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
            {fireAllMsg}
          </div>
        )}
        <Button
          className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
          disabled={firingAll || activeCount === 0}
          onClick={handleFireAll}
        >
          {firingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {firingAll ? t.SCHEDULES_DEMO_FIRING : t.SCHEDULES_DEMO_FIRE_ALL}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t.SCHEDULES_LOADING}</span>
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">{t.SCHEDULES_EMPTY_TITLE}</p>
            <p className="text-sm text-muted-foreground">
              {t.SCHEDULES_EMPTY_MESSAGE}
            </p>
            <Button asChild variant="outline">
              <Link href={NAV_ROUTES.SUGGESTIONS}>{t.SCHEDULES_EMPTY_CTA}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.scheduleId}
          schedule={schedule}
          onToggle={handleToggle}
          onFire={handleFire}
          onDelete={handleDelete}
          busy={busyIds.has(schedule.scheduleId)}
          t={t}
        />
      ))}
    </div>
  );
}
