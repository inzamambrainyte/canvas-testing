"use client";

import React, { Fragment, RefObject, useState, useRef, useEffect } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Maximize2,
  Crop,
} from "lucide-react";
import type { CanvasElement, ImageFitMode } from "@/lib/types";

const alignOptions: {
  value: "left" | "center" | "right";
  iconComponent: "left" | "center" | "right";
  label: string;
}[] = [
  {
    value: "left",
    iconComponent: "left",
    label: "Align left",
  },
  {
    value: "center",
    iconComponent: "center",
    label: "Align center",
  },
  {
    value: "right",
    iconComponent: "right",
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
  onPositionChange?: (pos: { x: number; y: number }) => void;
  onResetPosition?: () => void;
  onUpdate: (patch: Partial<CanvasElement>) => void;
};

const ColorDropdown = ({
  currentColor,
  onColorChange,
  onClose,
}: {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}) => {
  const swatches = ["#0f172a", "#ffffff", "#8A5BFF", "#4B8BFF", "#F97316"];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.15)]"
    >
      <div className="flex flex-wrap gap-2">
        {swatches.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => {
              onColorChange(hex);
              onClose();
            }}
            style={{ backgroundColor: hex }}
            className={`h-8 w-8 rounded-full border transition ${
              currentColor === hex
                ? "border-brand-start ring-2 ring-brand-start/60 scale-110"
                : "border-white/50 hover:scale-105"
            }`}
          >
            <span className="sr-only">{hex}</span>
          </button>
        ))}
      </div>
      <label className="mt-3 flex h-8 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:border-brand-start transition">
        Custom Color
        <input
          type="color"
          value={currentColor}
          onChange={(event) => {
            onColorChange(event.target.value);
            onClose();
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
};

const SliderDropdown = ({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  onClose,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  onClose: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.15)]"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={localValue}
          onChange={(event) => {
            const newValue = Number(event.target.value);
            setLocalValue(newValue);
            onChange(newValue);
          }}
          className="flex-1 accent-brand-start"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={localValue}
          onChange={(event) => {
            const newValue = Number(event.target.value);
            setLocalValue(newValue);
            onChange(newValue);
          }}
          className="w-16 rounded-xl border border-canvas-border bg-white px-2 py-1 text-sm outline-none focus:border-brand-start"
        />
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );
};

