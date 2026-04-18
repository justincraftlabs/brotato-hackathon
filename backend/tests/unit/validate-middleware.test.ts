import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../src/middleware/validate';

const HTTP_BAD_REQUEST = 400;

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().positive(),
  });

  it('calls next() when the body matches the schema', () => {
    const req = { body: { name: 'Khoai Tay', age: 3 } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 400 and a formatted error when validation fails', () => {
    const req = { body: { name: 'Khoai Tay', age: -1 } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('age'),
      })
    );
  });

  it('replaces req.body with the parsed data (with defaults applied)', () => {
    const withDefault = z.object({
      name: z.string(),
      standby: z.number().default(0),
    });
    const req = { body: { name: 'TV' } } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    validate(withDefault)(req, res, next);

    expect(req.body).toEqual({ name: 'TV', standby: 0 });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
