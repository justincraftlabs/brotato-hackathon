import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { calculateSimulation } from '../services/simulator-service';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { SimulationResult } from '../types/simulator';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const MIN_TEMPERATURE = 16;
const MAX_TEMPERATURE = 30;
const MAX_DAILY_HOURS = 24;
const MIN_DAILY_HOURS = 0;

const calculateSchema = z.object({
  homeId: z.string(),
  adjustments: z.array(
    z.object({
      applianceId: z.string(),
      newWattage: z.number().positive().optional(),
      newDailyHours: z
        .number()
        .min(MIN_DAILY_HOURS)
        .max(MAX_DAILY_HOURS)
        .optional(),
      newTemperature: z
        .number()
        .min(MIN_TEMPERATURE)
        .max(MAX_TEMPERATURE)
        .optional(),
    })
  ),
});

type CalculateBody = z.infer<typeof calculateSchema>;

const router = Router();

router.post(
  '/calculate',
  validate(calculateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId, adjustments } = req.body as CalculateBody;
      const result = await calculateSimulation(homeId, adjustments);

      if (!result) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      const response: ApiSuccessResponse<SimulationResult> = {
        success: true,
        data: result,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
