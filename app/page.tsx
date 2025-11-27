"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
import ScenesPanel from "@/components/editor/ScenesPanel";
import CanvasEditor from "@/components/editor/CanvasEditor";
import RightSidebar from "@/components/editor/RightSidebar";

const HomePage = () => {
  const [isScenesCollapsed, setIsScenesCollapsed] = useState(false);
  const [isAssetsCollapsed, setIsAssetsCollapsed] = useState(false);

  return (
    <AppLayout
      left={<ScenesPanel isCollapsed={isScenesCollapsed} onToggle={() => setIsScenesCollapsed((prev) => !prev)} />}
      canvas={
        <div className="flex flex-1 flex-col">
          <CanvasEditor />
        </div>
      }
      right={<RightSidebar isCollapsed={isAssetsCollapsed} onToggle={() => setIsAssetsCollapsed((prev) => !prev)} />}
    />
  );
};

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});


