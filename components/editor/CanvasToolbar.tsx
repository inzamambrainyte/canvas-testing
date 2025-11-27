"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PanelsTopLeft as RatioIcon,
  Download,
  Play,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { AspectRatio } from "@/lib/types";

const aspectRatios: { label: string; value: AspectRatio }[] = [
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "1:1", value: "1:1" },
];

const CanvasToolbar = () => {
  const {
    aspectRatio,
    setAspectRatio,
    zoom,
    setZoom,
    isPlaying,
    togglePlayback,
    scenes,
    activeSceneId,
  } = useEditorStore((state) => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
    zoom: state.zoom,
    setZoom: state.setZoom,
    isPlaying: state.isPlaying,
    togglePlayback: state.togglePlayback,
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
  }));

  const activeSceneTitle = useMemo(
    () =>
      scenes.find((scene) => scene.id === activeSceneId)?.title ??
      "Untitled scene",
    [scenes, activeSceneId]
  );

  return (
    <header className="flex items-center justify-between border-b border-canvas-border bg-white/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Scene
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {activeSceneTitle}
        </h1>
        <span className="text-sm text-slate-400">Script synced</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-canvas-border px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400"
        >
          <Undo2 className="h-4 w-4" aria-hidden />
          Undo
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-canvas-border px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400"
        >
          <Redo2 className="h-4 w-4" aria-hidden />
          Redo
        </button>
        <div
          className="mx-4 hidden h-6 w-px bg-canvas-border md:block"
          aria-hidden
        />
        <div className="flex items-center gap-2 rounded-full border border-canvas-border px-3 py-2">
          <RatioIcon className="h-4 w-4 text-slate-400" aria-hidden />
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => setAspectRatio(ratio.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                aspectRatio === ratio.value
                  ? "bg-gradient-to-r from-brand-start to-brand-end text-white shadow-soft"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-canvas-border px-3 py-2">
          <button
            type="button"
            onClick={() =>
              setZoom(Math.max(0.5, parseFloat((zoom - 0.1).toFixed(2))))
            }
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-[48px] text-center text-sm font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom(Math.min(2, parseFloat((zoom + 0.1).toFixed(2))))
            }
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 text-sm font-semibold text-white shadow-soft"
          onClick={togglePlayback}
        >
          <Play className="h-4 w-4" aria-hidden />
          {isPlaying ? "Pause" : "Preview"}
        </motion.button>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-canvas-border/60 px-4 py-2 text-sm font-semibold text-slate-400"
        >
          <Download className="h-4 w-4" aria-hidden />
          Export
        </button>
      </div>
    </header>
  );
};

export default CanvasToolbar;
