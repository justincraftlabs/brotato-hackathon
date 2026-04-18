"use client";

import {
  Clock,
  MapPin,
  Moon,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { calculateMonthlyCost } from "@/lib/calculations";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Home } from "@/lib/types";

/* ---------- Types ---------- */

type IotActionType = "smart_plug" | "schedule" | "temperature" | "sleep" | "presence";

interface IotSuggestion {
  id: string;
  type: IotActionType;
  applianceName: string;
  roomName: string;
  actionTitle: string;
  actionDetail: string;
  savingsKwh: number;
  savingsVnd: number;
}

interface ActionMeta {
  icon: ComponentType<{ className?: string }>;
  label: string;
  iconClass: string;
  bgClass: string;
}

/* ---------- Constants ---------- */

const ACTION_META: Record<IotActionType, ActionMeta> = {
  smart_plug: {
    icon: Zap,
    label: "Smart Plug",
    iconClass: "text-primary",
    bgClass: "bg-primary/15",
  },
  schedule: {
    icon: Clock,
    label: "Lên lịch",
    iconClass: "text-blue-400",
    bgClass: "bg-blue-400/15",
  },
  temperature: {
    icon: Thermometer,
    label: "Điều nhiệt",
    iconClass: "text-orange-400",
    bgClass: "bg-orange-400/15",
  },
  sleep: {
    icon: Moon,
    label: "Chế độ ngủ",
    iconClass: "text-purple-400",
    bgClass: "bg-purple-400/15",
  },
  presence: {
    icon: MapPin,
    label: "Hiện diện",
    iconClass: "text-teal-400",
    bgClass: "bg-teal-400/15",
  },
};

const PHASE2_FEATURE_ITEMS = [
  { icon: Zap, label: "Smart Plug", sub: "Điều khiển từ xa", colorClass: "text-primary", bgClass: "bg-primary/10" },
  { icon: Clock, label: "Lên lịch", sub: "Tự động bật/tắt", colorClass: "text-blue-400", bgClass: "bg-blue-400/10" },
  { icon: Wifi, label: "Theo dõi", sub: "Thời gian thực", colorClass: "text-teal-400", bgClass: "bg-teal-400/10" },
] as const;

const AC_TYPE_KEYWORDS = ["air_conditioner", "cooling", "ac"];
const HEATER_TYPE_KEYWORDS = ["heater", "heating", "water_heater"];
const STANDBY_MIN_W = 5;
const HIGH_WATTAGE_W = 500;
const HIGH_USAGE_H = 2;
const STANDBY_ELIM_RATE = 0.8;
const AC_SAVING_RATE = 0.15;
const HEATER_SAVING_RATE = 0.1;
const SLEEP_SAVING_RATE = 0.12;
const PRESENCE_SAVING_RATE = 0.2;
const MAX_SUGGESTIONS = 8;

/* ---------- Derivation ---------- */

function matchesType(type: string, keywords: string[]): boolean {
  return keywords.some((k) => type.toLowerCase().includes(k));
}

