import "dotenv/config";
import mongoose from "mongoose";

let cached: typeof mongoose | null = null;

export async function connectMongo() {
  if (cached && mongoose.connection.readyState === 1) return cached;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not set");

  cached = await mongoose.connect(uri, {
    autoIndex: true,
  });
  return cached;
}