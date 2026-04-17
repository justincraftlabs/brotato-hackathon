"use client";

import { useState } from "react";
import {
  Bath,
  Bed,
  ChevronDown,
  ChevronUp,
  CookingPot,
  Loader2,
  Monitor,
  MoreHorizontal,
  Sofa,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateCo2,
  calculateMonthlyCost,
  calculateMonthlyKwh,
} from "@/lib/calculations";
import { formatCo2, formatKwh, formatVnd } from "@/lib/format";
import { useT } from "@/hooks/use-t";
import type { Appliance, Room, RoomType } from "@/lib/types";

interface SetupReviewProps {
  rooms: Room[];
  appliancesByRoom: Record<string, Appliance[]>;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

const ICON_MAP: Record<RoomType, ComponentType<{ className?: string }>> = {
  bedroom: Bed,
  living_room: Sofa,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  other: MoreHorizontal,
};

export function SetupReview({
  rooms,
  appliancesByRoom,
  isSubmitting,
  onConfirm,
  onBack,
}: SetupReviewProps) {
  const t = useT();
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  function toggleExpand(roomId: string) {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  }

  let totalKwh = 0;
  const roomSummaries = rooms.map((room) => {
    const appliances = appliancesByRoom[room.id] ?? [];
    let roomKwh = 0;

    for (const a of appliances) {
      roomKwh += calculateMonthlyKwh(a.wattage, a.dailyUsageHours);
    }

    totalKwh += roomKwh;
    const roomCost = calculateMonthlyCost(roomKwh);

    return { room, appliances, roomKwh, roomCost };
  });

  const totalCost = calculateMonthlyCost(totalKwh);
  const totalCo2 = calculateCo2(totalKwh);
  const totalAppliances = rooms.reduce(
    (sum, room) => sum + (appliancesByRoom[room.id]?.length ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <p className="text-center text-sm text-muted-foreground lg:text-left">
        {t.LABEL_REVIEW_TITLE}
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
      {roomSummaries.map(({ room, appliances, roomKwh, roomCost }) => {
        const Icon = ICON_MAP[room.type];
        const isExpanded = expandedRooms.has(room.id);

        return (
          <Card key={room.id}>
            <CardHeader
              className="cursor-pointer p-4"
              onClick={() => toggleExpand(room.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") {
                  return;
                }
                e.preventDefault();
                toggleExpand(room.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">
                    {t.ROOM_TYPE_LABELS[room.type]}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {t.ROOM_SIZE_LABELS[room.size]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {appliances.length} {t.LABEL_APPLIANCE_COUNT}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                <span>{formatKwh(roomKwh)}</span>
                <span>{formatVnd(roomCost)}</span>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t px-4 pb-4 pt-3">
                <div className="flex flex-col gap-2">
                  {appliances.map((a) => {
                    const aKwh = calculateMonthlyKwh(
                      a.wattage,
                      a.dailyUsageHours
                    );
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{a.name}</span>
                        <div className="flex gap-3 text-muted-foreground">
                          <span>{a.wattage}W</span>
                          <span>{formatKwh(aKwh)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
      </div>

      <Card className="border-primary">
        <CardContent className="p-4">
          <h3 className="mb-3 text-sm font-semibold">{t.LABEL_TOTAL}</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <SummaryItem
              label={t.LABEL_ROOM_COUNT}
              value={`${rooms.length} ${t.LABEL_ROOM_COUNT}`}
            />
            <SummaryItem
              label={t.LABEL_APPLIANCE_COUNT}
              value={`${totalAppliances} ${t.LABEL_APPLIANCE_COUNT}`}
            />
            <SummaryItem
              label={t.LABEL_MONTHLY_KWH}
              value={formatKwh(totalKwh)}
            />
            <SummaryItem
              label={t.LABEL_MONTHLY_COST}
              value={formatVnd(totalCost)}
              highlight
            />
            <SummaryItem
              label={t.LABEL_CO2}
              value={formatCo2(totalCo2)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 lg:static lg:bottom-auto lg:z-auto lg:px-0 lg:pt-4">
        <div className="mx-auto flex max-w-lg gap-3 lg:max-w-none">
          <Button
            variant="outline"
            className="h-12 flex-1"
            onClick={onBack}
            disabled={isSubmitting}
          >
            {t.BUTTON_BACK}
          </Button>
          <Button
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.LABEL_SUBMITTING}
              </>
            ) : (
              t.BUTTON_CONFIRM
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryItem({ label, value, highlight }: SummaryItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={
          highlight ? "text-sm font-semibold text-accent" : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
