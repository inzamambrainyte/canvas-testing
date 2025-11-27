"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Ruler } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import CanvasToolbar from "./CanvasToolbar";
import { useEditorStore } from "@/store/editorStore";
import type { CanvasElement } from "@/lib/types";

const ratioDimensions = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
  "1:1": { width: 720, height: 720 },
} as const;

const CanvasElementPreview = ({
  element,
  isSelected,
  zoom,
  onSelect,
}: {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
}) => {
  const baseStyle = {
    left: element.x * zoom,
    top: element.y * zoom,
    width: element.width * zoom,
    height: element.height * zoom,
    transform: `rotate(${element.rotation ?? 0}deg)`,
  } as const;

  if (element.type === "text") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "absolute cursor-move rounded-lg border border-transparent px-4 py-2 text-left shadow-sm outline-none transition",
          isSelected
            ? "border-brand-start bg-white/80"
            : "bg-white/60 hover:border-slate-300"
        )}
        style={{
          ...baseStyle,
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          color: element.fill ?? "#0f172a",
        }}
      >
        {element.content}
      </button>
    );
  }

  if (element.type === "shape") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "absolute cursor-move outline-none transition",
          isSelected ? "ring-2 ring-brand-start/70" : ""
        )}
        style={{
          ...baseStyle,
          borderRadius: element.shapeVariant === "circle" ? "999px" : "18px",
          backgroundColor: element.fill ?? "#d4d4d8",
          opacity: element.opacity ?? 1,
        }}
      />
    );
  }

  if (element.type === "image") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "absolute overflow-hidden rounded-xl border border-white/70 outline-none transition",
          isSelected ? "ring-2 ring-brand-start/70" : "shadow"
        )}
        style={baseStyle}
      >
        <Image
          src={
            element.assetUrl ??
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60"
          }
          alt={element.label}
          fill
          className="object-cover"
          sizes="200px"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "absolute rounded-xl border border-dashed border-slate-300 bg-slate-100/50 outline-none transition",
        isSelected ? "ring-2 ring-brand-start/70" : ""
      )}
      style={baseStyle}
    />
  );
};

const CanvasEditor = () => {
  const {
    scenes,
    activeSceneId,
    selectedElementId,
    setSelectedElement,
    zoom,
    aspectRatio,
  } = useEditorStore((state) => ({
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
    selectedElementId: state.selectedElementId,
    setSelectedElement: state.setSelectedElement,
    zoom: state.zoom,
    aspectRatio: state.aspectRatio,
  }));

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0],
    [scenes, activeSceneId]
  );

  const { width, height } = ratioDimensions[aspectRatio];

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
            <div className="flex flex-col items-center gap-2 text-xs font-medium text-slate-400">
              <Ruler className="h-4 w-4" aria-hidden />
              Snap guides active
            </div>
            <motion.div
              layout
              className="relative rounded-[32px] bg-gradient-to-br from-slate-50 to-white shadow-soft"
              style={{
                width: width * zoom,
                height: height * zoom,
                backgroundImage:
                  "linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 0),linear-gradient(180deg,rgba(99,102,241,0.05) 1px,transparent 0)",
                backgroundSize: "32px 32px",
              }}
            >
              {activeScene?.elements.map((element) => (
                <CanvasElementPreview
                  key={element.id}
                  element={element}
                  zoom={zoom}
                  isSelected={selectedElementId === element.id}
                  onSelect={() =>
                    setSelectedElement(
                      selectedElementId === element.id ? null : element.id
                    )
                  }
                />
              ))}
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
            {activeScene?.elements.map((element) => (
              <button
                key={element.id}
                type="button"
                onClick={() =>
                  setSelectedElement(
                    selectedElementId === element.id ? null : element.id
                  )
                }
                className={clsx(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm font-medium text-slate-600 transition",
                  selectedElementId === element.id
                    ? "border-brand-start/50 bg-white shadow-soft"
                    : "border-transparent hover:border-slate-200"
                )}
              >
                <span>{element.label}</span>
                <span className="text-xs text-slate-400">{element.type}</span>
              </button>
            ))}
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
