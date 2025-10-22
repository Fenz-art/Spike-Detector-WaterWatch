import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  location: string;
  diseaseType: string;
  severity: "low" | "medium" | "high" | "critical";
  casesDetected: number;
  expectedCases: number;
  spikePercentage: number;
  dateDetected: Date;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  message: string;
  affectedRecords: mongoose.Types.ObjectId[];
  latitude?: number;
  longitude?: number;
}

const AlertSchema = new Schema<IAlert>({
  location: {
    type: String,
    required: true,
  },
  diseaseType: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },
  casesDetected: {
    type: Number,
    required: true,
  },
  expectedCases: {
    type: Number,
    required: true,
  },
  spikePercentage: {
    type: Number,
    required: true,
  },
  dateDetected: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "acknowledged", "resolved"],
    default: "active",
  },
  acknowledgedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  acknowledgedAt: {
    type: Date,
  },
  message: {
    type: String,
    required: true,
  },
  affectedRecords: [
    {
      type: Schema.Types.ObjectId,
      ref: "MedicalRecord",
    },
  ],
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
