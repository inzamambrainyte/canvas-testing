"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import AssetTabs from "./AssetTabs";
import TextEditorPanel from "./TextEditorPanel";
import { useEditorStore } from "@/store/editorStore";
import type { AssetCategory, AssetItem, CanvasElement } from "@/lib/types";

const generateElementFromAsset = (
  item: AssetItem,
  category: AssetCategory
): Partial<CanvasElement> => {
  switch (category) {
    case "text":
      return {
        type: "text",
        label: item.title,
        x: 140,
        y: 140,
        width: 360,
        height: 80,
        fontSize: item.meta?.includes("H1") ? 48 : 28,
        fontFamily: "Sora",
        content: item.description ?? item.title,
        fill: "#0f172a",
        locked: false,
      };
    case "fonts":
      return {
        type: "text",
        label: `${item.title} Sample`,
        x: 160,
        y: 180,
        width: 420,
        height: 80,
        fontSize: 36,
        fontFamily: item.fontFamily ?? item.title,
        content: "Your brand voice lives here.",
        fill: "#111827",
        locked: false,
      };
    case "shapes":
      return {
        type: "shape",
        label: item.title,
        x: 120,
        y: 220,
        width: 240,
        height: 120,
        fill: "#8A5BFF",
        opacity: 0.2,
        shapeVariant: item.id === "shape-2" ? "circle" : "rectangle",
        cornerRadius: item.id === "shape-2" ? undefined : 18,
        strokeWidth: 0,
        locked: false,
      };
    case "images":
      return {
        type: "image",
        label: item.title,
        x: 360,
        y: 200,
        width: 260,
        height: 160,
        assetUrl: item.assetUrl || item.preview,
        locked: false,
      };
    case "videos":
      return {
        type: "video",
        label: item.title,
        x: 460,
        y: 240,
        width: 280,
        height: 180,
        assetUrl: item.assetUrl || item.preview || "",
        locked: false,
      };
    case "audio":
      return {
        type: "audio",
        label: item.title,
        x: 120,
        y: 360,
        width: 420,
        height: 60,
        fill: "#1f2937",
        opacity: 0.1,
        cornerRadius: 18,
        strokeWidth: 0,
        locked: false,
        assetUrl: item.assetUrl || item.preview || "",
      };
    case "brand":
    default:
      return {
        type: "shape",
        label: item.title,
        x: 160,
        y: 160,
        width: 280,
        height: 120,
        fill: "#f4f3ff",
        cornerRadius: 18,
        strokeWidth: 0,
        locked: false,
      };
  }
};

type RightSidebarProps = {
  isCollapsed?: boolean;
  onToggle?: () => void;
};

const RightSidebar = ({ isCollapsed = false, onToggle }: RightSidebarProps) => {
  const { addElementToScene, activeSceneId, setSelectedElement } =
    useEditorStore((state) => ({
      addElementToScene: state.addElementToScene,
      activeSceneId: state.activeSceneId,
      setSelectedElement: state.setSelectedElement,
    }));

  const handleAssetClick = (item: AssetItem, category: AssetCategory) => {
    const element: CanvasElement = {
      id: `el-${Date.now()}`,
      ...generateElementFromAsset(item, category),
    } as CanvasElement;
    addElementToScene(activeSceneId, element);
    setSelectedElement(element.id);
  };

  if (isCollapsed) {
    return (
      <aside className="flex w-12 flex-col items-center border-l border-canvas-border bg-white/80 py-4">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-canvas-border bg-white p-2 text-slate-500 hover:border-brand-start hover:text-brand-start"
          aria-label="Expand assets panel"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-[380px] flex-col border-l border-canvas-border bg-white/80 backdrop-blur-xl">
      <div className="border-b border-canvas-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Explore
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Assets library
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1 rounded-full border border-transparent bg-gradient-to-r from-brand-start to-brand-end px-3 py-1.5 text-xs font-semibold text-white shadow-soft"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Magic fill
            </motion.button>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full border border-canvas-border p-2 text-slate-400 hover:border-slate-300 hover:text-slate-700"
              aria-label="Collapse assets panel"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Drag, tap, or AI-generate text, media, shapes, and branded elements.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <AssetTabs onAssetClick={handleAssetClick} />
        <TextEditorPanel />
      </div>
    </aside>
  );
};

export default RightSidebar;
