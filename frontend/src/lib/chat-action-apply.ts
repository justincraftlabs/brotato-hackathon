import { addAppliances, deleteAppliance, getHome, updateAppliance } from "./api";
import type { ChatAction } from "./chat-action";
import type { Appliance, Home, RoomWithAppliances } from "./types";

export type ApplyResult =
  | { success: true }
  | { success: false; errorKey: "ROOM_NOT_FOUND" | "APPLIANCE_NOT_FOUND" | "API_ERROR"; detail: string };

export async function applyChatAction(homeId: string, action: ChatAction): Promise<ApplyResult> {
  const homeResult = await getHome(homeId);
  if (!homeResult.success) {
    return { success: false, errorKey: "API_ERROR", detail: homeResult.error };
  }
  const home = homeResult.data;
  const room = findRoomByName(home, action.roomName);
  if (!room) {
    return { success: false, errorKey: "ROOM_NOT_FOUND", detail: action.roomName };
  }

  if (action.operation === "add") {
    const response = await addAppliances(homeId, room.id, [
      {
        name: action.appliance.name,
        type: action.appliance.type,
        wattage: action.appliance.wattage,
        dailyUsageHours: action.appliance.dailyUsageHours,
        standbyWattage: action.appliance.standbyWattage ?? 0,
        usageHabit: action.appliance.usageHabit ?? "",
      },
    ]);
    if (!response.success) {
      return { success: false, errorKey: "API_ERROR", detail: response.error };
    }
    return { success: true };
  }

  const appliance = findApplianceByName(room, action.applianceName);
  if (!appliance) {
    return { success: false, errorKey: "APPLIANCE_NOT_FOUND", detail: action.applianceName };
  }

  if (action.operation === "delete") {
    const response = await deleteAppliance(homeId, appliance.id);
    if (!response.success) {
      return { success: false, errorKey: "API_ERROR", detail: response.error };
    }
    return { success: true };
  }

  const response = await updateAppliance(homeId, appliance.id, action.updates);
  if (!response.success) {
    return { success: false, errorKey: "API_ERROR", detail: response.error };
  }
  return { success: true };
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

function findRoomByName(home: Home, name: string): RoomWithAppliances | undefined {
  const target = normalize(name);
  return home.rooms.find((r) => normalize(r.name) === target);
}

function findApplianceByName(room: RoomWithAppliances, name: string): Appliance | undefined {
  const target = normalize(name);
  return room.appliances.find((a) => normalize(a.name) === target);
}
