import mongoose, { Schema, Document } from 'mongoose';

export interface CompletionDocument extends Document {
  completionId: string;
  homeId: string;
  scheduleId: string;
  applianceName: string;
  roomName: string;
  savingsKwh: number;
  savingsVnd: number;
}

const completionSchema = new Schema(
  {
    completionId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    scheduleId: { type: String, required: true, index: true },
    applianceName: { type: String, required: true },
    roomName: { type: String, required: true },
    savingsKwh: { type: Number, required: true },
    savingsVnd: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CompletionModel = mongoose.model<CompletionDocument>('Completion', completionSchema);
