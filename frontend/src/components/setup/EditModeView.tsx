"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import {
  addAppliances,
  deleteAppliance,
  getHome,
  updateAppliance,
} from "@/lib/api";
import type { Appliance, Home, RoomWithAppliances } from "@/lib/types";
import type { Translations } from "@/lib/translations";

import { ApplianceFormStep } from "./ApplianceForm";

type EditState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "room-list"; home: Home }
  | { status: "room-detail"; home: Home; roomId: string };

interface EditModeViewProps {
  homeId: string;
}

interface RoomCardProps {
  room: RoomWithAppliances;
  onSelect: (roomId: string) => void;
  t: Translations;
}

function RoomCard({ room, onSelect, t }: RoomCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary"
      onClick={() => onSelect(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") {
          return;
        }
        e.preventDefault();
        onSelect(room.id);
      }}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-semibold">{room.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.ROOM_TYPE_LABELS[room.type]}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {room.appliances.length} {t.SETUP_APPLIANCE_COUNT}
        </p>
      </CardContent>
    </Card>
  );
}

export function EditModeView({ homeId }: EditModeViewProps) {
  const t = useT();
  const [editState, setEditState] = useState<EditState>({ status: "loading" });

  const loadHome = useCallback(async () => {
    setEditState({ status: "loading" });

    const result = await getHome(homeId);

    if (!result.success) {
      setEditState({ status: "error", message: result.error });
      return;
    }

    setEditState({ status: "room-list", home: result.data });
  }, [homeId]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const selectRoom = useCallback(
    (roomId: string) => {
      if (editState.status !== "room-list" && editState.status !== "room-detail") {
        return;
      }
      setEditState({ status: "room-detail", home: editState.home, roomId });
    },
    [editState]
  );

  const backToRooms = useCallback(() => {
    if (editState.status !== "room-detail") {
      return;
    }
    setEditState({ status: "room-list", home: editState.home });
  }, [editState]);

  const reloadAndStayInRoom = useCallback(
    async (roomId: string) => {
      const result = await getHome(homeId);
      if (!result.success) {
        return;
      }
      setEditState({ status: "room-detail", home: result.data, roomId });
    },
    [homeId]
  );

  const handleAddAppliance = useCallback(
    async (
      roomId: string,
      appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      await addAppliances(homeId, roomId, [
        {
          name: appliance.name,
          type: appliance.type,
          wattage: appliance.wattage,
          dailyUsageHours: appliance.dailyUsageHours,
          standbyWattage: appliance.standbyWattage,
          usageHabit: appliance.usageHabit,
        },
      ]);
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleEditAppliance = useCallback(
    async (
      roomId: string,
      applianceId: string,
      updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      await updateAppliance(homeId, applianceId, {
        name: updates.name,
        type: updates.type,
        wattage: updates.wattage,
        dailyUsageHours: updates.dailyUsageHours,
        standbyWattage: updates.standbyWattage,
        usageHabit: updates.usageHabit,
      });
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleDeleteAppliance = useCallback(
    async (roomId: string, applianceId: string) => {
      await deleteAppliance(homeId, applianceId);
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  if (editState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SETUP_LOADING}</p>
      </div>
    );
  }

  if (editState.status === "error") {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SETUP_ERROR}
          </p>
          <p className="text-xs text-muted-foreground">{editState.message}</p>
          <Button variant="outline" size="sm" onClick={loadHome}>
            {t.SETUP_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editState.status === "room-list") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-xl font-bold">{t.SETUP_EDIT_TITLE}</h1>
        <p className="text-center text-sm text-muted-foreground">
          {t.SETUP_SELECT_ROOM}
        </p>
        {editState.home.rooms.map((room) => (
          <RoomCard key={room.id} room={room} onSelect={selectRoom} t={t} />
        ))}
      </div>
    );
  }

  const selectedRoom = editState.home.rooms.find(
    (r) => r.id === editState.roomId
  );

  if (!selectedRoom) {
    return null;
  }

  const singleRoomArray = [selectedRoom];
  const singleAppliancesByRoom: Record<string, Appliance[]> = {
    [selectedRoom.id]: selectedRoom.appliances,
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={backToRooms}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{selectedRoom.name}</h1>
      </div>

      <ApplianceFormStep
        rooms={singleRoomArray}
        appliancesByRoom={singleAppliancesByRoom}
        onAddAppliance={handleAddAppliance}
        onEditAppliance={handleEditAppliance}
        onDeleteAppliance={handleDeleteAppliance}
        onNext={backToRooms}
        onBack={backToRooms}
      />
    </div>
  );
}
