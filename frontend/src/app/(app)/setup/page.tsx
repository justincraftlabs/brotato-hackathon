"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { EditModeView } from "@/components/setup/EditModeView";
import { StepIndicator } from "@/components/setup/StepIndicator";
import { RoomSelector } from "@/components/setup/RoomSelector";
import { ApplianceFormStep } from "@/components/setup/ApplianceForm";
import { SetupReview } from "@/components/setup/SetupReview";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { addAppliances, setupHome } from "@/lib/api";
import { LOCAL_STORAGE_HOME_ID_KEY } from "@/lib/constants";
import {
  APPLIANCE_STEP_INDEX,
  DASHBOARD_ROUTE,
  REVIEW_STEP_INDEX,
  ROOM_STEP_INDEX,
} from "@/lib/setup-constants";
import type { Appliance, Room, RoomSize, RoomType } from "@/lib/types";

type WizardStep =
  | typeof ROOM_STEP_INDEX
  | typeof APPLIANCE_STEP_INDEX
  | typeof REVIEW_STEP_INDEX;

const DEFAULT_ROOM_SIZE: RoomSize = "medium";
let roomCounter = 0;

function generateRoomId(): string {
  roomCounter += 1;
  return `room-${Date.now()}-${roomCounter}`;
}

let applianceCounter = 0;

function generateApplianceId(): string {
  applianceCounter += 1;
  return `appliance-${Date.now()}-${applianceCounter}`;
}

function FreshWizard() {
  const router = useRouter();
  const t = useT();
  const [, setHomeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);

  const [currentStep, setCurrentStep] = useState<WizardStep>(ROOM_STEP_INDEX);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [appliancesByRoom, setAppliancesByRoom] = useState<
    Record<string, Appliance[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const handleAddRoom = useCallback((type: RoomType, roomTypeLabels: Record<RoomType, string>) => {
    setRooms((prev) => {
      const sameTypeCount = prev.filter((r) => r.type === type).length;
      const baseName = roomTypeLabels[type];
      const name = sameTypeCount === 0 ? baseName : `${baseName} ${sameTypeCount + 1}`;
      const newRoom: Room = { id: generateRoomId(), name, type, size: DEFAULT_ROOM_SIZE };
      setAppliancesByRoom((ap) => ({ ...ap, [newRoom.id]: [] }));
      return [...prev, newRoom];
    });
  }, []);

  const handleRemoveRoom = useCallback((roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setAppliancesByRoom((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const handleChangeSize = useCallback((roomId: string, size: RoomSize) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) {
          return r;
        }
        return { ...r, size };
      })
    );
  }, []);

  const handleAddAppliance = useCallback(
    (
      roomId: string,
      appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      const newAppliance: Appliance = {
        ...appliance,
        id: generateApplianceId(),
        roomId,
        monthlyKwh: 0,
        monthlyCost: 0,
      };

      setAppliancesByRoom((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] ?? []), newAppliance],
      }));
    },
    []
  );

  const handleEditAppliance = useCallback(
    (
      roomId: string,
      applianceId: string,
      updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      setAppliancesByRoom((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).map((a) => {
          if (a.id !== applianceId) {
            return a;
          }
          return { ...a, ...updates };
        }),
      }));
    },
    []
  );

  const handleDeleteAppliance = useCallback(
    (roomId: string, applianceId: string) => {
      setAppliancesByRoom((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).filter((a) => a.id !== applianceId),
      }));
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setSetupError(null);

    const roomPayloads = rooms.map((r) => ({
      name: r.name,
      type: r.type,
      size: r.size,
    }));

    const setupResult = await setupHome(roomPayloads);

    if (!setupResult.success) {
      setSetupError(setupResult.error);
      setIsSubmitting(false);
      return;
    }

    const home = setupResult.data;
    setHomeId(home.homeId);

    // Match server rooms to local rooms by index (same order as submitted)
    for (let i = 0; i < home.rooms.length; i++) {
      const serverRoom = home.rooms[i];
      const localRoom = rooms[i];
      if (!localRoom) {
        continue;
      }

      const localAppliances = appliancesByRoom[localRoom.id] ?? [];
      if (localAppliances.length === 0) {
        continue;
      }

      const appliancePayloads = localAppliances.map((a) => ({
        name: a.name,
        type: a.type,
        wattage: a.wattage,
        dailyUsageHours: a.dailyUsageHours,
        standbyWattage: a.standbyWattage,
        usageHabit: a.usageHabit,
      }));

      await addAppliances(home.homeId, serverRoom.roomId, appliancePayloads);
    }

    setIsSubmitting(false);
    router.push(DASHBOARD_ROUTE);
  }, [rooms, appliancesByRoom, setHomeId, router]);

  function goToStep(step: WizardStep) {
    setCurrentStep(step);
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <h1 className="text-center text-xl font-bold">{t.LABEL_SETUP_TITLE}</h1>

      <StepIndicator currentStep={currentStep} />

      {setupError && (
        <p className="text-sm text-destructive text-center">{setupError}</p>
      )}

      <div
        className="transition-opacity duration-200"
        key={currentStep}
      >
        {currentStep === ROOM_STEP_INDEX && (
          <RoomSelector
            rooms={rooms}
            onAddRoom={(type) => handleAddRoom(type, t.ROOM_TYPE_LABELS)}
            onRemoveRoom={handleRemoveRoom}
            onChangeSize={handleChangeSize}
            onNext={() => goToStep(APPLIANCE_STEP_INDEX)}
          />
        )}

        {currentStep === APPLIANCE_STEP_INDEX && (
          <ApplianceFormStep
            rooms={rooms}
            appliancesByRoom={appliancesByRoom}
            onAddAppliance={handleAddAppliance}
            onEditAppliance={handleEditAppliance}
            onDeleteAppliance={handleDeleteAppliance}
            onNext={() => goToStep(REVIEW_STEP_INDEX)}
            onBack={() => goToStep(ROOM_STEP_INDEX)}
          />
        )}

        {currentStep === REVIEW_STEP_INDEX && (
          <SetupReview
            rooms={rooms}
            appliancesByRoom={appliancesByRoom}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm}
            onBack={() => goToStep(APPLIANCE_STEP_INDEX)}
          />
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);

  if (homeId) {
    return <EditModeView homeId={homeId} />;
  }

  return <FreshWizard />;
}
