import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ROOM_TYPES, ROOM_SIZES } from '../types/home';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import {
  createHome,
  addAppliances,
  getHome,
  updateAppliance,
  deleteAppliance,
  HomeNotFoundError,
  RoomNotFoundError,
  ApplianceNotFoundError,
} from '../services/home-service';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;

const MIN_ROOMS = 1;
const MIN_APPLIANCES = 1;
const MIN_DAILY_HOURS = 0;
const MAX_DAILY_HOURS = 24;
const MIN_WATTAGE = 0;
const DEFAULT_STANDBY_WATTAGE = 0;
const DEFAULT_USAGE_HABIT = '';

const setupSchema = z.object({
  rooms: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(ROOM_TYPES),
        size: z.enum(ROOM_SIZES),
      })
    )
    .min(MIN_ROOMS),
});

const addAppliancesSchema = z.object({
  roomId: z.string(),
  appliances: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        wattage: z.number().positive(),
        dailyUsageHours: z.number().min(MIN_DAILY_HOURS).max(MAX_DAILY_HOURS),
        standbyWattage: z.number().min(MIN_WATTAGE).default(DEFAULT_STANDBY_WATTAGE),
        usageHabit: z.string().default(DEFAULT_USAGE_HABIT),
      })
    )
    .min(MIN_APPLIANCES),
});

const updateApplianceSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  wattage: z.number().positive().optional(),
  dailyUsageHours: z.number().min(MIN_DAILY_HOURS).max(MAX_DAILY_HOURS).optional(),
  standbyWattage: z.number().min(MIN_WATTAGE).optional(),
  usageHabit: z.string().optional(),
});

type SetupBody = z.infer<typeof setupSchema>;
type AddAppliancesBody = z.infer<typeof addAppliancesSchema>;
type UpdateApplianceBody = z.infer<typeof updateApplianceSchema>;

const router = Router();

router.post(
  '/setup',
  validate(setupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { rooms } = req.body as SetupBody;
      const home = await createHome(rooms);

      const response: ApiSuccessResponse<{ homeId: string; rooms: typeof home.rooms }> = {
        success: true,
        data: { homeId: home.homeId, rooms: home.rooms },
      };

      res.status(HTTP_CREATED).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:homeId/appliances',
  validate(addAppliancesSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const { roomId, appliances } = req.body as AddAppliancesBody;

      const created = await addAppliances(homeId, roomId, appliances);

      const response: ApiSuccessResponse<{ roomId: string; appliances: typeof created }> = {
        success: true,
        data: { roomId, appliances: created },
      };

      res.status(HTTP_CREATED).json(response);
    } catch (err) {
      if (err instanceof HomeNotFoundError) {
        const response: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      if (err instanceof RoomNotFoundError) {
        const response: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      next(err);
    }
  }
);

router.put(
  '/:homeId/appliances/:applianceId',
  validate(updateApplianceSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const applianceId = req.params.applianceId as string;
      const updates = req.body as UpdateApplianceBody;

      const updated = await updateAppliance(homeId, applianceId, updates);

      const response: ApiSuccessResponse<typeof updated> = {
        success: true,
        data: updated,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      if (err instanceof HomeNotFoundError) {
        const response: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      if (err instanceof ApplianceNotFoundError) {
        const response: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      next(err);
    }
  }
);

router.delete(
  '/:homeId/appliances/:applianceId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const applianceId = req.params.applianceId as string;

      await deleteAppliance(homeId, applianceId);

      const response: ApiSuccessResponse<null> = {
        success: true,
        data: null,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      if (err instanceof ApplianceNotFoundError) {
        const response: ApiErrorResponse = {
          success: false,
          error: err.message,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      next(err);
    }
  }
);

router.get(
  '/:homeId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const home = await getHome(homeId);

      if (!home) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      const response: ApiSuccessResponse<typeof home> = {
        success: true,
        data: home,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
