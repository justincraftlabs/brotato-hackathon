import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/e-lumi-nate';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI;
  await mongoose.connect(uri);
}
