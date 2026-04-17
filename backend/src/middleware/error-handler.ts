import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/api';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';
const HTTP_INTERNAL_SERVER_ERROR = 500;

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);
  const response: ApiErrorResponse = {
    success: false,
    error: INTERNAL_SERVER_ERROR_MESSAGE,
  };

  res.status(HTTP_INTERNAL_SERVER_ERROR).json(response);
}
