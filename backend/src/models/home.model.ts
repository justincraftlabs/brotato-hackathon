import mongoose, { Schema, Document } from 'mongoose';

export interface HomeDocument extends Document {
  homeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema(
  {
    homeId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const HomeModel = mongoose.model<HomeDocument>('Home', homeSchema);