function deriveIotSuggestions(home: Home): IotSuggestion[] {
  const suggestions: IotSuggestion[] = [];

  for (const room of home.rooms) {
    const roomLabel = room.name ?? room.type;

    for (const appliance of room.appliances) {
      // Standby → smart plug auto-disconnect
      if (appliance.standbyWattage > STANDBY_MIN_W) {
        const savingsKwh =
          (appliance.standbyWattage / 1000) * 24 * 30 * STANDBY_ELIM_RATE;
        suggestions.push({
          id: `standby-${appliance.id}`,
          type: "smart_plug",
          applianceName: appliance.name,
          roomName: roomLabel,
          actionTitle: "Ngắt standby tự động",
          actionDetail: `Smart plug tắt nguồn sau 30 phút không hoạt động, loại bỏ ${appliance.standbyWattage}W điện vô hình liên tục.`,
          savingsKwh,
          savingsVnd: calculateMonthlyCost(savingsKwh),
        });
      }

      // AC → smart thermostat
      if (matchesType(appliance.type, AC_TYPE_KEYWORDS)) {
        const savingsKwh = appliance.monthlyKwh * AC_SAVING_RATE;
        suggestions.push({
          id: `temp-${appliance.id}`,
          type: "temperature",
          applianceName: appliance.name,
          roomName: roomLabel,
          actionTitle: "Điều nhiệt thông minh",
          actionDetail:
            "Tự tăng lên 27°C khi không có người, hạ về 24°C trước 30 phút bạn về nhà.",
          savingsKwh,
          savingsVnd: calculateMonthlyCost(savingsKwh),
        });
      }

      // Heater / water heater → off-peak schedule
      if (matchesType(appliance.type, HEATER_TYPE_KEYWORDS)) {
        const savingsKwh = appliance.monthlyKwh * HEATER_SAVING_RATE;
        suggestions.push({
          id: `schedule-${appliance.id}`,
          type: "schedule",
          applianceName: appliance.name,
          roomName: roomLabel,
          actionTitle: "Lên lịch giờ thấp điểm",
          actionDetail:
            "Tự bật lúc 22:00–6:00 khi giá điện EVN thấp, tiết kiệm đáng kể mỗi tháng.",
          savingsKwh,
          savingsVnd: calculateMonthlyCost(savingsKwh),
        });
      }

      // Bedroom + high daily use → sleep mode
      if (room.type === "bedroom" && appliance.dailyUsageHours > HIGH_USAGE_H) {
        const savingsKwh = appliance.monthlyKwh * SLEEP_SAVING_RATE;
        suggestions.push({
          id: `sleep-${appliance.id}`,
          type: "sleep",
          applianceName: appliance.name,
          roomName: roomLabel,
          actionTitle: "Chế độ ngủ tự động",
          actionDetail:
            "Tự tắt lúc 23:30, ngăn thiết bị chạy suốt đêm khi bạn đã ngủ.",
          savingsKwh,
          savingsVnd: calculateMonthlyCost(savingsKwh),
        });
      }

      // High wattage + high use (non-AC) → presence sensor
      if (
        appliance.wattage > HIGH_WATTAGE_W &&
        appliance.dailyUsageHours > HIGH_USAGE_H &&
        !matchesType(appliance.type, AC_TYPE_KEYWORDS)
      ) {
        const savingsKwh = appliance.monthlyKwh * PRESENCE_SAVING_RATE;
        suggestions.push({
          id: `presence-${appliance.id}`,
          type: "presence",
          applianceName: appliance.name,
          roomName: roomLabel,
          actionTitle: "Tắt khi rời khỏi nhà",
          actionDetail:
            "Cảm biến hiện diện tự ngắt điện ngay khi bạn ra ngoài, không cần nhớ tắt tay.",
          savingsKwh,
          savingsVnd: calculateMonthlyCost(savingsKwh),
        });
      }
    }
  }

  return suggestions
    .sort((a, b) => b.savingsVnd - a.savingsVnd)
    .slice(0, MAX_SUGGESTIONS);
}

/* ---------- Sub-components ---------- */

interface IotCardProps {
  suggestion: IotSuggestion;
  onAction: (s: IotSuggestion) => void;
}

