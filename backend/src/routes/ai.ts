import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { getHome } from '../services/home-service';
import {
  generateRecommendations,
  generateSavingsSuggestions,
  streamChat,
  estimateAppliance,
  recognizeAppliance,
  buildHomeContext,
  analyzeHabit,
} from '../services/ai-service';
import { upload } from '../middleware/upload';
import { ChatSessionModel } from '../models/chat-session.model';
import { HomeModel } from '../models/home.model';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { Recommendation, ApplianceEstimate, ImageRecognitionResult, ChatMessage, SavingsSuggestionsResult, HabitAnalysis } from '../types/ai';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const MAX_CHAT_HISTORY = 20;

const SSE_CONTENT_TYPE = 'text/event-stream';
const SSE_CACHE_CONTROL = 'no-cache';
const SSE_CONNECTION = 'keep-alive';
const SSE_DONE_MARKER = '\n[DONE]';
const SSE_ERROR_PREFIX = '\n[ERROR] ';

const FALLBACK_APPLIANCE_TYPE = 'other';
const FALLBACK_WATTAGE = 100;
const FALLBACK_STANDBY_WATTAGE = 5;
const FALLBACK_DAILY_HOURS = 0;
const FALLBACK_CONFIDENCE = 0;

const recommendationsSchema = z.object({
  homeId: z.string(),
});

const chatSchema = z.object({
  homeId: z.string(),
  message: z.string(),
  sessionId: z.string().optional(),
});

const estimateApplianceSchema = z.object({
  name: z.string(),
});

const savingsSuggestionsSchema = z.object({
  homeId: z.string(),
  forceRefresh: z.boolean().optional().default(false),
});

type RecommendationsBody = z.infer<typeof recommendationsSchema>;
type ChatBody = z.infer<typeof chatSchema>;
type EstimateApplianceBody = z.infer<typeof estimateApplianceSchema>;
type SavingsSuggestionsBody = z.infer<typeof savingsSuggestionsSchema>;

interface RecommendationsResponseData {
  recommendations: Recommendation[];
  totalPotentialSavingsVnd: number;
  totalPotentialSavingsKwh: number;
}

const ZERO_SAVINGS = 0;

const router = Router();

router.post(
  '/recommendations',
  validate(recommendationsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId } = req.body as RecommendationsBody;
      const home = await getHome(homeId);

      if (!home) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      const recommendations = await generateRecommendations(home);

      const totalPotentialSavingsVnd = recommendations.reduce(
        (sum, r) => sum + r.savingsVnd,
        ZERO_SAVINGS
      );
      const totalPotentialSavingsKwh = recommendations.reduce(
        (sum, r) => sum + r.savingsKwh,
        ZERO_SAVINGS
      );

      const response: ApiSuccessResponse<RecommendationsResponseData> = {
        success: true,
        data: {
          recommendations,
          totalPotentialSavingsVnd,
          totalPotentialSavingsKwh,
        },
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/chat',
  validate(chatSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { homeId, message, sessionId: providedSessionId } =
      req.body as ChatBody;

    const home = await getHome(homeId);

    if (!home) {
      const response: ApiErrorResponse = {
        success: false,
        error: `Home not found: ${homeId}`,
      };
      res.status(HTTP_NOT_FOUND).json(response);
      return;
    }

    const sessionId = providedSessionId ?? uuidv4();

    let session = await ChatSessionModel.findOne({ sessionId });
    if (!session) {
      session = await ChatSessionModel.create({
        sessionId,
        homeId,
        messages: [],
      });
    }

    res.setHeader('Content-Type', SSE_CONTENT_TYPE);
    res.setHeader('Cache-Control', SSE_CACHE_CONTROL);
    res.setHeader('Connection', SSE_CONNECTION);
    res.setHeader('X-Session-Id', sessionId);
    res.flushHeaders();

    const history: ChatMessage[] = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    const homeContext = buildHomeContext(home);

    const userTimestamp = new Date();

    try {
      const fullResponse = await streamChat(
        message,
        history,
        homeContext,
        (chunk: string) => {
          res.write(chunk);
        }
      );

      session.messages.push({
        role: 'user',
        content: message,
        timestamp: userTimestamp,
      });
      session.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      });

      if (session.messages.length > MAX_CHAT_HISTORY) {
        session.messages = session.messages.slice(-MAX_CHAT_HISTORY);
      }

      await session.save();

      res.write(SSE_DONE_MARKER);
      res.end();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';
      res.write(`${SSE_ERROR_PREFIX}${errorMessage}`);
      res.end();
    }
  }
);

