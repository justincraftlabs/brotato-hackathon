import type { ApplianceType } from "./setup-constants";
import type { RoomSize, RoomType } from "./types";

export type ChatActionOperation = "add" | "update" | "delete" | "createRoom";

export interface ChatActionApplianceInput {
  name: string;
  type: ApplianceType;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage?: number;
  usageHabit?: string;
}

export interface ChatActionApplianceUpdates {
  name?: string;
  type?: ApplianceType;
  wattage?: number;
  dailyUsageHours?: number;
  standbyWattage?: number;
  usageHabit?: string;
}

export interface ChatActionRoomInput {
  name: string;
  type: RoomType;
  size: RoomSize;
}

export type ChatAction =
  | {
      operation: "add";
      roomName: string;
      appliance: ChatActionApplianceInput;
    }
  | {
      operation: "update";
      roomName: string;
      applianceName: string;
      updates: ChatActionApplianceUpdates;
    }
  | {
      operation: "delete";
      roomName: string;
      applianceName: string;
    }
  | {
      operation: "createRoom";
      room: ChatActionRoomInput;
      appliances: ChatActionApplianceInput[];
    };

const ACTION_TAG_OPEN = "<action>";
const ACTION_TAG_CLOSE = "</action>";
const ACTION_REGEX = /<action>\s*([\s\S]*?)\s*<\/action>/i;

export interface ParsedChatContent {
  visibleContent: string;
  action: ChatAction | null;
}

export function parseChatContent(raw: string): ParsedChatContent {
  const match = raw.match(ACTION_REGEX);
  if (!match) {
    return { visibleContent: raw, action: null };
  }
  const jsonBlock = match[1].trim();
  const visibleContent = raw.replace(match[0], "").trim();

  const action = safeParseAction(jsonBlock);
  return { visibleContent, action };
}

export function hasActionInProgress(raw: string): boolean {
  const openIdx = raw.indexOf(ACTION_TAG_OPEN);
  if (openIdx === -1) {
    return false;
  }
  return !raw.includes(ACTION_TAG_CLOSE, openIdx);
}

export function stripPartialActionTag(raw: string): string {
  const openIdx = raw.indexOf(ACTION_TAG_OPEN);
  if (openIdx === -1) {
    return raw;
  }
  if (raw.includes(ACTION_TAG_CLOSE, openIdx)) {
    return raw.replace(ACTION_REGEX, "").trimEnd();
  }
  return raw.slice(0, openIdx).trimEnd();
}

function safeParseAction(jsonBlock: string): ChatAction | null {
  try {
    const parsed = JSON.parse(jsonBlock) as unknown;
    return validateAction(parsed);
  } catch {
    return null;
  }
}

const VALID_OPERATIONS = new Set<ChatActionOperation>([
  "add",
  "update",
  "delete",
  "createRoom",
]);

const VALID_ROOM_TYPES = new Set<RoomType>([
  "bedroom",
  "living_room",
  "kitchen",
  "bathroom",
  "office",
  "other",
]);

const VALID_ROOM_SIZES = new Set<RoomSize>(["small", "medium", "large"]);

const VALID_APPLIANCE_TYPES = new Set<ApplianceType>([
  "cooling",
  "heating",
  "lighting",
  "kitchen",
  "entertainment",
  "office",
  "laundry",
  "other",
]);

const FALLBACK_APPLIANCE_TYPE: ApplianceType = "other";
const DEFAULT_STANDBY_WATTAGE = 0;
const EMPTY_USAGE_HABIT = "";

function validateAction(input: unknown): ChatAction | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }
  const candidate = input as Record<string, unknown>;
  const operation = candidate.operation as ChatActionOperation | undefined;
  if (!operation || !VALID_OPERATIONS.has(operation)) {
    return null;
  }

  if (operation === "createRoom") {
    return validateCreateRoom(candidate);
  }

  const roomName = typeof candidate.roomName === "string" ? candidate.roomName.trim() : "";
  if (roomName.length === 0) {
    return null;
  }

  if (operation === "add") {
    const appliance = parseAppliance(candidate.appliance);
    if (!appliance) {
      return null;
    }
    return { operation: "add", roomName, appliance };
  }

  const applianceName =
    typeof candidate.applianceName === "string" ? candidate.applianceName.trim() : "";
  if (applianceName.length === 0) {
    return null;
  }

  if (operation === "delete") {
    return { operation: "delete", roomName, applianceName };
  }

  const updates = candidate.updates as Record<string, unknown> | undefined;
  if (!updates || typeof updates !== "object") {
    return null;
  }
  const cleaned: ChatActionApplianceUpdates = {};
  if (typeof updates.name === "string") cleaned.name = updates.name;
  if (typeof updates.type === "string" && VALID_APPLIANCE_TYPES.has(updates.type as ApplianceType)) {
    cleaned.type = updates.type as ApplianceType;
  }
  if (typeof updates.wattage === "number") cleaned.wattage = updates.wattage;
  if (typeof updates.dailyUsageHours === "number") cleaned.dailyUsageHours = updates.dailyUsageHours;
  if (typeof updates.standbyWattage === "number") cleaned.standbyWattage = updates.standbyWattage;
  if (typeof updates.usageHabit === "string") cleaned.usageHabit = updates.usageHabit;

  if (Object.keys(cleaned).length === 0) {
    return null;
  }

  return { operation: "update", roomName, applianceName, updates: cleaned };
}

function validateCreateRoom(candidate: Record<string, unknown>): ChatAction | null {
  const rawRoom = candidate.room as Record<string, unknown> | undefined;
  if (!rawRoom) {
    return null;
  }
  const name = typeof rawRoom.name === "string" ? rawRoom.name.trim() : "";
  const type = typeof rawRoom.type === "string" ? (rawRoom.type as RoomType) : null;
  const size = typeof rawRoom.size === "string" ? (rawRoom.size as RoomSize) : null;
  if (name.length === 0 || !type || !VALID_ROOM_TYPES.has(type) || !size || !VALID_ROOM_SIZES.has(size)) {
    return null;
  }

  const rawAppliances = Array.isArray(candidate.appliances) ? candidate.appliances : [];
  const appliances: ChatActionApplianceInput[] = [];
  for (const item of rawAppliances) {
    const parsed = parseAppliance(item);
    if (parsed) {
      appliances.push(parsed);
    }
  }

  return {
    operation: "createRoom",
    room: { name, type, size },
    appliances,
  };
}

function parseAppliance(input: unknown): ChatActionApplianceInput | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }
  const appliance = input as Record<string, unknown>;
  const name = typeof appliance.name === "string" ? appliance.name.trim() : "";
  const wattage = typeof appliance.wattage === "number" ? appliance.wattage : NaN;
  const dailyUsageHours =
    typeof appliance.dailyUsageHours === "number" ? appliance.dailyUsageHours : NaN;
  const rawType = typeof appliance.type === "string" ? (appliance.type as ApplianceType) : FALLBACK_APPLIANCE_TYPE;
  const type = VALID_APPLIANCE_TYPES.has(rawType) ? rawType : FALLBACK_APPLIANCE_TYPE;
  if (name.length === 0 || Number.isNaN(wattage) || Number.isNaN(dailyUsageHours)) {
    return null;
  }
  const standbyWattage =
    typeof appliance.standbyWattage === "number" ? appliance.standbyWattage : DEFAULT_STANDBY_WATTAGE;
  const usageHabit = typeof appliance.usageHabit === "string" ? appliance.usageHabit : EMPTY_USAGE_HABIT;
  return { name, type, wattage, dailyUsageHours, standbyWattage, usageHabit };
}
