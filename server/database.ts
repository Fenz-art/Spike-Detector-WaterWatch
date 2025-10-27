import mongoose from "mongoose";
import { log } from "./vite";

const MONGODB_URI = 'mongodb+srv://ghazanfarahmed2006_db_user:BigHagrid04@waterspike.rvvehb7.mongodb.net/?retryWrites=true&w=majority&appName=WaterSpike'

export async function connectDatabase(): Promise<boolean> {
  if (!MONGODB_URI) {
    log("ℹ️  No MongoDB URI configured - using in-memory storage");
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unavailable
    });
    log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    log(`⚠️  MongoDB connection failed: ${error instanceof Error ? error.message : error}`);
    log("ℹ️  Continuing with in-memory storage");
    return false;
  }
}

mongoose.connection.on("disconnected", () => {
  log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  log(`❌ MongoDB error: ${error}`);
});
