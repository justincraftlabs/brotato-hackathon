import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { registerSseClient, removeSseClient } from '../services/notification-service';
import {
  createSchedule,
  activateAll,
  listSchedules,
  pauseSchedule,
  deleteSchedule,
  deleteAllByHome,
  fireSchedule,
  completeSched,
  getSavingsTotals,
  CreateScheduleInput,
  ScheduleNotFoundError,
} from '../services/schedule-service';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const DEMO_STAGGER_MS = 600;

const SCHEDULE_TYPES = ['behavior', 'upgrade', 'schedule', 'vampire'] as const;

const createScheduleSchema = z.object({
  homeId: z.string(),
  applianceName: z.string(),
  roomName: z.string(),
  type: z.enum(SCHEDULE_TYPES).default('behavior'),
  title: z.string(),
  description: z.string().optional(),
  savingsKwh: z.number().min(0),
  savingsVnd: z.number().min(0),
});

const activateAllSchema = z.object({
  homeId: z.string(),
  items: z.array(
    z.object({
      applianceName: z.string(),
      roomName: z.string(),
      type: z.enum(SCHEDULE_TYPES).default('behavior'),
      title: z.string(),
      description: z.string().optional(),
      savingsKwh: z.number().min(0),
      savingsVnd: z.number().min(0),
    })
  ).min(1),
});

const router = Router();

// SSE: persistent connection — MUST be before /:scheduleId
router.get(
  '/events',
  (req: Request, res: Response): void => {
    const homeId = req.query.homeId as string;
    if (!homeId) {
      res.status(400).json({ success: false, error: 'homeId query param required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write('event: connected\ndata: ok\n\n');

    registerSseClient(homeId, res);

    req.on('close', () => {
      removeSseClient(homeId, res);
    });
  }
);

// GET /api/schedules?homeId=
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }
      const schedules = await listSchedules(homeId);
      const r: ApiSuccessResponse<typeof schedules> = { success: true, data: schedules };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/schedules/savings?homeId= — BEFORE /:scheduleId
router.get(
  '/savings',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }
      const totals = await getSavingsTotals(homeId);
      const r: ApiSuccessResponse<typeof totals> = { success: true, data: totals };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules
router.post(
  '/',
  validate(createScheduleSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateScheduleInput;
      const schedule = await createSchedule(input);
      const r: ApiSuccessResponse<typeof schedule> = { success: true, data: schedule };
      res.status(HTTP_CREATED).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules/activate-all — BEFORE /:scheduleId
router.post(
  '/activate-all',
  validate(activateAllSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId, items } = req.body as { homeId: string; items: CreateScheduleInput[] };
      const inputs: CreateScheduleInput[] = items.map((item) => ({ ...item, homeId }));
      const schedules = await activateAll(inputs);
      const r: ApiSuccessResponse<typeof schedules> = { success: true, data: schedules };
      res.status(HTTP_CREATED).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules/fire-all — BEFORE /:scheduleId
router.post(
  '/fire-all',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }

      const schedules = (await listSchedules(homeId)).filter((s) => s.status === 'active');

      schedules.forEach((s, idx) => {
        setTimeout(() => {
          fireSchedule(s.scheduleId).catch(console.error);
        }, idx * DEMO_STAGGER_MS);
      });

      const r: ApiSuccessResponse<{ queued: number }> = {
        success: true,
        data: { queued: schedules.length },
      };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/schedules/:scheduleId/complete — Slack button URL click
router.get(
  '/:scheduleId/complete',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await completeSched(scheduleId as string);
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      res.redirect(`${frontendUrl}/schedules?completed=1`);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// POST /api/schedules/:scheduleId/complete-app — in-app Done button
router.post(
  '/:scheduleId/complete-app',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await completeSched(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// POST /api/schedules/:scheduleId/fire — demo fire immediately
router.post(
  '/:scheduleId/fire',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await fireSchedule(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// PATCH /api/schedules/:scheduleId/toggle
router.patch(
  '/:scheduleId/toggle',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const updated = await pauseSchedule(scheduleId as string);
      const r: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// DELETE /api/schedules?homeId= — clear all schedules for a home
router.delete(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }
      await deleteAllByHome(homeId);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/schedules/:scheduleId
router.delete(
  '/:scheduleId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await deleteSchedule(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

export default router;
