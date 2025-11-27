"use client";

import { ReactNode } from "react";

type AppLayoutProps = {
  left: ReactNode;
  canvas: ReactNode;
  right: ReactNode;
};

const AppLayout = ({ left, canvas, right }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-canvas-background text-slate-900">
      {left}
      <main className="flex min-h-screen flex-1 flex-col overflow-hidden">{canvas}</main>
      {right}
    </div>
  );
};

export default AppLayout;

