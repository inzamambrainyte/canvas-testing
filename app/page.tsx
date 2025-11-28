"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
import ScenesPanel from "@/components/editor/ScenesPanel";
import CanvasEditor from "@/components/editor/CanvasEditor";
import RightSidebar from "@/components/editor/RightSidebar";
import GenerateScriptModal from "@/components/editor/GenerateScriptModal";
import PFVModal from "@/components/editor/PFVModal";

const HomePage = () => {
  const [isScenesCollapsed, setIsScenesCollapsed] = useState(false);
  const [isAssetsCollapsed, setIsAssetsCollapsed] = useState(false);
  const [isGenerateScriptOpen, setIsGenerateScriptOpen] = useState(false);
  const [isPFVOpen, setIsPFVOpen] = useState(false);

  return (
    <>
      <AppLayout
        left={
          <ScenesPanel 
            isCollapsed={isScenesCollapsed} 
            onToggle={() => setIsScenesCollapsed((prev) => !prev)}
            onGenerateScriptClick={() => setIsGenerateScriptOpen(true)}
          />
        }
        canvas={
          <div className="flex flex-1 flex-col">
            <CanvasEditor onPFVClick={() => setIsPFVOpen(true)} />
          </div>
        }
        right={<RightSidebar isCollapsed={isAssetsCollapsed} onToggle={() => setIsAssetsCollapsed((prev) => !prev)} />}
      />
      
      {/* Generate Script Modal - Rendered at root level for full screen */}
      <GenerateScriptModal
        isOpen={isGenerateScriptOpen}
        onClose={() => setIsGenerateScriptOpen(false)}
      />
      
      {/* PFV Modal - Rendered at root level for full screen */}
      <PFVModal
        isOpen={isPFVOpen}
        onClose={() => setIsPFVOpen(false)}
      />
    </>
  );
};

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});


