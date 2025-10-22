import mongoose, { Schema, Document } from "mongoose";

export interface IMedicalRecord extends Document {
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  location: string;
  diseaseType: string;
  dateReported: Date;
  casesCount: number;
  latitude?: number;
  longitude?: number;
  uploadedAt: Date;
  data: {
    patientId?: string;
    age?: number;
    gender?: string;
    symptoms?: string;
    severity?: string;
    [key: string]: any;
  }[];
}

const MedicalRecordSchema = new Schema<IMedicalRecord>({
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  diseaseType: {
    type: String,
    required: true,
  },
  dateReported: {
    type: Date,
    required: true,
  },
  casesCount: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  data: [
    {
      type: Schema.Types.Mixed,
    },
  ],
});

export default mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);
