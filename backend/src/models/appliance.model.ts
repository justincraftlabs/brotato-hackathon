import mongoose, { Schema, Document } from 'mongoose';

export interface ApplianceDocument extends Document {
  applianceId: string;
  roomId: string;
  homeId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
  imageUrl?: string;
  recognitionConfidence?: number;
}

const applianceSchema = new Schema(
  {
    applianceId: { type: String, required: true, unique: true },
    roomId: { type: String, required: true, index: true },
    homeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    wattage: { type: Number, required: true },
    dailyUsageHours: { type: Number, required: true },
    standbyWattage: { type: Number, required: true },
    usageHabit: { type: String, default: '' },
    monthlyKwh: { type: Number, required: true },
    monthlyCost: { type: Number, required: true },
    imageUrl: { type: String },
    recognitionConfidence: { type: Number },
  },
  { timestamps: true }
);

export const ApplianceModel = mongoose.model<ApplianceDocument>(
  'Appliance',
  applianceSchema
);
