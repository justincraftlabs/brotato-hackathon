"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { formatKwh, formatVnd } from "@/lib/format";
import type { RoomSuggestion } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { DeviceSuggestionCard } from "./DeviceSuggestionCard";

interface RoomAccordionItemProps {
  room: RoomSuggestion;
  defaultOpen?: boolean;
  t: Translations;
}

export function RoomAccordionItem({ room, defaultOpen = false, t }: RoomAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        className="flex w-full items-center justify-between gap-2 bg-card px-4 py-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <p className="font-semibold">{room.roomName}</p>
          <span className="text-xs text-muted-foreground">
            {room.devices.length} {t.SUGGESTIONS_TIPS_SUFFIX}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-primary">
            ~{formatVnd(room.totalSavingsVnd)}
          </span>
          {/* Show kWh savings on desktop alongside VND */}
          <span className="hidden text-xs text-muted-foreground lg:inline">
            · {formatKwh(room.totalSavingsKwh)}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 bg-background px-4 pb-4 pt-2">
          <p className="text-xs text-muted-foreground italic">{room.summary}</p>
          {/* Desktop: 2-column grid; mobile: single column */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {room.devices.map((device, index) => (
              <DeviceSuggestionCard
                key={`${device.applianceName}-${index}`}
                device={device}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