const FloatingElementToolbar = ({
  element,
  position,
  containerRef,
  onPositionChange,
  onResetPosition,
  onUpdate,
}: FloatingElementToolbarProps) => {
  const isText = element?.type === "text";
  const isShape = element?.type === "shape";
  const isImage = element?.type === "image";
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [borderColorDropdownOpen, setBorderColorDropdownOpen] = useState(false);
  const [radiusDropdownOpen, setRadiusDropdownOpen] = useState(false);
  const [borderWidthDropdownOpen, setBorderWidthDropdownOpen] = useState(false);
  const [opacityDropdownOpen, setOpacityDropdownOpen] = useState(false);
  const [imageRadiusDropdownOpen, setImageRadiusDropdownOpen] = useState(false);
  const [imageOpacityDropdownOpen, setImageOpacityDropdownOpen] =
    useState(false);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  if (!element) {
    return null;
  }

  const currentFillColor = element.fill ?? (isText ? "#0f172a" : "#d4d4d8");
  const currentStrokeColor = element.stroke ?? "#0f172a";

  return (
    <div className="pointer-events-auto sticky top-0 z-40 w-full rounded-2xl border border-white/60 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {element.label}
        </div>
        <div className="h-6 w-px bg-slate-200" />
        {isText ? (
          <Fragment>
            <div className="relative">
              <button
                ref={colorButtonRef}
                type="button"
                onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                style={{ backgroundColor: currentFillColor }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 shadow-sm transition hover:scale-105"
              >
                <span className="sr-only">Color</span>
              </button>
              {colorDropdownOpen && (
                <ColorDropdown
                  currentColor={currentFillColor}
                  onColorChange={(color) => onUpdate({ fill: color })}
                  onClose={() => setColorDropdownOpen(false)}
                />
              )}
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <select
              value={element.fontFamily}
              onChange={(event) => onUpdate({ fontFamily: event.target.value })}
              className="rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
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
              className="w-16 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              placeholder="Size"
            />
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              {alignOptions.map((align) => {
                const IconComponent =
                  align.iconComponent === "left"
                    ? AlignLeft
                    : align.iconComponent === "center"
                    ? AlignCenter
                    : AlignRight;
                return (
                  <button
                    key={align.value}
                    type="button"
                    onClick={() => onUpdate({ textAlign: align.value })}
                    className={`rounded-xl border p-1.5 text-slate-500 transition ${
                      element.textAlign === align.value
                        ? "border-brand-start/70 bg-white text-brand-start shadow-sm"
                        : "border-transparent bg-slate-50 hover:border-slate-200"
                    }`}
                    aria-label={align.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </Fragment>
        ) : isShape ? (
          <Fragment>
            <div className="relative">
              <button
                type="button"
                onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                style={{ backgroundColor: currentFillColor }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 shadow-sm transition hover:scale-105"
              >
                <span className="sr-only">Color</span>
              </button>
              {colorDropdownOpen && (
                <ColorDropdown
                  currentColor={currentFillColor}
                  onColorChange={(color) => onUpdate({ fill: color })}
                  onClose={() => setColorDropdownOpen(false)}
                />
              )}
            </div>
            {element.shapeVariant === "rectangle" && (
              <>
                <div className="h-6 w-px bg-slate-200" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRadiusDropdownOpen(!radiusDropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
                  >
                    <span>{element.cornerRadius ?? 18}px</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {radiusDropdownOpen && (
                    <SliderDropdown
                      label="Corner Radius"
                      value={element.cornerRadius ?? 18}
                      min={0}
                      max={50}
                      unit="px"
                      onChange={(value) => onUpdate({ cornerRadius: value })}
                      onClose={() => setRadiusDropdownOpen(false)}
                    />
                  )}
                </div>
              </>
            )}
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setBorderWidthDropdownOpen(!borderWidthDropdownOpen)
                }
                className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              >
                <span>{element.strokeWidth ?? 0}px</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {borderWidthDropdownOpen && (
                <SliderDropdown
                  label="Border Width"
                  value={element.strokeWidth ?? 0}
                  min={0}
                  max={20}
                  unit="px"
                  onChange={(value) => onUpdate({ strokeWidth: value })}
                  onClose={() => setBorderWidthDropdownOpen(false)}
                />
              )}
            </div>
            {element.strokeWidth && element.strokeWidth > 0 && (
              <>
                <div className="h-6 w-px bg-slate-200" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setBorderColorDropdownOpen(!borderColorDropdownOpen)
                    }
                    style={{ backgroundColor: currentStrokeColor }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 shadow-sm transition hover:scale-105"
                  >
                    <span className="sr-only">Border Color</span>
                  </button>
                  {borderColorDropdownOpen && (
                    <ColorDropdown
                      currentColor={currentStrokeColor}
                      onColorChange={(color) => onUpdate({ stroke: color })}
                      onClose={() => setBorderColorDropdownOpen(false)}
                    />
                  )}
                </div>
              </>
            )}
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpacityDropdownOpen(!opacityDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              >
                <span>{Math.round((element.opacity ?? 1) * 100)}%</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {opacityDropdownOpen && (
                <SliderDropdown
                  label="Opacity"
                  value={Math.round((element.opacity ?? 1) * 100)}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(value) => onUpdate({ opacity: value / 100 })}
                  onClose={() => setOpacityDropdownOpen(false)}
                />
              )}
            </div>
          </Fragment>
        ) : isImage ? (
          <Fragment>
            <button
              type="button"
              onClick={() => {
                // Fit to screen - calculate dimensions based on canvas size
                // This will be handled by the parent component with canvas dimensions
                onUpdate({ imageFit: "fit-to-screen" });
              }}
              className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand-start hover:text-brand-start"
              title="Fit to screen"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Fit to Screen</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setImageOpacityDropdownOpen(!imageOpacityDropdownOpen)
                }
                className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              >
                <span>{Math.round((element.opacity ?? 1) * 100)}%</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {imageOpacityDropdownOpen && (
                <SliderDropdown
                  label="Transparency"
                  value={Math.round((element.opacity ?? 1) * 100)}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(value) => onUpdate({ opacity: value / 100 })}
                  onClose={() => setImageOpacityDropdownOpen(false)}
                />
              )}
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setImageRadiusDropdownOpen(!imageRadiusDropdownOpen)
                }
                className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              >
                <span>{element.cornerRadius ?? 0}px</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {imageRadiusDropdownOpen && (
                <SliderDropdown
                  label="Corner Radius"
                  value={element.cornerRadius ?? 0}
                  min={0}
                  max={100}
                  unit="px"
                  onChange={(value) => onUpdate({ cornerRadius: value })}
                  onClose={() => setImageRadiusDropdownOpen(false)}
                />
              )}
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => {
                // Crop functionality - placeholder for now
                // This can be expanded to open a crop modal/editor
                alert("Crop functionality coming soon!");
              }}
              className="flex items-center gap-2 rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand-start hover:text-brand-start"
              title="Crop image"
            >
              <Crop className="h-4 w-4" />
              <span>Crop</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Fit:</span>
              <select
                value={element.imageFit ?? "cover"}
                onChange={(event) =>
                  onUpdate({ imageFit: event.target.value as ImageFitMode })
                }
                className="rounded-xl border border-canvas-border bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-start"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="fit-to-screen">Fit to Screen</option>
              </select>
            </div>
          </Fragment>
        ) : (
          <div className="text-xs text-slate-400">
            More controls for this element type coming soon.
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingElementToolbar;
