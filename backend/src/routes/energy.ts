import { Router, Request, Response, NextFunction } from 'express';
import { getDashboard } from '../services/energy-service';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { DashboardData } from '../types/energy';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

const router = Router();

router.get(
  '/:homeId/dashboard',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const dashboard = await getDashboard(homeId);

      if (!dashboard) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      const response: ApiSuccessResponse<DashboardData> = {
        success: true,
        data: dashboard,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
