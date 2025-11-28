"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Loader2, ChevronLeft, Check } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

type GenerateScriptModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GenerateScriptModal = ({
  isOpen,
  onClose,
}: GenerateScriptModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("16:9");
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<any[]>([]);
  const { createNewProject, setAspectRatio } = useEditorStore((state) => ({
    createNewProject: state.createNewProject,
    setAspectRatio: state.setAspectRatio,
  }));

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);


  const aspectRatios = [
    { label: "16:9", value: "16:9", icon: "📺" },
    { label: "9:16", value: "9:16", icon: "📱" },
    { label: "1:1", value: "1:1", icon: "⬜" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a script prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/openai/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: selectedAspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      if (data.success && data.scenes) {
        // Store generated scenes and move to step 2
        setGeneratedScenes(data.scenes);
        setCurrentStep(2);
        setError(null);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Error generating script:", err);
      setError(err.message || "Failed to generate script. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmScenes = () => {
    // Set the aspect ratio for the editor
    setAspectRatio(selectedAspectRatio as "16:9" | "9:16" | "1:1");

    // Create a new project with the generated scenes
    createNewProject(
      generatedScenes.map((scene: any) => ({
        title: scene.title,
        script: scene.script,
        duration: scene.duration,
      }))
    );

    // Close modal and reset form
    handleClose();
  };

  const handleClose = () => {
    setPrompt("");
    setError(null);
    setCurrentStep(1);
    setGeneratedScenes([]);
    setSelectedAspectRatio("16:9");
    onClose();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setError(null);
      setCurrentStep(1);
      setGeneratedScenes([]);
      setSelectedAspectRatio("16:9");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onMouseDown={(e) => {
            // Only close if clicking directly on the container (backdrop)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <div 
            className="relative z-10 w-full max-w-lg p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full rounded-3xl border border-white/60 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.3)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-canvas-border px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <Wand2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Generate Script
                    </h2>
                    <p className="text-sm text-slate-500">
                      {currentStep === 1
                        ? "Step 1 of 2: Enter your script details"
                        : "Step 2 of 2: Review generated scenes"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="border-b border-canvas-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      currentStep >= 1
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > 1 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "1"
                    )}
                  </div>
                  <div
                    className={`h-1 flex-1 rounded ${
                      currentStep >= 2 ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      currentStep >= 2
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {currentStep === 1 ? (
                  <>
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {aspectRatios.map((ratio) => (
                          <motion.button
                            key={ratio.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setSelectedAspectRatio(ratio.value)}
                            disabled={isGenerating}
                            className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-center transition-all ${
                              selectedAspectRatio === ratio.value
                                ? "border-brand-start bg-gradient-to-br from-brand-start/10 to-brand-end/10 shadow-lg"
                                : "border-canvas-border bg-white hover:border-brand-start hover:shadow-lg"
                            } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="text-3xl mb-2">{ratio.icon}</div>
                            <div className="text-sm font-bold text-slate-900">
                              {ratio.label}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Script Prompt
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Describe what you want to create... (e.g., 'A video about sustainable living tips')"
                        disabled={isGenerating}
                        className="w-full resize-none rounded-xl border border-canvas-border bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-start focus:outline-none focus:ring-2 focus:ring-brand-start/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={4}
                      />
                    </div>

                    {error && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isGenerating}
                        className="flex-1 rounded-xl border border-canvas-border bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="mb-4 text-lg font-semibold text-slate-900">
                        Generated Scenes ({generatedScenes.length})
                      </h3>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {generatedScenes.map((scene, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-canvas-border bg-white p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900">
                                {scene.title}
                              </h4>
                              <span className="text-xs text-slate-500">
                                {scene.duration}s
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {scene.script}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-canvas-border bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 rounded-xl border border-canvas-border bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmScenes}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Add to Editor
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GenerateScriptModal;

