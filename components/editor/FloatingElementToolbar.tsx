"use client";

import { Fragment, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignCenter, AlignLeft, AlignRight, RefreshCw } from "lucide-react";
import type { CanvasElement } from "@/lib/types";

const alignOptions: {
  value: "left" | "center" | "right";
  icon: JSX.Element;
  label: string;
}[] = [
  {
    value: "left",
    icon: <AlignLeft className="h-4 w-4" />,
    label: "Align left",
  },
  {
    value: "center",
    icon: <AlignCenter className="h-4 w-4" />,
    label: "Align center",
  },
  {
    value: "right",
    icon: <AlignRight className="h-4 w-4" />,
    label: "Align right",
  },
];

const fontOptions = [
  "Sora",
  "General Sans",
  "Space Grotesk",
  "Inter",
  "Instrument Sans",
];

type FloatingElementToolbarProps = {
  element: CanvasElement | null;
  position: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement>;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onResetPosition: () => void;
  onUpdate: (patch: Partial<CanvasElement>) => void;
};

const FloatingElementToolbar = ({
  element,
  position,
  containerRef,
  onPositionChange,
  onResetPosition,
  onUpdate,
}: FloatingElementToolbarProps) => {
  if (!element || !position) {
    return null;
  }

  const isText = element.type === "text";
  const swatches = ["#0f172a", "#ffffff", "#8A5BFF", "#4B8BFF", "#F97316"];

  return (
    <AnimatePresence>
      <motion.div
        key={element.id}
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        drag
        dragMomentum={false}
        dragConstraints={containerRef}
        onDragEnd={(_, info) => {
          const container = containerRef.current;
          if (!container) return;
          const rect = container.getBoundingClientRect();
          onPositionChange({
            x: info.point.x - rect.left,
            y: info.point.y - rect.top,
          });
        }}
        className="pointer-events-auto absolute z-30 min-w-[260px] cursor-grab rounded-2xl border border-white/60 bg-white/95 p-3 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-md"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -110%)",
        }}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>{element.label}</span>
          <button
            type="button"
            onClick={onResetPosition}
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:border-slate-200 hover:bg-white"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Reset
          </button>
        </div>
        {isText ? (
          <Fragment>
            <div className="mt-2 flex flex-wrap gap-2">
              {swatches.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onUpdate({ fill: hex })}
                  style={{ backgroundColor: hex }}
                  className={`h-6 w-6 rounded-full border ${
                    element.fill === hex
                      ? "border-brand-start ring-2 ring-brand-start/60"
                      : "border-white/50"
                  }`}
                >
                  <span className="sr-only">{hex}</span>
                </button>
              ))}
              <label className="relative flex h-6 w-14 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                HEX
                <input
                  type="color"
                  value={element.fill ?? "#0f172a"}
                  onChange={(event) => onUpdate({ fill: event.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <select
                value={element.fontFamily}
                onChange={(event) =>
                  onUpdate({ fontFamily: event.target.value })
                }
                className="flex-1 rounded-2xl border border-canvas-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-start"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={8}
                max={144}
                value={element.fontSize ?? 32}
                onChange={(event) =>
                  onUpdate({ fontSize: Number(event.target.value) })
                }
                className="w-20 rounded-2xl border border-canvas-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-start"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              {alignOptions.map((align) => (
                <button
                  key={align.value}
                  type="button"
                  onClick={() => onUpdate({ textAlign: align.value })}
                  className={`flex flex-1 items-center justify-center rounded-2xl border p-2 text-slate-500 transition ${
                    element.textAlign === align.value
                      ? "border-brand-start/70 bg-white text-brand-start shadow-soft"
                      : "border-transparent bg-slate-50 hover:border-slate-200"
                  }`}
                  aria-label={align.label}
                >
                  {align.icon}
                </button>
              ))}
            </div>
          </Fragment>
        ) : (
          <div className="mt-3 text-xs text-slate-400">
            More controls for this element type coming soon.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingElementToolbar;
