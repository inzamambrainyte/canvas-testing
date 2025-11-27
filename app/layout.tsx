import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canvas Studio",
  description: "Scene-based visual editor inspired by Fliki & Canva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas-background text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
