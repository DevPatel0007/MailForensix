import mongoose from "mongoose";

let cached: typeof mongoose | null = null;

export async function connectMongo() {
  if (cached) return cached;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  cached = await mongoose.connect(uri);
  return cached;
}