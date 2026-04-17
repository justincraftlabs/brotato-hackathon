import Anthropic from '@anthropic-ai/sdk';
import { Home, Room } from '../types/home';
import { Recommendation, RecommendationType, RecommendationDifficulty, ApplianceEstimate, ImageRecognitionResult, ChatMessage } from '../types/ai';
import { calculateMonthlyCost } from './evn-pricing-service';
import { RECOMMENDATION_SYSTEM_PROMPT, RECOMMENDATION_RETRY_PROMPT } from '../prompts/recommendation';
import { CHAT_ASSISTANT_SYSTEM_PROMPT } from '../prompts/chat-assistant';
import { APPLIANCE_ESTIMATOR_PROMPT } from '../prompts/appliance-estimator';
import { IMAGE_RECOGNIZER_PROMPT } from '../prompts/image-recognizer';
import { USAGE_HABIT_PARSER_PROMPT } from '../prompts/usage-habit-parser';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  return _client;
}
const MODEL_SONNET = 'claude-sonnet-4-6';
const MAX_TOKENS_STANDARD = 16000;
const MAX_TOKENS_STREAMING = 64000;
const MAX_TOKENS_HABIT_PARSER = 512;
const MAX_CHAT_HISTORY = 20;
const WATTS_PER_KW = 1000;
const HOURS_PER_DAY_FOR_DISPLAY = 1;
const DAYS_PER_MONTH = 30;

const JSON_BLOCK_START_MARKER = '```json';
const JSON_BLOCK_ALT_START_MARKER = '```';
const JSON_BLOCK_END_MARKER = '```';

interface RawRecommendation {
  applianceName: string;
  roomName: string;
  type: string;
  title: string;
  description: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: 'high' | 'medium' | 'low';
  difficulty: string;
}

const VALID_TYPES = new Set(['behavior', 'upgrade', 'schedule', 'vampire']);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const DEFAULT_TYPE: RecommendationType = 'behavior';
const DEFAULT_DIFFICULTY: RecommendationDifficulty = 'easy';

function stripMarkdownJsonWrapper(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith(JSON_BLOCK_START_MARKER)) {
    cleaned = cleaned.slice(JSON_BLOCK_START_MARKER.length);
  }
  if (cleaned.startsWith(JSON_BLOCK_ALT_START_MARKER)) {
    cleaned = cleaned.slice(JSON_BLOCK_ALT_START_MARKER.length);
  }
  if (cleaned.endsWith(JSON_BLOCK_END_MARKER)) {
    cleaned = cleaned.slice(0, -JSON_BLOCK_END_MARKER.length);
  }

  return cleaned.trim();
}

let recommendationCounter = 0;

function mapRawRecommendation(raw: RawRecommendation): Recommendation {
  recommendationCounter += 1;
  const recType = VALID_TYPES.has(raw.type) ? raw.type as RecommendationType : DEFAULT_TYPE;
  const recDifficulty = VALID_DIFFICULTIES.has(raw.difficulty) ? raw.difficulty as RecommendationDifficulty : DEFAULT_DIFFICULTY;

  return {
    id: `rec-${Date.now()}-${recommendationCounter}`,
    applianceName: raw.applianceName,
    roomName: raw.roomName,
    type: recType,
    title: raw.title,
    description: raw.description,
    savingsKwh: raw.savingsKwh,
    savingsVnd: raw.savingsVnd,
    priority: raw.priority,
    difficulty: recDifficulty,
  };
}

function extractTextFromResponse(
  response: Anthropic.Message
): string {
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    throw new Error('No text content in AI response');
  }

  return textBlock.text;
}

function parseRecommendationsJson(text: string): Recommendation[] {
  const cleaned = stripMarkdownJsonWrapper(text);
  const parsed = JSON.parse(cleaned) as RawRecommendation[];
  return parsed.map(mapRawRecommendation);
}

export async function generateRecommendations(
  homeData: Home
): Promise<Recommendation[]> {
  const response = await getClient().messages.create({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STANDARD,
    system: RECOMMENDATION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(homeData),
      },
    ],
  });

  const responseText = extractTextFromResponse(response);

  try {
    return parseRecommendationsJson(responseText);
  } catch {
    const retryResponse = await getClient().messages.create({
      model: MODEL_SONNET,
      max_tokens: MAX_TOKENS_STANDARD,
      system: RECOMMENDATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(homeData),
        },
        {
          role: 'assistant',
          content: responseText,
        },
        {
          role: 'user',
          content: RECOMMENDATION_RETRY_PROMPT,
        },
      ],
    });

    const retryText = extractTextFromResponse(retryResponse);
    return parseRecommendationsJson(retryText);
  }
}

export function buildHomeContext(home: Home): string {
  const lines: string[] = [`Nha co ${home.rooms.length} phong:`];

  let totalKwh = 0;

  for (const room of home.rooms) {
    lines.push(`\n## ${room.name} (${room.type}, ${room.size})`);

    for (const appliance of room.appliances) {
      const costFormatted = appliance.monthlyCost.toLocaleString('vi-VN');
      const habitNote = appliance.usageHabit
        ? ` [Thoi quen: ${appliance.usageHabit}]`
        : '';
      lines.push(
        `- ${appliance.name}: ${appliance.wattage}W, ${appliance.dailyUsageHours}h/ngay, standby ${appliance.standbyWattage}W => ${appliance.monthlyKwh.toFixed(1)} kWh/thang (~${costFormatted}d)${habitNote}`
      );
      totalKwh += appliance.monthlyKwh;
    }
  }

  const totalCost = calculateMonthlyCost(totalKwh);
  const totalCostFormatted = totalCost.toLocaleString('vi-VN');
  lines.push(
    `\nTong: ${totalKwh.toFixed(1)} kWh/thang, Chi phi: ${totalCostFormatted} VND/thang`
  );

  return lines.join('\n');
}

