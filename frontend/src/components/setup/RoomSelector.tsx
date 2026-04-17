"use client";

import {
  Bath,
  Bed,
  CookingPot,
  Monitor,
  MoreHorizontal,
  Sofa,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROOM_SIZE_LABELS, ROOM_TYPE_LABELS } from "@/lib/constants";
import {
  BUTTON_NEXT,
  LABEL_SELECT_ROOMS,
} from "@/lib/setup-constants";
import type { Room, RoomSize, RoomType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoomSelectorProps {
  rooms: Room[];
  onAddRoom: (type: RoomType) => void;
  onRemoveRoom: (roomId: string) => void;
  onChangeSize: (roomId: string, size: RoomSize) => void;
  onNext: () => void;
}

const ICON_MAP: Record<RoomType, ComponentType<{ className?: string }>> = {
  bedroom: Bed,
  living_room: Sofa,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  other: MoreHorizontal,
};

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
const ROOM_SIZES = Object.keys(ROOM_SIZE_LABELS) as RoomSize[];

export function RoomSelector({
  rooms,
  onAddRoom,
  onRemoveRoom,
  onChangeSize,
  onNext,
}: RoomSelectorProps) {
  const hasRooms = rooms.length > 0;

  function getRoomCountForType(type: RoomType): number {
    return rooms.filter((r) => r.type === type).length;
  }

  function getRoomsForType(type: RoomType): Room[] {
    return rooms.filter((r) => r.type === type);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-sm text-muted-foreground">
        {LABEL_SELECT_ROOMS}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ROOM_TYPES.map((type) => {
          const Icon = ICON_MAP[type];
          const count = getRoomCountForType(type);
          const isAdded = count > 0;

          return (
            <Card
              key={type}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isAdded && "border-primary"
              )}
              onClick={() => onAddRoom(type)}
              role="button"
              tabIndex={0}
              aria-label={ROOM_TYPE_LABELS[type]}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") {
                  return;
                }
                e.preventDefault();
                onAddRoom(type);
              }}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="relative">
                  <Icon className="h-8 w-8 text-primary" />
                  {isAdded && (
                    <Badge className="absolute -right-4 -top-2 h-5 min-w-5 justify-center px-1 text-[10px]">
                      x{count}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {ROOM_TYPE_LABELS[type]}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasRooms && (
        <div className="flex flex-col gap-3">
          {ROOM_TYPES.map((type) => {
            const typeRooms = getRoomsForType(type);
            if (typeRooms.length === 0) {
              return null;
            }

            return typeRooms.map((room, index) => (
              <RoomSizeRow
                key={room.id}
                room={room}
                index={index}
                totalCount={typeRooms.length}
                onChangeSize={onChangeSize}
                onRemove={onRemoveRoom}
              />
            ));
          })}
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="mx-auto max-w-lg">
          <Button
            className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!hasRooms}
            onClick={onNext}
          >
            {BUTTON_NEXT}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RoomSizeRowProps {
  room: Room;
  index: number;
  totalCount: number;
  onChangeSize: (roomId: string, size: RoomSize) => void;
  onRemove: (roomId: string) => void;
}

function RoomSizeRow({
  room,
  index,
  totalCount,
  onChangeSize,
  onRemove,
}: RoomSizeRowProps) {
  const Icon = ICON_MAP[room.type];
  const displayIndex = totalCount > 1 ? ` ${index + 1}` : "";

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {ROOM_TYPE_LABELS[room.type]}{displayIndex}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onRemove(room.id)}
          aria-label={`Xoa ${ROOM_TYPE_LABELS[room.type]}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex gap-2">
        {ROOM_SIZES.map((size) => (
          <Button
            key={size}
            variant={room.size === size ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              room.size === size && "bg-primary text-primary-foreground"
            )}
            onClick={() => onChangeSize(room.id, size)}
          >
            {ROOM_SIZE_LABELS[size]}
          </Button>
        ))}
      </div>
    </Card>
  );
}
