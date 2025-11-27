"use client";

import { useEffect, useMemo, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";
import type { CanvasElement } from "@/lib/types";

type CanvasStageProps = {
  width: number;
  height: number;
  zoom: number;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, patch: Partial<CanvasElement>) => void;
};

const useCanvasImage = (src?: string) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      imageRef.current = null;
      return;
    }

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
      imageRef.current = image;
    };

    return () => {
      imageRef.current = null;
    };
  }, [src]);

  return imageRef.current;
};

const CanvasStage = ({
  width,
  height,
  zoom,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement
}: CanvasStageProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const safeElements = useMemo(() => elements ?? [], [elements]);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer) return;

    if (!selectedElementId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const selectedNode = stage.findOne(`#${selectedElementId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode as Konva.Node]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, safeElements]);

  const handleStagePointer = (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (event.target === event.target.getStage()) {
      onSelectElement(null);
    }
  };

  const handleDragEnd = (elementId: string) => (event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    onUpdateElement(elementId, {
      x: node.x(),
      y: node.y()
    });
  };

  const handleTransformEnd =
    (elementId: string) => (event: Konva.KonvaEventObject<Event>) => {
      const node = event.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      onUpdateElement(elementId, {
        x: node.x(),
        y: node.y(),
        width: Math.max(12, node.width() * scaleX),
        height: Math.max(12, node.height() * scaleY),
        rotation: node.rotation()
      });

      node.scaleX(1);
      node.scaleY(1);
    };

  const renderElement = (element: CanvasElement) => {
    const commonProps = {
      id: element.id,
      key: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation ?? 0,
      draggable: true,
      onMouseDown: (event: Konva.KonvaEventObject<MouseEvent>) => {
        event.cancelBubble = true;
        onSelectElement(element.id);
      },
      onTap: (event: Konva.KonvaEventObject<TouchEvent>) => {
        event.cancelBubble = true;
        onSelectElement(element.id);
      },
      onDragEnd: handleDragEnd(element.id),
      onTransformEnd: handleTransformEnd(element.id),
      shadowBlur: selectedElementId === element.id ? 10 : 0,
      shadowOpacity: selectedElementId === element.id ? 0.2 : 0
    };

    if (element.type === "text") {
      return (
        <Text
          {...commonProps}
          width={element.width}
          height={element.height}
          text={element.content ?? ""}
          fontSize={element.fontSize ?? 32}
          fontFamily={element.fontFamily ?? "Inter"}
          fill={element.fill ?? "#0f172a"}
          align={element.textAlign ?? "left"}
          padding={8}
        />
      );
    }

    if (element.type === "shape") {
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
          fill={element.fill ?? "#c7d2fe"}
          opacity={element.opacity ?? 1}
          cornerRadius={element.shapeVariant === "circle" ? Math.max(element.width, element.height) : 20}
        />
      );
    }

    if (element.type === "image") {
      return <ImageNode {...commonProps} element={element} />;
    }

    if (element.type === "video") {
      return (
        <Group {...commonProps}>
          <Rect
            width={element.width}
            height={element.height}
            fill="#0f172a"
            cornerRadius={24}
            opacity={0.9}
          />
          <Text
            text={element.label ?? "Video"}
            width={element.width}
            height={element.height}
            fontSize={18}
            fontFamily="Inter"
            fill="#f8fafc"
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );
    }

    return (
      <Rect
        {...commonProps}
        width={element.width}
        height={element.height}
        fill="#e2e8f0"
        opacity={0.6}
        cornerRadius={16}
        dash={[8, 4]}
      />
    );
  };

  return (
    <div
      className="relative rounded-[32px] bg-gradient-to-br from-slate-50 to-white shadow-soft"
      style={{
        width: width * zoom,
        height: height * zoom
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scale={{ x: zoom, y: zoom }}
        style={{ width: width * zoom, height: height * zoom }}
        className="rounded-[32px]"
        onMouseDown={handleStagePointer}
        onTouchStart={handleStagePointer}
      >
        <Layer>
          <Rect
            width={width}
            height={height}
            cornerRadius={32}
            stroke="#e4e7ec"
            dash={[10, 6]}
            listening={false}
          />
          {safeElements.map((element) => renderElement(element))}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            rotateAnchorOffset={20}
            borderStroke="#7c3aed"
            anchorStroke="#7c3aed"
            anchorFill="#f8fafc"
            anchorSize={10}
          />
        </Layer>
      </Stage>

      {!safeElements.length && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[32px] text-sm text-slate-400">
          Drop assets to get started.
        </p>
      )}
    </div>
  );
};

const ImageNode = ({
  element,
  ...rest
}: {
  element: CanvasElement;
} & Omit<Konva.NodeConfig, "id">) => {
  const image = useCanvasImage(
    element.assetUrl ??
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60"
  );

  return (
    <KonvaImage
      {...rest}
      width={element.width}
      height={element.height}
      image={image ?? undefined}
      cornerRadius={24}
      listening
    />
  );
};

export default CanvasStage;


