import mongoose, { Schema, Document } from 'mongoose';
import { SavingsSuggestionsResult } from '../types/ai';

export type SavingsSuggestionsCache = Partial<Record<'vi' | 'en', SavingsSuggestionsResult>>;

export interface HomeDocument extends Document {
  homeId: string;
  savingsSuggestionsByLang?: SavingsSuggestionsCache;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema(
  {
    homeId: { type: String, required: true, unique: true },
    savingsSuggestionsByLang: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

export const HomeModel = mongoose.model<HomeDocument>('Home', homeSchema);
