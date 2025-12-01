import mongoose, { Schema, Document, Types } from "mongoose";
import type { Animation, CanvasElementType, ImageFitMode } from "../types";

export interface IElement extends Document {
  sceneId: Types.ObjectId;
  type: CanvasElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  content?: string;
  assetUrl?: string;
  shapeVariant?: "rectangle" | "circle";
  opacity?: number;
  locked?: boolean;
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  imageFit?: ImageFitMode;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  animations?: Animation[];
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnimationSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "fade",
        "slide",
        "zoom",
        "bounce",
        "rotate",
        "pulse",
        "shake",
        "move",
        "scale",
      ],
      required: true,
    },
    duration: { type: Number, required: true, min: 0.1, max: 10 },
    delay: { type: Number, default: 0, min: 0, max: 10 },
    easing: {
      type: String,
      enum: [
        "linear",
        "ease-in",
        "ease-out",
        "ease-in-out",
        "bounce",
        "elastic",
      ],
      default: "ease-in-out",
    },
    direction: {
      type: String,
      enum: ["in", "out"],
    },
    from: {
      x: Number,
      y: Number,
      scale: Number,
      rotation: Number,
      opacity: Number,
    },
    to: {
      x: Number,
      y: Number,
      scale: Number,
      rotation: Number,
      opacity: Number,
    },
  },
  { _id: false }
);

const ElementSchema = new Schema<IElement>(
  {
    sceneId: {
      type: Schema.Types.ObjectId,
      ref: "Scene",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "shape", "image", "video", "audio"],
      required: true,
    },
    label: {
      type: String,
      required: true,
      default: "Element",
    },
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, min: 16 },
    height: { type: Number, required: true, min: 16 },
    rotation: { type: Number, default: 0 },
    fill: String,
    fontSize: Number,
    fontFamily: String,
    textAlign: {
      type: String,
      enum: ["left", "center", "right"],
    },
    content: String,
    assetUrl: String,
    shapeVariant: {
      type: String,
      enum: ["rectangle", "circle"],
    },
    opacity: { type: Number, default: 1, min: 0, max: 1 },
    locked: { type: Boolean, default: false },
    cornerRadius: { type: Number, default: 0, min: 0 },
    stroke: String,
    strokeWidth: { type: Number, default: 0, min: 0 },
    imageFit: {
      type: String,
      enum: ["cover", "contain", "fill", "fit-to-screen"],
    },
    cropX: Number,
    cropY: Number,
    cropWidth: Number,
    cropHeight: Number,
    animations: [AnimationSchema],
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ElementSchema.index({ sceneId: 1 });
ElementSchema.index({ sceneId: 1, orderIndex: 1 });

// Pre-save hook to set orderIndex if not provided
ElementSchema.pre("save", async function (next: () => void) {
  if (this.isNew && this.orderIndex === undefined) {
    const maxOrder = (await mongoose
      .model("Element")
      .findOne({ sceneId: this.sceneId })
      .sort({ orderIndex: -1 })
      .select("orderIndex")
      .lean()) as { orderIndex?: number } | null;
    this.orderIndex =
      maxOrder?.orderIndex !== undefined ? maxOrder.orderIndex + 1 : 0;
  }
  next();
});

export const Element = mongoose.model<IElement>("Element", ElementSchema);
