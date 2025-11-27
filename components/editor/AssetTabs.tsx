"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import AssetCard from "./AssetCard";
import { assetLibrary, brandKit } from "@/lib/mockData";
import type { AssetCategory, AssetItem } from "@/lib/types";

const tabConfig: { id: AssetCategory; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "fonts", label: "Fonts" },
  { id: "shapes", label: "Shapes" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "brand", label: "Brand Kit" }
];

type AssetTabsProps = {
  onAssetClick: (item: AssetItem, category: AssetCategory) => void;
};

const AssetTabs = ({ onAssetClick }: AssetTabsProps) => {
  const [activeTab, setActiveTab] = useState<AssetCategory>("text");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = assetLibrary[activeTab].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-semibold ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-start to-brand-end text-white shadow-soft"
                : "bg-white/70 text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-full border border-canvas-border bg-white/70 px-3 py-2 text-sm text-slate-500 focus-within:border-brand-start">
        <Search className="h-4 w-4" aria-hidden />
        <span className="sr-only">Search assets</span>
        <input
          type="search"
          placeholder="Search library"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex-1 space-y-3 overflow-y-auto pb-6"
      >
        {filteredItems.length === 0 && (
          <div className="rounded-3xl border border-dashed border-canvas-border/80 bg-white/60 px-4 py-12 text-center text-sm text-slate-500">
            No matches. Try another term.
          </div>
        )}
        {filteredItems.map((item) => (
          <AssetCard key={item.id} item={item} onClick={() => onAssetClick(item, activeTab)} />
        ))}
      </motion.div>

      {activeTab === "brand" && (
        <div className="mt-2 rounded-3xl border border-canvas-border bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Brand kit</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brandKit.colors.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <span
                  className="h-9 w-9 rounded-full border border-white shadow-soft"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-slate-400">{color}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fonts</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
              {brandKit.fonts.map((font) => (
                <span key={font} className="rounded-full bg-slate-50 px-3 py-1">
                  {font}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTabs;


