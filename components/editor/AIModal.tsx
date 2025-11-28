"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Wand2,
  ImageIcon,
  Video,
  Music,
  Type,
} from "lucide-react";
type AIModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerateScriptClick?: () => void;
};

const AIModal = ({ isOpen, onClose, onGenerateScriptClick }: AIModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const aiFeatures = [
    {
      icon: Wand2,
      title: "Generate Script",
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: ImageIcon,
      title: "Generate Images",
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: Video,
      title: "Generate Videos",
      color: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: Music,
      title: "Generate Audio",
      color: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: Type,
      title: "Text to Speech",
      color: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/60 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.3)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-canvas-border px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-start to-brand-end">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      AI Assistant
                    </h2>
                    <p className="text-sm text-slate-500">
                      Enhance your content with AI-powered features
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {aiFeatures.map((feature) => {
                    const IconComponent = feature.icon;
                    const handleClick = () => {
                      if (
                        feature.title === "Generate Script" &&
                        onGenerateScriptClick
                      ) {
                        onGenerateScriptClick();
                      }
                    };
                    return (
                      <motion.button
                        key={feature.title}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleClick}
                        className={`group relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br ${feature.bgGradient} p-6 text-center transition-all hover:border-brand-start/30 hover:shadow-xl`}
                      >
                        {/* Gradient overlay on hover */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                        />

                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                        <div className="relative flex flex-col items-center gap-3">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-xl`}
                          >
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {feature.title}
                          </h3>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-6 rounded-2xl border border-dashed border-brand-start/30 bg-gradient-to-br from-brand-start/5 to-brand-end/5 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-start">
                    Coming Soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIModal;
