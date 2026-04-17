import mongoose, { Schema, Document } from 'mongoose';
import { SavingsSuggestionsResult } from '../types/ai';

export interface HomeDocument extends Document {
  homeId: string;
  savingsSuggestions?: SavingsSuggestionsResult;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema(
  {
    homeId: { type: String, required: true, unique: true },
    savingsSuggestions: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

export const HomeModel = mongoose.model<HomeDocument>('Home', homeSchema);
