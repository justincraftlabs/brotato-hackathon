import { v4 as uuidv4 } from 'uuid';
import { ScheduleModel, ScheduleDocument, ScheduleType } from '../models/schedule.model';
import { CompletionModel } from '../models/completion.model';
import { notifyClients, FiredScheduleEvent } from './notification-service';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const TYPE_DEFAULT_TIMES: Record<ScheduleType, string> = {
  vampire: '22:00',
  schedule: '07:00',
  behavior: '07:00',
  upgrade: '00:00',
};

export interface CreateScheduleInput {
  homeId: string;
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description?: string;
  savingsKwh: number;
  savingsVnd: number;
}

export interface SavingsTotals {
  totalSavingsVnd: number;
  totalSavingsKwh: number;
  treesEquivalent: number;
  completionCount: number;
}

export class ScheduleNotFoundError extends Error {
  constructor(scheduleId: string) {
    super(`Schedule not found: ${scheduleId}`);
  }
}

export async function createSchedule(input: CreateScheduleInput): Promise<ScheduleDocument> {
  const scheduledTime = TYPE_DEFAULT_TIMES[input.type];
  const doc = await ScheduleModel.create({
    scheduleId: uuidv4(),
    ...input,
    description: input.description ?? '',
    scheduledTime,
    status: 'active',
  });
  return doc;
}

export async function activateAll(inputs: CreateScheduleInput[]): Promise<ScheduleDocument[]> {
  const docs = await Promise.all(inputs.map(createSchedule));

  const upgradeSchedules = docs.filter((d) => d.type === 'upgrade');
  await Promise.all(upgradeSchedules.map((s) => fireSchedule(s.scheduleId)));

  return docs;
}

export async function listSchedules(homeId: string): Promise<ScheduleDocument[]> {
  return ScheduleModel.find({ homeId }).sort({ createdAt: -1 });
}

export async function pauseSchedule(scheduleId: string): Promise<ScheduleDocument> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);
  const nextStatus = doc.status === 'active' ? 'paused' : 'active';
  doc.status = nextStatus;
  await doc.save();
  return doc;
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const result = await ScheduleModel.deleteOne({ scheduleId });
  if (result.deletedCount === 0) throw new ScheduleNotFoundError(scheduleId);
}

export async function deleteAllByHome(homeId: string): Promise<void> {
  await ScheduleModel.deleteMany({ homeId });
}

export async function fireSchedule(scheduleId: string): Promise<void> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);

  const event: FiredScheduleEvent = {
    scheduleId: doc.scheduleId,
    title: doc.title,
    applianceName: doc.applianceName,
    roomName: doc.roomName,
    savingsVnd: doc.savingsVnd,
    savingsKwh: doc.savingsKwh,
  };

  await notifyClients(doc.homeId, event, FRONTEND_BASE_URL);

  doc.lastFiredAt = new Date();
  if (doc.type === 'upgrade') {
    doc.status = 'completed';
  }
  await doc.save();
}

export async function checkAndFireDue(): Promise<void> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  const dueSchedules = await ScheduleModel.find({
    status: 'active',
    scheduledTime: currentTime,
  });

  await Promise.all(dueSchedules.map((s) => fireSchedule(s.scheduleId)));
}

export async function completeSched(scheduleId: string): Promise<void> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);

  await CompletionModel.create({
    completionId: uuidv4(),
    homeId: doc.homeId,
    scheduleId: doc.scheduleId,
    applianceName: doc.applianceName,
    roomName: doc.roomName,
    savingsKwh: doc.savingsKwh,
    savingsVnd: doc.savingsVnd,
  });

  doc.status = 'completed';
  await doc.save();
}

export async function getSavingsTotals(homeId: string): Promise<SavingsTotals> {
  const CO2_EMISSION_FACTOR = 0.913;
  const CO2_PER_TREE_PER_YEAR = 20;

  const completions = await CompletionModel.find({ homeId });

  const totalSavingsVnd = completions.reduce((sum, c) => sum + c.savingsVnd, 0);
  const totalSavingsKwh = completions.reduce((sum, c) => sum + c.savingsKwh, 0);
  const treesEquivalent = parseFloat(
    ((totalSavingsKwh * CO2_EMISSION_FACTOR) / CO2_PER_TREE_PER_YEAR).toFixed(2)
  );

  return {
    totalSavingsVnd,
    totalSavingsKwh,
    treesEquivalent,
    completionCount: completions.length,
  };
}
