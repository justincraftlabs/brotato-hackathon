import mongoose, { Schema, Document } from 'mongoose';
import { RoomType, RoomSize, ROOM_TYPES, ROOM_SIZES } from '../types/home';

export interface RoomDocument extends Document {
  roomId: string;
  homeId: string;
  name: string;
  type: RoomType;
  size: RoomSize;
}

const roomSchema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ROOM_TYPES },
    size: { type: String, required: true, enum: ROOM_SIZES },
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<RoomDocument>('Room', roomSchema);
