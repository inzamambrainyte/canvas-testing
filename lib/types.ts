export type AspectRatio = "16:9" | "9:16" | "1:1";

export type CanvasElementType = "text" | "shape" | "image" | "video";

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
}

export type AssetCategory =
  | "text"
  | "fonts"
  | "shapes"
  | "images"
  | "videos"
  | "audio"
  | "brand";

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
