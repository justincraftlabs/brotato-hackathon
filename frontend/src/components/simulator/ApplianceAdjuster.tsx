"use client";

import {
  Bath,
  Bed,
  CookingPot,
  Monitor,
  MoreHorizontal,
  Sofa,
} from "lucide-react";
import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
        <span className="flex-1 truncate text-sm font-medium">
          {appliance.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
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
    <div className="flex flex-col gap-4">
      {rooms.map((room) => {
        const Icon = ICON_MAP[room.type];
        return (
          <Card key={room.id}>
            <CardContent className="flex flex-col gap-3 p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  {t.ROOM_TYPE_LABELS[room.type]}
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
