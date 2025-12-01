import mongoose, { Schema, Document, Types } from "mongoose";
import type { Voiceover, Caption } from "../types";

export interface IScene extends Document {
  projectId: Types.ObjectId;
  title: string;
  script: string;
  duration: number; // in seconds
  keywords?: string;
  thumbnail: string;
  orderIndex: number;
  voiceover?: Voiceover;
  captions?: Caption[];
  createdAt: Date;
  updatedAt: Date;
}

const VoiceoverSchema = new Schema(
  {
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    voice: { type: String, required: true },
    model: String,
    provider: {
      type: String,
      enum: ["openai", "elevenlabs"],
      required: true,
    },
    voice_id: String, // ElevenLabs specific
    model_id: String, // ElevenLabs specific
  },
  { _id: false }
);

const CaptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    x: Number,
    y: Number,
    style: {
      fontSize: Number,
      fontFamily: String,
      fill: String,
      backgroundColor: String,
      padding: Number,
      textAlign: {
        type: String,
        enum: ["left", "center", "right"],
      },
    },
  },
  { _id: false }
);

const SceneSchema = new Schema<IScene>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled Scene",
    },
    script: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 300,
    },
    keywords: String,
    thumbnail: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    voiceover: VoiceoverSchema,
    captions: [CaptionSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
SceneSchema.index({ projectId: 1 });
SceneSchema.index({ projectId: 1, orderIndex: 1 });

// Pre-save hook to set orderIndex if not provided
SceneSchema.pre("save", async function (next: () => void) {
  if (this.isNew && this.orderIndex === undefined) {
    const maxOrder = (await mongoose
      .model("Scene")
      .findOne({ projectId: this.projectId })
      .sort({ orderIndex: -1 })
      .select("orderIndex")
      .lean()) as { orderIndex?: number } | null;
    this.orderIndex =
      maxOrder?.orderIndex !== undefined ? maxOrder.orderIndex + 1 : 0;
  }
  next();
});

export const Scene = mongoose.model<IScene>("Scene", SceneSchema);
