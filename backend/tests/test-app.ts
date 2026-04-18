import express, { Express } from 'express';
import cors from 'cors';
import homeRouter from '../src/routes/home';
import energyRouter from '../src/routes/energy';
import simulatorRouter from '../src/routes/simulator';
import { errorHandler } from '../src/middleware/error-handler';

const JSON_BODY_LIMIT = '10mb';
const API_PREFIX = '/api';

export function createTestApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(`${API_PREFIX}/home`, homeRouter);
  app.use(`${API_PREFIX}/energy`, energyRouter);
  app.use(`${API_PREFIX}/simulator`, simulatorRouter);

  app.use(errorHandler);

  return app;
}
