"use client";

import {
  Bath,
  Bed,
  CookingPot,
  Monitor,
  MoreHorizontal,
  PlugZap,
  Sofa,
} from "lucide-react";
import type { ComponentType } from "react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/cn";
import { formatKwh } from "@/lib/format";
import {
  COOLING_TYPE,
  HEATING_TYPE,
  COOLING_TEMP_SLIDER,
  HEATING_TEMP_SLIDER,
  DEFAULT_COOLING_TEMP,
  DEFAULT_HEATING_TEMP,
  SIMULATOR_SLIDER,
} from "@/lib/simulator-constants";
import type { Translations } from "@/lib/translations";
import type { Appliance, RoomType, RoomWithAppliances } from "@/lib/types";
import { useT } from "@/hooks/use-t";

interface ApplianceAdjustment {
  newDailyHours?: number;
  newTemperature?: number;
  standbyOff?: boolean;
}

interface ApplianceAdjusterProps {
  rooms: RoomWithAppliances[];
  adjustments: Record<string, ApplianceAdjustment>;
  onAdjust: (applianceId: string, adjustment: ApplianceAdjustment) => void;
}

const ICON_MAP: Record<RoomType, ComponentType<{ className?: string }>> = {
  bedroom: Bed,
  living_room: Sofa,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  other: MoreHorizontal,
};

const ZERO_DELTA = 0;
const STANDBY_HOURS_PER_DAY = 24;
const STANDBY_DAYS_PER_MONTH = 30;

function calcStandbyKwh(standbyWattage: number): number {
  return (standbyWattage / 1000) * STANDBY_HOURS_PER_DAY * STANDBY_DAYS_PER_MONTH;
}

function isTemperatureAdjustable(type: string): boolean {
  return type === COOLING_TYPE || type === HEATING_TYPE;
}

function getTempSliderConfig(type: string) {
  if (type === HEATING_TYPE) {
    return HEATING_TEMP_SLIDER;
  }
  return COOLING_TEMP_SLIDER;
}

function getDefaultTemp(type: string): number {
  if (type === HEATING_TYPE) {
    return DEFAULT_HEATING_TEMP;
  }
  return DEFAULT_COOLING_TEMP;
}

function getStatusDotColor(
  originalHours: number,
  adjustedHours: number
): string {
  const delta = adjustedHours - originalHours;
  if (delta < ZERO_DELTA) {
    return "bg-primary";
  }
  if (delta > ZERO_DELTA) {
    return "bg-accent";
  }
  return "bg-muted-foreground";
}

interface ApplianceRowProps {
  appliance: Appliance;
  adjustment: ApplianceAdjustment | undefined;
  onAdjust: (applianceId: string, adjustment: ApplianceAdjustment) => void;
  t: Translations;
}

function ApplianceRow({ appliance, adjustment, onAdjust, t }: ApplianceRowProps) {
  const currentHours = adjustment?.newDailyHours ?? appliance.dailyUsageHours;
  const dotColor = getStatusDotColor(appliance.dailyUsageHours, currentHours);
  const showTempSlider = isTemperatureAdjustable(appliance.type);
  const standbyKwhMonthly = calcStandbyKwh(appliance.standbyWattage);

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
        <span className="flex-1 truncate text-sm font-medium">
          {appliance.name}
        </span>
        <span className="rounded-full bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
          {formatKwh(appliance.monthlyKwh)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {t.SIMULATOR_DAILY_HOURS_LABEL}
          </span>
          <span className="text-xs font-semibold text-primary">
            {currentHours} {t.SIMULATOR_HOURS_SUFFIX}
          </span>
        </div>
        <Slider
          min={SIMULATOR_SLIDER.HOURS_MIN}
          max={SIMULATOR_SLIDER.HOURS_MAX}
          step={SIMULATOR_SLIDER.HOURS_STEP}
          value={[currentHours]}
          onValueChange={([val]) =>
            onAdjust(appliance.id, {
              ...adjustment,
              newDailyHours: val,
            })
          }
          aria-label={`${appliance.name} ${t.SIMULATOR_DAILY_HOURS_LABEL}`}
        />
      </div>

      {showTempSlider && (() => {
        const tempConfig = getTempSliderConfig(appliance.type);
        const defaultTemp = getDefaultTemp(appliance.type);
        const currentTemp = adjustment?.newTemperature ?? defaultTemp;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t.SIMULATOR_TEMPERATURE_LABEL}
              </span>
              <span className="text-xs font-semibold text-primary">
                {currentTemp}{"°C"}
              </span>
            </div>
            <Slider
              min={tempConfig.MIN}
              max={tempConfig.MAX}
              step={tempConfig.STEP}
              value={[currentTemp]}
              onValueChange={([val]) =>
                onAdjust(appliance.id, {
                  ...adjustment,
                  newTemperature: val,
                })
              }
              aria-label={`${appliance.name} ${t.SIMULATOR_TEMPERATURE_LABEL}`}
            />
          </div>
        );
      })()}

      {appliance.standbyWattage > ZERO_DELTA && (
        <button
          type="button"
          onClick={() =>
            onAdjust(appliance.id, {
              ...adjustment,
              standbyOff: !adjustment?.standbyOff,
            })
          }
          className={cn(
            "mt-1 flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors",
            adjustment?.standbyOff
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-amber-400/50 bg-amber-400/10 text-amber-400 hover:border-amber-400/80 hover:bg-amber-400/20"
          )}
        >
          <span className="flex items-center gap-1.5">
            <PlugZap className="h-3 w-3 shrink-0" />
            {t.SIMULATOR_STANDBY_OFF_LABEL}
          </span>
          <span className="text-[10px] font-medium">
            {adjustment?.standbyOff
              ? `−${formatKwh(standbyKwhMonthly)}`
              : `${t.SIMULATOR_STANDBY_KWH_LABEL}: ${formatKwh(standbyKwhMonthly)}`}
          </span>
        </button>
      )}
    </div>
  );
}

export function ApplianceAdjuster({
  rooms,
  adjustments,
  onAdjust,
}: ApplianceAdjusterProps) {
  const t = useT();

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4">
      {rooms.map((room) => {
        const Icon = ICON_MAP[room.type];
        const roomTotalKwh = room.appliances.reduce(
          (sum, a) => sum + a.monthlyKwh,
          ZERO_DELTA
        );
        return (
          <div key={room.id} className="glass rounded-2xl border border-border/50">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">
                    {t.ROOM_TYPE_LABELS[room.type]}
                  </span>
                </div>
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
                  {formatKwh(roomTotalKwh)}
                </span>
              </div>
              {room.appliances.map((appliance) => (
                <ApplianceRow
                  key={appliance.id}
                  appliance={appliance}
                  adjustment={adjustments[appliance.id]}
                  onAdjust={onAdjust}
                  t={t}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
