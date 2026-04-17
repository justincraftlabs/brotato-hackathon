export type RecommendationType = 'behavior' | 'upgrade' | 'schedule' | 'vampire';
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationDifficulty = 'easy' | 'medium' | 'hard';

export interface Recommendation {
  id: string;
  applianceName: string;
  roomName: string;
  type: RecommendationType;
  title: string;
  description: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: RecommendationPriority;
  difficulty: RecommendationDifficulty;
}

export interface ApplianceEstimate {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  commonBrands: string[];
  suggestedUsageHabit: string;
}

export interface ImageRecognitionResult {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  brand: string | null;
  model: string | null;
  confidence: 'high' | 'medium' | 'low';
  details: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface DeviceSuggestion {
  applianceName: string;
  tip: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: SuggestionPriority;
}

export interface RoomSuggestion {
  roomName: string;
  roomType: string;
  summary: string;
  totalSavingsKwh: number;
  totalSavingsVnd: number;
  devices: DeviceSuggestion[];
}

export interface SavingsSuggestionsResult {
  rooms: RoomSuggestion[];
  grandTotalSavingsKwh: number;
  grandTotalSavingsVnd: number;
  analyzedAt: string;
}

export interface HabitAnalysis {
  calculated_average_hours: number;
  analysis_summary: string;
  habit_suggestions: string[];
  carbon_impact_note: string;
}
