export type AspectRatio = "16:9" | "9:16" | "1:1";

export type CanvasElementType = "text" | "shape" | "image" | "video" | "audio";

export type ImageFitMode = "cover" | "contain" | "fill" | "fit-to-screen";

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
  voice: string;
  model?: string;
  provider: "openai" | "elevenlabs";
  voice_id?: string; // ElevenLabs specific
  model_id?: string; // ElevenLabs specific
}

export interface Caption {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  x?: number;
  y?: number;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    backgroundColor?: string;
    padding?: number;
    textAlign?: "left" | "center" | "right";
  };
}
