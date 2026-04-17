import { API_BASE } from "./constants";
import type {
  ApiResponse,
  Appliance,
  ApplianceEstimate,
  DashboardData,
  Home,
  ImageRecognitionResult,
  Recommendation,
  Room,
  SavingsSuggestionsResult,
  SimulationAdjustment,
  SimulationResult,
} from "./types";

const JSON_CONTENT_TYPE = "application/json";

interface SetupHomePayload {
  rooms: Pick<Room, "name" | "type" | "size">[];
}

interface SetupHomeRoom {
  roomId: string;
  name: string;
  type: Room["type"];
  size: Room["size"];
  appliances: Appliance[];
}

interface SetupHomeData {
  homeId: string;
  rooms: SetupHomeRoom[];
}

interface AddAppliancesPayload {
  appliances: Pick<
    Appliance,
    "name" | "type" | "wattage" | "dailyUsageHours" | "standbyWattage" | "usageHabit"
  >[];
}

interface AddAppliancesData {
  roomId: string;
  appliances: Appliance[];
}

interface BackendAppliance {
  applianceId: string;
  roomId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
}

interface BackendRoom {
  roomId: string;
  name: string;
  type: Room["type"];
  size: Room["size"];
  appliances: BackendAppliance[];
}

interface BackendHome {
  homeId: string;
  rooms: BackendRoom[];
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        ...options?.headers,
      },
    });

    const body: unknown = await response.json();

    if (!isApiResponse<T>(body)) {
      return { success: false, error: UNEXPECTED_RESPONSE_ERROR };
    }

    return body;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : UNKNOWN_ERROR;
    return { success: false, error: message };
  }
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const record = body as Record<string, unknown>;

  if (typeof record.success !== "boolean") {
    return false;
  }

  if (record.success && !("data" in record)) {
    return false;
  }

  if (!record.success && typeof record.error !== "string") {
    return false;
  }

  return true;
}

const CONTENT_TYPE_HEADER = "Content-Type";
const UNEXPECTED_RESPONSE_ERROR = "Unexpected response format from server";
const UNKNOWN_ERROR = "An unknown error occurred";

export async function setupHome(
  rooms: SetupHomePayload["rooms"]
): Promise<ApiResponse<SetupHomeData>> {
  return request<SetupHomeData>("/api/home/setup", {
    method: "POST",
    body: JSON.stringify({ rooms }),
  });
}

export async function addAppliances(
  homeId: string,
  roomId: string,
  appliances: AddAppliancesPayload["appliances"]
): Promise<ApiResponse<AddAppliancesData>> {
  return request<AddAppliancesData>(`/api/home/${homeId}/appliances`, {
    method: "POST",
    body: JSON.stringify({ roomId, appliances }),
  });
}

function mapBackendHome(raw: BackendHome): Home {
  return {
    homeId: raw.homeId,
    rooms: raw.rooms.map((room) => ({
      id: room.roomId,
      name: room.name,
      type: room.type,
      size: room.size,
      appliances: room.appliances.map((a) => ({
        id: a.applianceId,
        roomId: a.roomId,
        name: a.name,
        type: a.type,
        wattage: a.wattage,
        dailyUsageHours: a.dailyUsageHours,
        standbyWattage: a.standbyWattage,
        usageHabit: a.usageHabit,
        monthlyKwh: a.monthlyKwh,
        monthlyCost: a.monthlyCost,
      })),
    })),
  };
}

export async function getHome(homeId: string): Promise<ApiResponse<Home>> {
  const response = await request<BackendHome>(`/api/home/${homeId}`, {
    method: "GET",
  });
  if (!response.success) {
    return response;
  }
  return { success: true, data: mapBackendHome(response.data) };
}

export async function getDashboard(
  homeId: string
): Promise<ApiResponse<DashboardData>> {
  return request<DashboardData>(`/api/energy/${homeId}/dashboard`, {
    method: "GET",
  });
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  totalPotentialSavingsVnd: number;
  totalPotentialSavingsKwh: number;
}

export async function getRecommendations(
  homeId: string
): Promise<ApiResponse<RecommendationsResponse>> {
  return request<RecommendationsResponse>("/api/ai/recommendations", {
    method: "POST",
    body: JSON.stringify({ homeId }),
  });
}

export async function streamChat(
  homeId: string,
  message: string,
  sessionId: string
): Promise<Response> {
  const payload: Record<string, string> = { homeId, message };
  if (sessionId) {
    payload.sessionId = sessionId;
  }
  return fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify(payload),
  });
}

export async function estimateAppliance(
  name: string
): Promise<ApiResponse<ApplianceEstimate>> {
  return request<ApplianceEstimate>("/api/ai/estimate-appliance", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function recognizeAppliance(
  imageFile: File
): Promise<ApiResponse<ImageRecognitionResult>> {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(`${API_BASE}/api/ai/recognize-appliance`, {
      method: "POST",
      body: formData,
    });

    const body: unknown = await response.json();

    if (!isApiResponse<ImageRecognitionResult>(body)) {
      return { success: false, error: UNEXPECTED_RESPONSE_ERROR };
    }

    return body;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : UNKNOWN_ERROR;
    return { success: false, error: message };
  }
}

interface UpdateAppliancePayload {
  name?: string;
  type?: string;
  wattage?: number;
  dailyUsageHours?: number;
  standbyWattage?: number;
  usageHabit?: string;
}

export async function updateAppliance(
  homeId: string,
  applianceId: string,
  updates: UpdateAppliancePayload
): Promise<ApiResponse<Appliance>> {
  return request<Appliance>(`/api/home/${homeId}/appliances/${applianceId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteAppliance(
  homeId: string,
  applianceId: string
): Promise<ApiResponse<null>> {
  return request<null>(`/api/home/${homeId}/appliances/${applianceId}`, {
    method: "DELETE",
  });
}

export async function getSavingsSuggestions(
  homeId: string,
  forceRefresh = false
): Promise<ApiResponse<SavingsSuggestionsResult>> {
  return request<SavingsSuggestionsResult>("/api/ai/savings-suggestions", {
    method: "POST",
    body: JSON.stringify({ homeId, forceRefresh }),
  });
}

export async function calculateSimulation(
  homeId: string,
  adjustments: SimulationAdjustment[]
): Promise<ApiResponse<SimulationResult>> {
  return request<SimulationResult>("/api/simulator/calculate", {
    method: "POST",
    body: JSON.stringify({ homeId, adjustments }),
  });
}
