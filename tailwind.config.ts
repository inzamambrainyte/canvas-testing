import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"]
      },
      colors: {
        canvas: {
          background: "#f6f7fb",
          panel: "#ffffff",
          border: "#e4e7ec",
          accent: "#635bff"
        },
        brand: {
          start: "#8a5bff",
          end: "#4b8bff"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

