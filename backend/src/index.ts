import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db/connection';
import { errorHandler } from './middleware/error-handler';
import homeRouter from './routes/home';
import energyRouter from './routes/energy';
import aiRouter from './routes/ai';
import simulatorRouter from './routes/simulator';
import cron from 'node-cron';
import schedulesRouter from './routes/schedules';
import { checkAndFireDue } from './services/schedule-service';

const DEFAULT_PORT = 3001;
const JSON_BODY_LIMIT = '10mb';
const API_PREFIX = '/api';

const app = express();

app.use(cors());
app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.use(`${API_PREFIX}/home`, homeRouter);
app.use(`${API_PREFIX}/energy`, energyRouter);
app.use(`${API_PREFIX}/ai`, aiRouter);
app.use(`${API_PREFIX}/simulator`, simulatorRouter);
app.use(`${API_PREFIX}/schedules`, schedulesRouter);

app.use(errorHandler);

const port = Number(process.env.PORT) || DEFAULT_PORT;

async function start(): Promise<void> {
  await connectDatabase();
  cron.schedule('* * * * *', () => {
    checkAndFireDue().catch((err: unknown) => console.error('Cron error:', err));
  });
  console.log('Schedule cron started');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
