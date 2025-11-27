"use client";

import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
import ScenesPanel from "@/components/editor/ScenesPanel";
import CanvasEditor from "@/components/editor/CanvasEditor";
import RightSidebar from "@/components/editor/RightSidebar";

const HomePage = () => {
  return (
    <AppLayout
      left={<ScenesPanel />}
      canvas={
        <div className="flex flex-1 flex-col">
          <CanvasEditor />
        </div>
      }
      right={<RightSidebar />}
    />
  );
};

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});


