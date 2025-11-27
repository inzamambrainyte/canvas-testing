"use client";

import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const TextEditorPanel = () => {
  const { scenes, activeSceneId, selectedElementId, updateElement } =
    useEditorStore((state) => ({
      scenes: state.scenes,
      activeSceneId: state.activeSceneId,
      selectedElementId: state.selectedElementId,
      updateElement: state.updateElement,
    }));

  const activeScene = scenes.find((scene) => scene.id === activeSceneId);
  const element = activeScene?.elements.find(
    (el) => el.id === selectedElementId
  );
  const [localContent, setLocalContent] = useState(element?.content ?? "");

  useEffect(() => {
    setLocalContent(element?.content ?? "");
  }, [element?.id]);

  if (!element) {
    return (
      <div className="rounded-3xl border border-dashed border-canvas-border/70 bg-white/50 px-4 py-6 text-center text-sm text-slate-500">
        Select a layer to edit its styling.
      </div>
    );
  }

  if (element.locked) {
    return (
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50/80 px-4 py-6 text-center text-sm text-yellow-700">
        This layer is locked. Unlock it to change typography or color.
      </div>
    );
  }

  if (element.type !== "text") {
    return (
      <div className="rounded-3xl border border-dashed border-canvas-border/70 bg-white/50 px-4 py-6 text-center text-sm text-slate-500">
        Select a text layer to edit its styling.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-canvas-border bg-white/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Type className="h-4 w-4 text-brand-start" aria-hidden />
        Text styling
      </div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Content
        <textarea
          className="mt-1 w-full rounded-2xl border border-canvas-border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-start"
          rows={3}
          value={localContent}
          onChange={(event) => {
            setLocalContent(event.target.value);
            updateElement(activeSceneId, element.id, {
              content: event.target.value,
            });
          }}
        />
      </label>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Font size
          </span>
          <input
            type="number"
            min={12}
            className="w-full rounded-2xl border border-canvas-border bg-white px-3 py-2 outline-none focus:border-brand-start"
            value={element.fontSize ?? 32}
            onChange={(event) =>
              updateElement(activeSceneId, element.id, {
                fontSize: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Font family
          </span>
          <select
            className="w-full rounded-2xl border border-canvas-border bg-white px-3 py-2 outline-none focus:border-brand-start"
            value={element.fontFamily}
            onChange={(event) =>
              updateElement(activeSceneId, element.id, {
                fontFamily: event.target.value,
              })
            }
          >
            {["Sora", "General Sans", "Space Grotesk", "Inter"].map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Alignment
        </span>
        <div className="mt-2 flex gap-2">
          {["left", "center", "right"].map((align) => (
            <button
              key={align}
              type="button"
              onClick={() =>
                updateElement(activeSceneId, element.id, {
                  textAlign: align as "left" | "center" | "right",
                })
              }
              className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                element.textAlign === align
                  ? "border-brand-start/60 bg-white shadow-soft text-brand-start"
                  : "border-canvas-border text-slate-500 hover:border-slate-300"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextEditorPanel;
