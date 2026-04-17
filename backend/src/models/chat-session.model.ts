import mongoose, { Schema, Document } from 'mongoose';
import { ChatRole } from '../types/ai';

export interface ChatMessageSubdocument {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ChatSessionDocument extends Document {
  sessionId: string;
  homeId: string;
  messages: ChatMessageSubdocument[];
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_ROLES = ['user', 'assistant'] as const;

const chatMessageSchema = new Schema(
  {
    role: { type: String, required: true, enum: CHAT_ROLES },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const chatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    messages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const ChatSessionModel = mongoose.model<ChatSessionDocument>(
  'ChatSession',
  chatSessionSchema
);