function IotCard({ suggestion, onAction }: IotCardProps) {
  const meta = ACTION_META[suggestion.type];
  const Icon = meta.icon;

  return (
    <div className="glass rounded-2xl border border-border/50 p-3.5 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0 rounded-xl p-2", meta.bgClass)}>
          <Icon className={cn("h-4 w-4", meta.iconClass)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                meta.bgClass,
                meta.iconClass
              )}
            >
              {meta.label}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {suggestion.roomName}
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold leading-snug">
            {suggestion.applianceName} — {suggestion.actionTitle}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {suggestion.actionDetail}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="text-xs text-primary font-medium">
              ~{formatVnd(suggestion.savingsVnd)}
              <span className="font-normal text-muted-foreground">
                {" "}· {formatKwh(suggestion.savingsKwh)}/tháng
              </span>
            </p>
            <button
              type="button"
              onClick={() => onAction(suggestion)}
              className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              Áp dụng →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase2Dialog({
  suggestion,
  onClose,
}: {
  suggestion: IotSuggestion | null;
  onClose: () => void;
}) {
  const meta = suggestion ? ACTION_META[suggestion.type] : null;
  const ActionIcon = meta?.icon ?? Wifi;

  return (
    <Dialog open={suggestion !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[340px] overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
        {/* Gradient hero header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/8 to-transparent px-5 pb-5 pt-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          {/* Phase badge */}
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
            🚧 Tính năng IoT — Phase 2
          </span>

          {/* Icon + title row */}
          <div className="flex items-start gap-3">
            {meta && (
              <div className={cn("mt-0.5 shrink-0 rounded-xl p-2.5", meta.bgClass)}>
                <ActionIcon className={cn("h-5 w-5", meta.iconClass)} />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-snug">
                {suggestion?.applianceName}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm font-medium text-foreground/70">
                {suggestion?.actionTitle}
              </DialogDescription>
            </div>
          </div>

          {/* Savings highlight */}
          {suggestion && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
              <Zap className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Tiết kiệm ước tính/tháng</p>
                <p className="text-sm font-bold text-primary">
                  ~{formatVnd(suggestion.savingsVnd)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    · {formatKwh(suggestion.savingsKwh)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          {/* Phase 2 features */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Sẽ có trong Phase 2
            </p>
            <div className="flex gap-2">
              {PHASE2_FEATURE_ITEMS.map(({ icon: FIcon, label, sub, colorClass, bgClass }) => (
                <div
                  key={label}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-xl px-1 py-3",
                    bgClass
                  )}
                >
                  <FIcon className={cn("h-4 w-4", colorClass)} />
                  <p className={cn("text-center text-[9px] font-bold leading-none", colorClass)}>
                    {label}
                  </p>
                  <p className="text-center text-[8px] leading-tight text-muted-foreground">
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interim tip */}
          <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-3.5 py-3">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              💡 Trong khi chờ: làm theo gợi ý thủ công từ AI để rút phích hoặc
              bật/tắt đúng giờ — tiết kiệm tương đương!
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-border/30 px-4 py-3">
          <Button size="sm" className="btn-primary-gradient rounded-xl px-5" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplyAllDialog({
  open,
  suggestions,
  onClose,
}: {
  open: boolean;
  suggestions: IotSuggestion[];
  onClose: () => void;
}) {
  const totalVnd = suggestions.reduce((sum, s) => sum + s.savingsVnd, 0);
  const totalKwh = suggestions.reduce((sum, s) => sum + s.savingsKwh, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex w-[calc(100%-1.5rem)] max-w-[440px] flex-col overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl" style={{ maxHeight: "85dvh" }}>
        {/* Gradient hero header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/8 to-transparent px-5 pb-5 pt-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
            🚧 Tính năng IoT — Phase 2
          </span>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-xl bg-primary/15 p-2.5">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-snug">
                Áp dụng tất cả {suggestions.length} automation
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm font-medium text-foreground/70">
                Điều khiển thiết bị thông minh
              </DialogDescription>
            </div>
          </div>

          {/* Savings highlight */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
            <Zap className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Tiết kiệm ước tính/tháng</p>
              <p className="text-sm font-bold text-primary">
                ~{formatVnd(totalVnd)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  · {formatKwh(totalKwh)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 px-4 py-4">
            {/* Suggestion list */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Sẽ có trong Phase 2
              </p>
              <div className="overflow-hidden rounded-xl border border-border/40 divide-y divide-border/40">
                {suggestions.map((s) => {
                  const meta = ACTION_META[s.type];
                  const Icon = meta.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className={cn("shrink-0 rounded-lg p-1.5", meta.bgClass)}>
                        <Icon className={cn("h-3.5 w-3.5", meta.iconClass)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-tight">
                          {s.applianceName}
                        </p>
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {s.actionTitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-primary">
                        {formatVnd(s.savingsVnd)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-3.5 py-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                💡 Trong khi chờ Phase 2: thực hiện thủ công từng gợi ý để đạt
                mức tiết kiệm tương đương ngay hôm nay!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end border-t border-border/30 px-4 py-3">
          <Button size="sm" className="btn-primary-gradient rounded-xl px-5" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Skeleton ---------- */

const SKELETON_IOT_COUNT = 4;

function IotSkeletonLoader() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_IOT_COUNT }).map((_, i) => (
        <div key={i} className="glass rounded-2xl border border-border/50 p-3.5">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-xl" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-3 w-12 rounded-md" />
              </div>
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Panel ---------- */

interface IotSuggestionsPanelProps {
  home: Home | null;
  loading: boolean;
}

export function IotSuggestionsPanel({ home, loading }: IotSuggestionsPanelProps) {
  const [activeAction, setActiveAction] = useState<IotSuggestion | null>(null);
  const [applyAllOpen, setApplyAllOpen] = useState(false);

  const suggestions = home ? deriveIotSuggestions(home) : [];
  const totalSavingsVnd = suggestions.reduce((sum, s) => sum + s.savingsVnd, 0);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header summary card */}
        <div className="glass rounded-2xl border border-primary/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                <Wifi className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Tự động hóa IoT</p>
                <p className="text-xs text-muted-foreground">
                  Điều khiển thiết bị thông minh
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              Phase 2
            </span>
          </div>

          {!loading && suggestions.length > 0 && (
            <div className="mt-3 border-t border-border/40 pt-3">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Tiết kiệm thêm ước tính</p>
                  <p className="text-xl font-bold text-primary">
                    ~{formatVnd(totalSavingsVnd)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /tháng
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    với {suggestions.length} automation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyAllOpen(true)}
                  className="shrink-0 rounded-xl border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
                >
                  Áp dụng tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <IotSkeletonLoader />}

        {/* No home */}
        {!loading && !home && (
          <div className="glass rounded-2xl border border-border/50 p-6 text-center">
            <Wifi className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Thiết lập nhà để xem gợi ý IoT
            </p>
          </div>
        )}

        {/* No suggestions */}
        {!loading && home && suggestions.length === 0 && (
          <div className="glass rounded-2xl border border-border/50 p-6 text-center">
            <Wifi className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Không tìm thấy cơ hội tự động hóa phù hợp
            </p>
          </div>
        )}

        {/* Suggestion cards */}
        {!loading &&
          suggestions.map((s) => (
            <IotCard key={s.id} suggestion={s} onAction={setActiveAction} />
          ))}
      </div>

      <Phase2Dialog
        suggestion={activeAction}
        onClose={() => setActiveAction(null)}
      />
      <ApplyAllDialog
        open={applyAllOpen}
        suggestions={suggestions}
        onClose={() => setApplyAllOpen(false)}
      />
    </>
  );
}
