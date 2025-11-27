"use client";

import { motion } from "framer-motion";
import { GripVertical, MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

type SceneItemProps = {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const SceneItem = ({
  title,
  duration,
  thumbnail,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: SceneItemProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      type="button"
      onClick={onSelect}
      className={clsx(
        "group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
        isActive
          ? "border-transparent bg-gradient-to-br from-brand-start/15 via-white to-brand-end/15 shadow-soft"
          : "border-canvas-border bg-white hover:border-brand-start/40"
      )}
    >
      <span className="flex h-full items-center text-slate-400">
        <GripVertical className="h-4 w-4" aria-hidden />
      </span>
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="96px"
          className="object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm">
          <Play className="h-3 w-3" aria-hidden />
          {duration}s
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">
          Script ready • {duration}s
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className="rounded-full bg-rose-50 p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      </div>
    </motion.button>
  );
};

export default SceneItem;
