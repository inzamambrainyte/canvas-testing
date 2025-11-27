"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import SceneItem from "./SceneItem";
import { useEditorStore } from "@/store/editorStore";

type ScenesPanelProps = {
  isCollapsed?: boolean;
  onToggle?: () => void;
};

const ScenesPanel = ({ isCollapsed = false, onToggle }: ScenesPanelProps) => {
  const {
    scenes,
    activeSceneId,
    setActiveScene,
    addScene,
    duplicateScene,
    deleteScene,
  } = useEditorStore((state) => ({
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
    setActiveScene: state.setActiveScene,
    addScene: state.addScene,
    duplicateScene: state.duplicateScene,
    deleteScene: state.deleteScene,
  }));

  const totalDuration = useMemo(
    () => scenes.reduce((acc, scene) => acc + scene.duration, 0),
    [scenes]
  );

  if (isCollapsed) {
    return (
      <aside className="flex w-12 flex-col items-center border-r border-canvas-border bg-white/80 py-4">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-canvas-border bg-white p-2 text-slate-500 hover:border-brand-start hover:text-brand-start"
          aria-label="Expand scenes panel"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 flex-col border-r border-canvas-border bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-canvas-border px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Project</p>
          <h2 className="text-lg font-semibold text-slate-900">
            Launch teaser
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-canvas-border px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-start hover:text-slate-900"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-start" aria-hidden />
            AI
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-canvas-border p-2 text-slate-400 hover:border-slate-300 hover:text-slate-700"
            aria-label="Collapse scenes panel"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-xs uppercase tracking-wide text-slate-400">
        <span>{scenes.length} Scenes</span>
        <span>{totalDuration}s runtime</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {scenes.map((scene) => (
          <SceneItem
            key={scene.id}
            id={scene.id}
            title={scene.title}
            duration={scene.duration}
            thumbnail={scene.thumbnail}
            isActive={scene.id === activeSceneId}
            onSelect={() => setActiveScene(scene.id)}
            onDuplicate={() => duplicateScene(scene.id)}
            onDelete={() => deleteScene(scene.id)}
          />
        ))}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => addScene()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-canvas-border bg-white/60 px-4 py-3 text-sm font-medium text-slate-500 hover:border-brand-start hover:text-brand-start"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add scene
        </motion.button>
      </div>

      <div className="border-t border-canvas-border px-5 py-4 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Bin</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Empty
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ScenesPanel;
