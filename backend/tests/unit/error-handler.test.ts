import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/error-handler';

const HTTP_INTERNAL_SERVER_ERROR = 500;

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler middleware', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('responds with 500 and a generic error envelope', () => {
    const req = {} as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
  });

  it('does not leak the original error message to the client', () => {
    const req = {} as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    errorHandler(new Error('secret database password exposed'), req, res, next);

    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.error).not.toContain('secret');
  });
});
