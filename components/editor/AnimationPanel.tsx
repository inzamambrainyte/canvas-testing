"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { Animation, AnimationType, EasingType } from "@/lib/types";

const AnimationPanel = () => {
  const { selectedElementId, scenes, activeSceneId, updateElement } =
    useEditorStore((state) => ({
      selectedElementId: state.selectedElementId,
      scenes: state.scenes,
      activeSceneId: state.activeSceneId,
      updateElement: state.updateElement,
    }));

  const selectedElement = useMemo(() => {
    if (!selectedElementId || !activeSceneId) return null;
    const scene = scenes.find((s) => s.id === activeSceneId);
    return scene?.elements.find((el) => el.id === selectedElementId) ?? null;
  }, [selectedElementId, activeSceneId, scenes]);

  const [expandedAnimations, setExpandedAnimations] = useState<Set<string>>(
    new Set()
  );

  if (!selectedElement) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-900">
            No element selected
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Select an element to add animations
          </p>
        </div>
      </div>
    );
  }

  if (selectedElement.locked) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-900">Element is locked</p>
          <p className="mt-1 text-xs text-slate-500">
            Unlock the element to add animations
          </p>
        </div>
      </div>
    );
  }

  const animations = selectedElement.animations || [];

  const animationTypes: { value: AnimationType; label: string }[] = [
    { value: "fade", label: "Fade" },
    { value: "slide", label: "Slide" },
    { value: "zoom", label: "Zoom" },
    { value: "bounce", label: "Bounce" },
    { value: "rotate", label: "Rotate" },
    { value: "pulse", label: "Pulse" },
    { value: "shake", label: "Shake" },
    { value: "move", label: "Move" },
    { value: "scale", label: "Scale" },
  ];

  const easingTypes: { value: EasingType; label: string }[] = [
    { value: "linear", label: "Linear" },
    { value: "ease-in", label: "Ease In" },
    { value: "ease-out", label: "Ease Out" },
    { value: "ease-in-out", label: "Ease In Out" },
    { value: "bounce", label: "Bounce" },
    { value: "elastic", label: "Elastic" },
  ];

  const handleAddAnimation = () => {
    const newAnimation: Animation = {
      id: `anim-${Date.now()}`,
      type: "fade",
      duration: 1,
      delay: 0,
      easing: "ease-in-out",
      direction: "in",
    };

    const updatedAnimations = [...animations, newAnimation];
    updateElement(activeSceneId, selectedElement.id, {
      animations: updatedAnimations,
    });

    // Auto-expand the new animation
    setExpandedAnimations(new Set([...expandedAnimations, newAnimation.id]));
  };

  const handleRemoveAnimation = (animationId: string) => {
    const updatedAnimations = animations.filter((anim) => anim.id !== animationId);
    updateElement(activeSceneId, selectedElement.id, {
      animations: updatedAnimations,
    });
  };

  const handleUpdateAnimation = (
    animationId: string,
    updates: Partial<Animation>
  ) => {
    const updatedAnimations = animations.map((anim) =>
      anim.id === animationId ? { ...anim, ...updates } : anim
    );
    updateElement(activeSceneId, selectedElement.id, {
      animations: updatedAnimations,
    });
  };

  const toggleExpand = (animationId: string) => {
    const newExpanded = new Set(expandedAnimations);
    if (newExpanded.has(animationId)) {
      newExpanded.delete(animationId);
    } else {
      newExpanded.add(animationId);
    }
    setExpandedAnimations(newExpanded);
  };

  const handlePreviewAnimation = (animation: Animation) => {
    // Preview a single animation
    window.dispatchEvent(
      new CustomEvent("preview-animation", {
        detail: { elementId: selectedElement.id, animation },
      })
    );
  };

  const handlePlayAllAnimations = () => {
    // Play all animations in sequence
    if (animations.length === 0) return;
    window.dispatchEvent(
      new CustomEvent("play-all-animations", {
        detail: { elementId: selectedElement.id, animations },
      })
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-canvas-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Animations</h3>
            {animations.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                {animations.length} animation{animations.length !== 1 ? "s" : ""} applied
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {animations.length > 0 && (
              <button
                type="button"
                onClick={handlePlayAllAnimations}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-start bg-gradient-to-r from-brand-start to-brand-end px-2 py-1 text-xs font-medium text-white transition hover:shadow-md"
                title="Play all animations"
              >
                <Play className="h-3.5 w-3.5" />
                Play All
              </button>
            )}
            <button
              type="button"
              onClick={handleAddAnimation}
              className="inline-flex items-center gap-1 rounded-lg border border-canvas-border bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-brand-start hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {animations.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-sm text-slate-500">No animations applied</p>
              <p className="mt-1 text-xs text-slate-400">
                Click "Add" to apply an animation to this element
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Animations will play automatically in preview mode
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {animations.map((animation) => {
              const isExpanded = expandedAnimations.has(animation.id);
              return (
                <div
                  key={animation.id}
                  className="rounded-lg border border-canvas-border bg-white"
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(animation.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {animationTypes.find((t) => t.value === animation.type)
                              ?.label || animation.type}
                            {animation.direction && ` ${animation.direction}`}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                            Applied
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {animation.duration}s • {animation.easing}
                          {animation.delay > 0 && ` • +${animation.delay}s delay`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewAnimation(animation)}
                        className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Preview animation"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnimation(animation.id)}
                        className="rounded p-1 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                        title="Remove animation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-canvas-border p-3 space-y-3"
                    >
                      {/* Animation Type */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          Type
                        </label>
                        <select
                          value={animation.type}
                          onChange={(e) =>
                            handleUpdateAnimation(animation.id, {
                              type: e.target.value as AnimationType,
                            })
                          }
                          className="w-full rounded-lg border border-canvas-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-start focus:outline-none focus:ring-2 focus:ring-brand-start/20"
                        >
                          {animationTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Direction (for fade, slide, zoom, etc.) */}
                      {(animation.type === "fade" ||
                        animation.type === "slide" ||
                        animation.type === "zoom" ||
                        animation.type === "bounce" ||
                        animation.type === "rotate") && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700">
                            Direction
                          </label>
                          <select
                            value={animation.direction || "in"}
                            onChange={(e) =>
                              handleUpdateAnimation(animation.id, {
                                direction: e.target.value as "in" | "out",
                              })
                            }
                            className="w-full rounded-lg border border-canvas-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-start focus:outline-none focus:ring-2 focus:ring-brand-start/20"
                          >
                            <option value="in">In</option>
                            <option value="out">Out</option>
                          </select>
                        </div>
                      )}

                      {/* Duration */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          Duration: {animation.duration}s
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={animation.duration}
                          onChange={(e) =>
                            handleUpdateAnimation(animation.id, {
                              duration: parseFloat(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Delay */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          Delay: {animation.delay}s
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={animation.delay}
                          onChange={(e) =>
                            handleUpdateAnimation(animation.id, {
                              delay: parseFloat(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Easing */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          Easing
                        </label>
                        <select
                          value={animation.easing}
                          onChange={(e) =>
                            handleUpdateAnimation(animation.id, {
                              easing: e.target.value as EasingType,
                            })
                          }
                          className="w-full rounded-lg border border-canvas-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-start focus:outline-none focus:ring-2 focus:ring-brand-start/20"
                        >
                          {easingTypes.map((easing) => (
                            <option key={easing.value} value={easing.value}>
                              {easing.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationPanel;

