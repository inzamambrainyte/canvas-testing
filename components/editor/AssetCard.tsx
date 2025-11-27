"use client";

import Image from "next/image";
import clsx from "clsx";
import type { AssetItem } from "@/lib/types";

type AssetCardProps = {
  item: AssetItem;
  onClick?: () => void;
};

const AssetCard = ({ item, onClick }: AssetCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-canvas-border bg-white px-3 py-3 text-left shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-brand-start/40"
    >
      {item.preview ? (
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
          <Image src={item.preview} alt={item.title} fill className="object-cover" sizes="56px" />
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-400">
          {item.title[0]}
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-semibold text-slate-900">{item.title}</span>
        {item.description && (
          <span className="text-xs text-slate-500">{item.description}</span>
        )}
        {item.meta && <span className="text-[11px] text-slate-400">{item.meta}</span>}
      </div>
      {item.actionLabel && (
        <span
          className={clsx(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            item.actionLabel === "Upgrade"
              ? "border-brand-start/30 text-brand-start"
              : "border-slate-200 text-slate-400"
          )}
        >
          {item.actionLabel}
        </span>
      )}
    </button>
  );
};

export default AssetCard;


