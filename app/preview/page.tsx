"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Circle,
  Image as KonvaImage,
} from "react-konva";
import { useEditorStore } from "@/store/editorStore";
import type { CanvasElement } from "@/lib/types";

const ratioDimensions = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
  "1:1": { width: 720, height: 720 },
} as const;

const useHtmlImage = (src?: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    const handleLoad = () => setImage(img);
    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [src]);

  return image;
};

const CanvasImageNode = ({
  src,
  imageFit = "cover",
  ...rest
}: {
  src?: string;
  imageFit?: "cover" | "contain" | "fill" | "fit-to-screen";
} & any) => {
  const image = useHtmlImage(src);
  if (!image) return null;

  const props = { ...rest };

  if (imageFit === "contain" || imageFit === "fit-to-screen") {
    const imageAspect = image.width / image.height;
    const containerAspect = (rest.width || 1) / (rest.height || 1);

    if (imageAspect > containerAspect) {
      props.height = (rest.width || 1) / imageAspect;
    } else {
      props.width = (rest.height || 1) * imageAspect;
    }
  } else if (imageFit === "fill") {
    props.width = rest.width;
    props.height = rest.height;
  } else {
    props.width = rest.width;
    props.height = rest.height;
  }

  return <KonvaImage {...props} image={image} />;
};

const PreviewPage = () => {
  const { scenes, activeSceneId, aspectRatio } = useEditorStore((state) => ({
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
    aspectRatio: state.aspectRatio,
  }));

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0],
    [scenes, activeSceneId]
  );

  const { width, height } = ratioDimensions[aspectRatio];

  const renderElement = (element: CanvasElement) => {
    const baseProps = {
      key: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation ?? 0,
      opacity: element.opacity ?? 1,
    };

    if (element.type === "text") {
      return (
        <KonvaText
          {...baseProps}
          text={element.content ?? ""}
          fontFamily={element.fontFamily ?? "Inter"}
          fontSize={element.fontSize ?? 32}
          fill={element.fill ?? "#0f172a"}
          align={element.textAlign ?? "left"}
          padding={8}
        />
      );
    }

    if (element.type === "shape") {
      if (element.shapeVariant === "circle") {
        return (
          <Circle
            {...baseProps}
            radius={Math.max(element.width, element.height) / 2}
            fill={element.fill ?? "#c7d2fe"}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth ?? 0}
          />
        );
      }
      return (
        <Rect
          {...baseProps}
          fill={element.fill ?? "#c7d2fe"}
          cornerRadius={element.cornerRadius ?? 0}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth ?? 0}
        />
      );
    }

    if (element.type === "image") {
      return (
        <CanvasImageNode
          {...baseProps}
          src={element.assetUrl}
          imageFit={element.imageFit ?? "cover"}
          cornerRadius={element.cornerRadius ?? 0}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <div className="rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          {activeScene?.title ?? "Preview"}
        </h1>
        <Stage width={width} height={height}>
          <Layer>
            {activeScene?.elements.map((element) => renderElement(element))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PreviewPage;

