import mongoose, { Schema, Document } from "mongoose";
import type { AspectRatio } from "../types";

export interface IProject extends Document {
  title: string;
  aspectRatio: AspectRatio;
  zoom: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Project",
    },
    aspectRatio: {
      type: String,
      enum: ["16:9", "9:16", "1:1"],
      default: "16:9",
    },
    zoom: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 2,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProjectSchema.index({ createdAt: -1 });

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
