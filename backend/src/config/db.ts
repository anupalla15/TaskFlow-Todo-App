import mongoose from 'mongoose';

/** Connects to MongoDB using MONGO_URI from the environment. */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
