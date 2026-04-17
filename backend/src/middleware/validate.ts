import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiErrorResponse } from '../types/api';

const HTTP_BAD_REQUEST = 400;

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const firstIssue = zodError.issues[0];
      const errorMessage = firstIssue
        ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
        : 'Validation failed';

      const response: ApiErrorResponse = {
        success: false,
        error: errorMessage,
      };

      res.status(HTTP_BAD_REQUEST).json(response);
      return;
    }

    req.body = result.data;
    next();
  };
}