router.post(
  '/estimate-appliance',
  validate(estimateApplianceSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.body as EstimateApplianceBody;
      const estimate = await estimateAppliance(name);

      const response: ApiSuccessResponse<ApplianceEstimate> = {
        success: true,
        data: estimate,
      };

      res.status(HTTP_OK).json(response);
    } catch {
      const fallback: ApplianceEstimate = {
        name: (req.body as EstimateApplianceBody).name,
        type: FALLBACK_APPLIANCE_TYPE,
        estimatedWattage: FALLBACK_WATTAGE,
        estimatedStandbyWattage: FALLBACK_STANDBY_WATTAGE,
        commonBrands: [],
        suggestedUsageHabit: '',
      };

      const response: ApiSuccessResponse<ApplianceEstimate> = {
        success: true,
        data: fallback,
      };

      res.status(HTTP_OK).json(response);
    }
  }
);

const HTTP_BAD_REQUEST = 400;
const IMAGE_REQUIRED_MESSAGE = 'Image is required';

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

const SUPPORTED_MEDIA_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const FALLBACK_RECOGNITION_RESULT: ImageRecognitionResult = {
  name: 'Thiet bi khong xac dinh',
  type: 'other',
  estimatedWattage: FALLBACK_WATTAGE,
  estimatedStandbyWattage: FALLBACK_STANDBY_WATTAGE,
  brand: null,
  model: null,
  confidence: 'low',
  details: 'Khong the nhan dien',
};

router.post(
  '/recognize-appliance',
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        const response: ApiErrorResponse = {
          success: false,
          error: IMAGE_REQUIRED_MESSAGE,
        };
        res.status(HTTP_BAD_REQUEST).json(response);
        return;
      }

      const imageBase64 = req.file.buffer.toString('base64');
      const mimetype = req.file.mimetype;

      if (!SUPPORTED_MEDIA_TYPES.has(mimetype)) {
        const response: ApiErrorResponse = {
          success: false,
          error: IMAGE_REQUIRED_MESSAGE,
        };
        res.status(HTTP_BAD_REQUEST).json(response);
        return;
      }

      const mediaType = mimetype as SupportedMediaType;

      const result = await recognizeAppliance(imageBase64, mediaType);

      const response: ApiSuccessResponse<ImageRecognitionResult> = {
        success: true,
        data: result,
      };

      res.status(HTTP_OK).json(response);
    } catch {
      const response: ApiSuccessResponse<ImageRecognitionResult> = {
        success: true,
        data: FALLBACK_RECOGNITION_RESULT,
      };

      res.status(HTTP_OK).json(response);
    }
  }
);

router.post(
  '/savings-suggestions',
  validate(savingsSuggestionsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId, forceRefresh } = req.body as SavingsSuggestionsBody;

      const homeDoc = await HomeModel.findOne({ homeId }).lean();

      if (!homeDoc) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      if (homeDoc.savingsSuggestions && !forceRefresh) {
        const response: ApiSuccessResponse<SavingsSuggestionsResult> = {
          success: true,
          data: homeDoc.savingsSuggestions,
        };
        res.status(HTTP_OK).json(response);
        return;
      }

      const home = await getHome(homeId);

      if (!home) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      const result = await generateSavingsSuggestions(home);

      await HomeModel.updateOne({ homeId }, { savingsSuggestions: result });

      const response: ApiSuccessResponse<SavingsSuggestionsResult> = {
        success: true,
        data: result,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);

const analyzeHabitSchema = z.object({
  applianceName: z.string().min(1),
  deviceType: z.string().default('other'),
  usageHabit: z.string().default(''),
  currentDailyHours: z.number().min(0).max(24).default(0),
});

type AnalyzeHabitBody = z.infer<typeof analyzeHabitSchema>;

const FALLBACK_HABIT_ANALYSIS: HabitAnalysis = {
  calculated_average_hours: 0,
  analysis_summary: '',
  habit_suggestions: [],
  carbon_impact_note: '',
};

router.post(
  '/analyze-habit',
  validate(analyzeHabitSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applianceName, deviceType, usageHabit, currentDailyHours } =
        req.body as AnalyzeHabitBody;

      const result = await analyzeHabit(
        applianceName,
        deviceType,
        usageHabit,
        currentDailyHours
      );

      const response: ApiSuccessResponse<HabitAnalysis> = {
        success: true,
        data: result,
      };

      res.status(HTTP_OK).json(response);
    } catch {
      const fallback: HabitAnalysis = {
        ...FALLBACK_HABIT_ANALYSIS,
        calculated_average_hours: (req.body as AnalyzeHabitBody).currentDailyHours ?? 0,
      };

      const response: ApiSuccessResponse<HabitAnalysis> = {
        success: true,
        data: fallback,
      };

      res.status(HTTP_OK).json(response);
    }
  }
);

export default router;
