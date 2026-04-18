import { addAppliances, addRoom, deleteAppliance, getHome, updateAppliance } from "./api";
import type { ChatAction, ChatActionApplianceInput } from "./chat-action";
import type { Appliance, Home, RoomWithAppliances } from "./types";

export type ApplyErrorKey =
  | "ROOM_NOT_FOUND"
  | "APPLIANCE_NOT_FOUND"
  | "ROOM_ALREADY_EXISTS"
  | "API_ERROR";

export type ApplyResult =
  | { success: true }
  | { success: false; errorKey: ApplyErrorKey; detail: string };

export async function applyChatAction(homeId: string, action: ChatAction): Promise<ApplyResult> {
  if (action.operation === "createRoom") {
    return applyCreateRoom(homeId, action);
  }

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
      toAppliancePayload(action.appliance),
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

async function applyCreateRoom(
  homeId: string,
  action: Extract<ChatAction, { operation: "createRoom" }>
): Promise<ApplyResult> {
  const homeResult = await getHome(homeId);
  if (!homeResult.success) {
    return { success: false, errorKey: "API_ERROR", detail: homeResult.error };
  }
  if (findRoomByName(homeResult.data, action.room.name)) {
    return { success: false, errorKey: "ROOM_ALREADY_EXISTS", detail: action.room.name };
  }

  const roomResponse = await addRoom(homeId, action.room);
  if (!roomResponse.success) {
    return { success: false, errorKey: "API_ERROR", detail: roomResponse.error };
  }

  if (action.appliances.length === 0) {
    return { success: true };
  }

  const payload = action.appliances.map(toAppliancePayload);
  const applianceResponse = await addAppliances(homeId, roomResponse.data.id, payload);
  if (!applianceResponse.success) {
    return { success: false, errorKey: "API_ERROR", detail: applianceResponse.error };
  }
  return { success: true };
}

function toAppliancePayload(input: ChatActionApplianceInput) {
  return {
    name: input.name,
    type: input.type,
    wattage: input.wattage,
    dailyUsageHours: input.dailyUsageHours,
    standbyWattage: input.standbyWattage ?? 0,
    usageHabit: input.usageHabit ?? "",
  };
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
