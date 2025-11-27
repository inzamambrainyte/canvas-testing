import type { AssetCategory, AssetItem, BrandKit, Scene } from "./types";

export const mockScenes: Scene[] = [
  {
    id: "scene-1",
    title: "Intro Hook",
    duration: 6,
    script: "Hook the audience with a bold question and animated text.",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop&q=60",
    fonts: ["Sora", "Inter"],
    media: ["stock-video-1.mp4"],
    elements: [
      {
        id: "el-1",
        type: "text",
        label: "Headline",
        x: 120,
        y: 120,
        width: 420,
        height: 80,
        fontSize: 48,
        fontFamily: "Sora",
        textAlign: "left",
        content: "Design smarter videos in minutes.",
        fill: "#111827"
      },
      {
        id: "el-2",
        type: "shape",
        label: "Accent Pill",
        x: 100,
        y: 220,
        width: 160,
        height: 36,
        fill: "#8A5BFF",
        opacity: 0.15,
        shapeVariant: "rectangle"
      },
      {
        id: "el-3",
        type: "image",
        label: "Mood Board",
        x: 420,
        y: 180,
        width: 240,
        height: 160,
        assetUrl:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60",
        fill: "#e5e7eb"
      }
    ]
  },
  {
    id: "scene-2",
    title: "Feature Highlights",
    duration: 8,
    script: "Call out top features with supporting media and captions.",
    thumbnail:
      "https://images.unsplash.com/photo-1486947309897-ff94e672b472?w=400&auto=format&fit=crop&q=60",
    fonts: ["Space Grotesk"],
    media: ["ui-kit.png"],
    elements: [
      {
        id: "el-4",
        type: "text",
        label: "Subtitle",
        x: 140,
        y: 140,
        width: 360,
        height: 60,
        fontSize: 28,
        fontFamily: "Space Grotesk",
        content: "Smart scene-level editing & AI narration.",
        fill: "#1f2937"
      },
      {
        id: "el-5",
        type: "shape",
        label: "Card",
        x: 120,
        y: 230,
        width: 320,
        height: 180,
        fill: "#ffffff",
        opacity: 1,
        shapeVariant: "rectangle"
      },
      {
        id: "el-6",
        type: "video",
        label: "Demo Reel",
        x: 480,
        y: 210,
        width: 200,
        height: 200,
        assetUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        fill: "#0f172a"
      }
    ]
  },
  {
    id: "scene-3",
    title: "Call To Action",
    duration: 5,
    script: "Finish with a confident CTA, brand colors, and logo.",
    thumbnail:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
    fonts: ["General Sans"],
    media: ["logo.svg"],
    elements: [
      {
        id: "el-7",
        type: "text",
        label: "CTA",
        x: 160,
        y: 160,
        width: 400,
        height: 72,
        fontSize: 40,
        fontFamily: "General Sans",
        content: "Start creating with Canvas Studio",
        fill: "#0f172a"
      },
      {
        id: "el-8",
        type: "shape",
        label: "Gradient Chip",
        x: 150,
        y: 250,
        width: 260,
        height: 48,
        fill: "#8A5BFF",
        opacity: 0.2,
        shapeVariant: "rectangle"
      }
    ]
  }
];

export const assetLibrary: Record<AssetCategory, AssetItem[]> = {
  text: [
    {
      id: "text-1",
      title: "Headline",
      description: "Bold title preset",
      meta: "H1 / 72pt"
    },
    {
      id: "text-2",
      title: "Subtitle",
      description: "Medium subtitle preset",
      meta: "H2 / 40pt"
    },
    {
      id: "text-3",
      title: "Body",
      description: "Readable paragraph text",
      meta: "Body / 24pt"
    }
  ],
  fonts: [
    {
      id: "font-1",
      title: "Sora",
      description: "Geometric sans",
      fontFamily: "Sora"
    },
    {
      id: "font-2",
      title: "Space Grotesk",
      description: "Modern grotesk",
      fontFamily: "Space Grotesk"
    },
    {
      id: "font-3",
      title: "General Sans",
      description: "Friendly sans-serif",
      fontFamily: "General Sans"
    }
  ],
  shapes: [
    {
      id: "shape-1",
      title: "Rounded Rectangle",
      description: "Cards & backgrounds"
    },
    {
      id: "shape-2",
      title: "Circle",
      description: "Avatars & badges"
    },
    {
      id: "shape-3",
      title: "Line",
      description: "Separators"
    }
  ],
  images: [
    {
      id: "img-1",
      title: "Workspace",
      preview:
        "https://images.unsplash.com/photo-1522199670076-2852f80289c7?w=400&auto=format&fit=crop&q=60",
      description: "Creative studio desk"
    },
    {
      id: "img-2",
      title: "Moodboard",
      preview:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
      description: "Colorful inspiration"
    }
  ],
  videos: [
    {
      id: "vid-1",
      title: "UI Walkthrough",
      description: "30s product reel",
      meta: "16:9"
    },
    {
      id: "vid-2",
      title: "B-roll Stock",
      description: "Abstract gradients",
      meta: "10s loop"
    }
  ],
  audio: [
    {
      id: "aud-1",
      title: "Chill Beat",
      description: "Lo-fi ambient",
      meta: "00:18"
    },
    {
      id: "aud-2",
      title: "Narration (AI)",
      description: "Female / Warm",
      meta: "Preview"
    }
  ],
  brand: [
    {
      id: "brand-1",
      title: "Upload brand kit",
      description: "Logo, fonts, palette",
      actionLabel: "Upgrade"
    }
  ]
};

export const brandKit: BrandKit = {
  colors: ["#111827", "#8A5BFF", "#4B8BFF", "#F4F3FF", "#F6F7FB"],
  fonts: ["Sora", "General Sans", "Space Grotesk", "Inter"]
};