function buildChatMessages(
  history: ChatMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

export async function streamChat(
  message: string,
  history: ChatMessage[],
  homeContext: string,
  onChunk: (text: string) => void
): Promise<string> {
  const truncatedHistory = history.slice(-MAX_CHAT_HISTORY);
  const systemPrompt = `${CHAT_ASSISTANT_SYSTEM_PROMPT}\n\n---\n${homeContext}`;

  const messages = [
    ...buildChatMessages(truncatedHistory),
    { role: 'user' as const, content: message },
  ];

  let fullResponse = '';

  const stream = getClient().messages.stream({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STREAMING,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text);
      fullResponse += event.delta.text;
    }
  }

  return fullResponse;
}

interface RawApplianceEstimate {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  commonBrands: string[];
  suggestedUsageHabit: string;
}

export async function estimateAppliance(
  applianceName: string
): Promise<ApplianceEstimate> {
  const response = await getClient().messages.create({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STANDARD,
    system: APPLIANCE_ESTIMATOR_PROMPT,
    messages: [
      {
        role: 'user',
        content: applianceName,
      },
    ],
  });

  const responseText = extractTextFromResponse(response);
  const cleaned = stripMarkdownJsonWrapper(responseText);
  const parsed = JSON.parse(cleaned) as RawApplianceEstimate;

  return {
    name: parsed.name,
    type: parsed.type,
    estimatedWattage: parsed.estimatedWattage,
    estimatedStandbyWattage: parsed.estimatedStandbyWattage,
    commonBrands: parsed.commonBrands ?? [],
    suggestedUsageHabit: parsed.suggestedUsageHabit ?? '',
  };
}

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

const MAX_TOKENS_IMAGE_RECOGNITION = 1000;

const FALLBACK_RECOGNITION_RESULT: ImageRecognitionResult = {
  name: 'Thiet bi khong xac dinh',
  type: 'other',
  estimatedWattage: 100,
  estimatedStandbyWattage: 5,
  brand: null,
  model: null,
  confidence: 'low',
  details: 'Khong the nhan dien tu hinh anh',
};

interface RawImageRecognitionResult {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  brand: string | null;
  model: string | null;
  confidence: 'high' | 'medium' | 'low';
  details: string;
}

export async function recognizeAppliance(
  imageBase64: string,
  mediaType: SupportedMediaType
): Promise<ImageRecognitionResult> {
  try {
    const response = await getClient().messages.create({
      model: MODEL_SONNET,
      max_tokens: MAX_TOKENS_IMAGE_RECOGNITION,
      system: IMAGE_RECOGNIZER_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Hay nhan dien thiet bi dien trong hinh anh nay.',
            },
          ],
        },
      ],
    });

    const responseText = extractTextFromResponse(response);
    const cleaned = stripMarkdownJsonWrapper(responseText);
    const parsed = JSON.parse(cleaned) as RawImageRecognitionResult;

    return {
      name: parsed.name,
      type: parsed.type,
      estimatedWattage: parsed.estimatedWattage,
      estimatedStandbyWattage: parsed.estimatedStandbyWattage,
      brand: parsed.brand ?? null,
      model: parsed.model ?? null,
      confidence: parsed.confidence,
      details: parsed.details,
    };
  } catch {
    return FALLBACK_RECOGNITION_RESULT;
  }
}

export interface UsageHabitInput {
  index: number;
  name: string;
  wattage: number;
  usageHabit: string;
  currentDailyHours: number;
}

interface RawHabitResult {
  index: number;
  effectiveDailyHours: number;
}

const MIN_DAILY_HOURS = 0;
const MAX_DAILY_HOURS = 24;

export async function parseUsageHabits(
  inputs: UsageHabitInput[]
): Promise<number[]> {
  const defaults = inputs.map((i) => i.currentDailyHours);

  const hasNonEmptyHabit = inputs.some((i) => i.usageHabit.trim().length > 0);
  if (!hasNonEmptyHabit) {
    return defaults;
  }

  try {
    const response = await getClient().messages.create({
      model: MODEL_SONNET,
      max_tokens: MAX_TOKENS_HABIT_PARSER,
      system: USAGE_HABIT_PARSER_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(inputs) }],
    });

    const text = extractTextFromResponse(response);
    const cleaned = stripMarkdownJsonWrapper(text);
    const results = JSON.parse(cleaned) as RawHabitResult[];

    const effective = [...defaults];
    for (const result of results) {
      if (result.index >= 0 && result.index < effective.length) {
        effective[result.index] = Math.max(
          MIN_DAILY_HOURS,
          Math.min(MAX_DAILY_HOURS, result.effectiveDailyHours)
        );
      }
    }
    return effective;
  } catch {
    return defaults;
  }
}
