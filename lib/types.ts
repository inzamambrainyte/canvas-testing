export type AspectRatio = "16:9" | "9:16" | "1:1";

export type CanvasElementType = "text" | "shape" | "image" | "video" | "audio";

export type ImageFitMode = "cover" | "contain" | "fill" | "fit-to-screen";

export interface CanvasElement {
  id: string;
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
}

export interface Animation {
  id: string;
  type: AnimationType;
  duration: number; // in seconds
  delay: number; // in seconds
  easing: EasingType;
  direction?: "in" | "out";
  from?: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  };
  to?: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  };
}

export type AnimationType =
  | "fade"
  | "slide"
  | "zoom"
  | "bounce"
  | "rotate"
  | "pulse"
  | "shake"
  | "move"
  | "scale";

export type EasingType =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic";

export interface Voiceover {
  audioUrl: string;
  duration: number;
  voice: string; // Voice ID (provider-specific)
  model?: string; // Model ID (provider-specific)
  provider?: "openai" | "elevenlabs"; // TTS provider
}

export interface Caption {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  x?: number; // Optional: custom position
  y?: number; // Optional: custom position
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    backgroundColor?: string;
    padding?: number;
    textAlign?: "left" | "center" | "right";
  };
}

export interface Scene {
  id: string;
  title: string;
  duration: number;
  script: string;
  thumbnail: string;
  fonts: string[];
  media: string[];
  elements: CanvasElement[];
  keywords?: string;
  voiceover?: Voiceover;
  captions?: Caption[];
}

export type AssetCategory =
  | "text"
  | "fonts"
  | "shapes"
  | "images"
  | "videos"
  | "audio"
  | "brand"
  | "animations";

export interface AssetItem {
  id: string;
  title: string;
  description?: string;
  preview?: string;
  assetUrl?: string;
  meta?: string;
  fontFamily?: string;
  actionLabel?: string;
}

export interface BrandKit {
  colors: string[];
  fonts: string[];
}
