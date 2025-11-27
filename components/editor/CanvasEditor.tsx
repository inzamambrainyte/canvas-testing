"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Circle,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { ImageConfig } from "konva/lib/shapes/Image";
import { Lock, Unlock, Trash2, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import CanvasToolbar from "./CanvasToolbar";
import FloatingElementToolbar from "./FloatingElementToolbar";
import { useEditorStore } from "@/store/editorStore";
import type { CanvasElement } from "@/lib/types";

const ratioDimensions = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
  "1:1": { width: 720, height: 720 },
} as const;

const placeholderImage =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&auto=format&fit=crop&q=60";

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
  ...rest
}: { src?: string } & Omit<ImageConfig, "image">) => {
  const image = useHtmlImage(src);
  if (!image) return null;
  return <KonvaImage {...rest} image={image} />;
};

const CanvasEditor = () => {
  const {
    scenes,
    activeSceneId,
    selectedElementId,
    setSelectedElement,
    zoom,
    aspectRatio,
    updateElement,
    removeElementFromScene,
    toggleElementLock,
  } = useEditorStore((state) => ({
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
    selectedElementId: state.selectedElementId,
    setSelectedElement: state.setSelectedElement,
    zoom: state.zoom,
    aspectRatio: state.aspectRatio,
    updateElement: state.updateElement,
    removeElementFromScene: state.removeElementFromScene,
    toggleElementLock: state.toggleElementLock,
  }));

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0],
    [scenes, activeSceneId]
  );

  const { width, height } = ratioDimensions[aspectRatio];
  const stageRef = useRef<Stage>(null);
  const transformerRef = useRef<Transformer>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const toolbarDefaultRef = useRef<{ x: number; y: number } | null>(null);
  const toolbarPinnedRef = useRef(false);
  const [toolbarPosition, setToolbarPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const selectedElement = useMemo(
    () =>
      activeScene?.elements.find((el) => el.id === selectedElementId) ?? null,
    [activeScene?.elements, selectedElementId]
  );
  const editableElement =
    selectedElement && !selectedElement.locked ? selectedElement : null;

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    if (!selectedElementId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne(`#${selectedElementId}`);
    const element = activeScene?.elements.find(
      (el) => el.id === selectedElementId
    );
    if (node && element && !element.locked) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, activeScene]);

  const updateToolbarAutoPosition = useCallback(() => {
    const stage = stageRef.current;
    const wrapper = canvasShellRef.current;
    if (!stage || !wrapper || !selectedElement) {
      toolbarDefaultRef.current = null;
      setToolbarPosition(null);
      return;
    }

    const node = stage.findOne(`#${selectedElement.id}`);
    if (!node) {
      toolbarDefaultRef.current = null;
      setToolbarPosition(null);
      return;
    }

    const nodeBox = node.getClientRect({ skipTransform: false });
    const stageRect = stage.container().getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const scaleX = stage.scaleX() ?? zoom;
    const scaleY = stage.scaleY() ?? zoom;

    const x =
      stageRect.left -
      wrapperRect.left +
      (nodeBox.x + nodeBox.width / 2) * scaleX;
    const y = stageRect.top - wrapperRect.top + nodeBox.y * scaleY - 32;

    const pos = { x, y };
    toolbarDefaultRef.current = pos;
    setToolbarPosition(pos);
  }, [selectedElement, zoom]);

  useEffect(() => {
    toolbarPinnedRef.current = false;
    updateToolbarAutoPosition();
  }, [selectedElementId, updateToolbarAutoPosition]);

  useEffect(() => {
    if (!toolbarPinnedRef.current) {
      updateToolbarAutoPosition();
    }
  }, [zoom, updateToolbarAutoPosition]);

  const handleDragEnd = useCallback(
    (elementId: string, event: KonvaEventObject<DragEvent>) => {
      const node = event.target;
      updateElement(activeSceneId, elementId, {
        x: node.x(),
        y: node.y(),
      });
    },
    [activeSceneId, updateElement]
  );

  const handleTransformEnd = useCallback(
    (elementId: string, event: KonvaEventObject<Event>) => {
      const node = event.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      const newAttrs = {
        x: node.x(),
        y: node.y(),
        width: Math.max(16, node.width() * scaleX),
        height: Math.max(16, node.height() * scaleY),
        rotation: node.rotation(),
      };

      node.scaleX(1);
      node.scaleY(1);

      updateElement(activeSceneId, elementId, newAttrs);
    },
    [activeSceneId, updateElement]
  );

  const renderElement = (element: CanvasElement) => {
    const isLocked = element.locked ?? false;
    const baseProps = {
      id: element.id,
      key: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation ?? 0,
      draggable: !isLocked,
      onDragStart: () => setSelectedElement(element.id),
      onClick: () => setSelectedElement(element.id),
      onTap: () => setSelectedElement(element.id),
      onDragEnd: (event: KonvaEventObject<DragEvent>) =>
        handleDragEnd(element.id, event),
      onTransformEnd: (event: KonvaEventObject<Event>) =>
        handleTransformEnd(element.id, event),
      listening: true,
    };

    if (element.type === "text") {
      return (
        <KonvaText
          {...baseProps}
          text={element.content ?? ""}
          fontFamily={element.fontFamily}
          fontSize={element.fontSize ?? 32}
          fill={element.fill ?? "#0f172a"}
          align={element.textAlign ?? "left"}
        />
      );
    }

    if (element.type === "shape" && element.shapeVariant === "circle") {
      return (
        <Circle
          {...baseProps}
          width={undefined}
          height={undefined}
          radius={element.width / 2}
          fill={element.fill ?? "#d4d4d8"}
          opacity={element.opacity ?? 1}
          offsetX={element.width / 2}
          offsetY={element.width / 2}
        />
      );
    }

    if (element.type === "shape") {
      return (
        <Rect
          {...baseProps}
          cornerRadius={18}
          fill={element.fill ?? "#d4d4d8"}
          opacity={element.opacity ?? 1}
        />
      );
    }

    if (element.type === "image") {
      return (
        <CanvasImageNode
          {...baseProps}
          src={element.assetUrl ?? placeholderImage}
          cornerRadius={20}
        />
      );
    }

    return (
      <Rect {...baseProps} cornerRadius={24} fill="#0f172a" opacity={0.9} />
    );
  };

  const handleStagePointerDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const clickedOnEmpty = event.target === event.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement(null);
    }
  };

  const handleToolbarReset = () => {
    toolbarPinnedRef.current = false;
    if (toolbarDefaultRef.current) {
      setToolbarPosition(toolbarDefaultRef.current);
    } else {
      updateToolbarAutoPosition();
    }
  };

  const handleToolbarPositionChange = (pos: { x: number; y: number }) => {
    toolbarPinnedRef.current = true;
    setToolbarPosition(pos);
  };

  const handleElementPatch = (patch: Partial<CanvasElement>) => {
    if (!selectedElement) return;
    updateElement(activeSceneId, selectedElement.id, patch);
  };

  return (
    <section className="flex flex-1 flex-col">
      <CanvasToolbar />
      <div className="grid flex-1 grid-cols-[auto_360px] gap-4 px-6 py-4">
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-canvas-border bg-white/70 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Script
              </p>
              <p className="text-sm text-slate-600">{activeScene?.script}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-canvas-border px-3 py-1 text-xs font-medium text-slate-500 hover:border-brand-start hover:text-brand-start"
            >
              Auto-sync
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center rounded-3xl border border-canvas-border bg-white/90 p-6 shadow-soft">
            <div className="pointer-events-none absolute inset-6 rounded-3xl border border-dashed border-slate-200" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 border-l border-dashed border-slate-200" />
              <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-dashed border-slate-200" />
            </div>
            {/* <div className="flex flex-col items-center gap-2 text-xs font-medium text-slate-400">
              <Ruler className="h-4 w-4" aria-hidden />
              Snap guides active
            </div> */}
            <motion.div
              ref={canvasShellRef}
              layout
              className="relative rounded-[32px] bg-gradient-to-br from-slate-50 to-white shadow-soft"
              style={{
                width: width * zoom,
                height: height * zoom,
              }}
            >
              <Stage
                ref={stageRef}
                width={width}
                height={height}
                scaleX={zoom}
                scaleY={zoom}
                className="rounded-[32px]"
                onMouseDown={handleStagePointerDown}
                onTouchStart={handleStagePointerDown}
              >
                <Layer listening={false}>
                  <Rect
                    width={width}
                    height={height}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: width, y: height }}
                    fillLinearGradientColorStops={[0, "#f8fafc", 1, "#ffffff"]}
                  />
                  {[...Array(Math.ceil(width / 40))].map((_, idx) => (
                    <Rect
                      key={`v-${idx}`}
                      x={idx * 40}
                      width={1}
                      height={height}
                      fill="rgba(99,102,241,0.05)"
                    />
                  ))}
                  {[...Array(Math.ceil(height / 40))].map((_, idx) => (
                    <Rect
                      key={`h-${idx}`}
                      y={idx * 40}
                      height={1}
                      width={width}
                      fill="rgba(99,102,241,0.05)"
                    />
                  ))}
                </Layer>
                <Layer>
                  {activeScene?.elements.map((element) =>
                    renderElement(element)
                  )}
                </Layer>
                <Layer>
                  <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    anchorSize={8}
                    borderDash={[4, 4]}
                    enabledAnchors={[
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                      "middle-left",
                      "middle-right",
                      "top-center",
                      "bottom-center",
                    ]}
                  />
                </Layer>
              </Stage>
              <FloatingElementToolbar
                element={editableElement}
                position={toolbarPosition}
                containerRef={canvasShellRef}
                onPositionChange={handleToolbarPositionChange}
                onResetPosition={handleToolbarReset}
                onUpdate={handleElementPatch}
              />
            </motion.div>
          </div>

          <div className="mt-4 rounded-2xl border border-canvas-border bg-white/80 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Timeline</span>
              <span>{activeScene?.duration}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              className="mt-3 w-full accent-brand-start"
              defaultValue={25}
            />
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>00:00</span>
              <span>00:03</span>
              <span>00:06</span>
              <span>00:09</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-canvas-border bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Layers
          </p>
          <div className="mt-3 space-y-2">
            {activeScene?.elements.map((element) => {
              const isActive = selectedElementId === element.id;
              const isLocked = element.locked ?? false;
              return (
                <div
                  key={element.id}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-brand-start/50 bg-white shadow-soft"
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedElement(isActive ? null : element.id)
                    }
                    className="flex flex-1 flex-col items-start text-left"
                  >
                    <span className="font-medium text-slate-700">
                      {element.label}
                      {isLocked && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Locked
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {element.type}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        toggleElementLock(activeSceneId, element.id)
                      }
                      className={clsx(
                        "rounded-full border p-1 transition",
                        isLocked
                          ? "border-brand-start/40 bg-brand-start/10 text-brand-start"
                          : "border-transparent bg-slate-50 text-slate-400 hover:border-slate-200"
                      )}
                      aria-label={isLocked ? "Unlock layer" : "Lock layer"}
                    >
                      {isLocked ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        removeElementFromScene(activeSceneId, element.id)
                      }
                      className="rounded-full border border-transparent bg-slate-50 p-1 text-slate-400 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Delete layer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {activeScene?.elements.length === 0 && (
              <p className="rounded-2xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                Drop assets to build your scene.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CanvasEditor;
