import mongoose, { Schema, Document } from 'mongoose';

export type ScheduleType = 'behavior' | 'upgrade' | 'schedule' | 'vampire';
export type ScheduleStatus = 'active' | 'paused' | 'completed';

export interface ScheduleDocument extends Document {
  scheduleId: string;
  homeId: string;
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description: string;
  scheduledTime: string;
  savingsKwh: number;
  savingsVnd: number;
  status: ScheduleStatus;
  lastFiredAt?: Date;
}

const scheduleSchema = new Schema(
  {
    scheduleId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    applianceName: { type: String, required: true },
    roomName: { type: String, required: true },
    type: { type: String, enum: ['behavior', 'upgrade', 'schedule', 'vampire'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    scheduledTime: { type: String, required: true },
    savingsKwh: { type: Number, required: true },
    savingsVnd: { type: Number, required: true },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    lastFiredAt: { type: Date },
  },
  { timestamps: true }
);

export const ScheduleModel = mongoose.model<ScheduleDocument>('Schedule', scheduleSchema);
