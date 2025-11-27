import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockScenes } from "@/lib/mockData";
import type { AspectRatio, CanvasElement, Scene } from "@/lib/types";

type EditorStore = {
  scenes: Scene[];
  activeSceneId: string;
  selectedElementId: string | null;
  aspectRatio: AspectRatio;
  zoom: number;
  isPlaying: boolean;
  history: Record<string, CanvasElement[][]>;
  setActiveScene: (sceneId: string) => void;
  addScene: () => void;
  duplicateScene: (sceneId: string) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (sceneIds: string[]) => void;
  setSelectedElement: (elementId: string | null) => void;
  updateElement: (sceneId: string, elementId: string, patch: Partial<CanvasElement>) => void;
  addElementToScene: (sceneId: string, element: CanvasElement) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setZoom: (zoom: number) => void;
  togglePlayback: () => void;
};

const generateScene = (index: number): Scene => ({
  id: `scene-${Date.now()}`,
  title: `Scene ${index}`,
  duration: 5,
  script: "New scene description",
  thumbnail:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
  fonts: [],
  media: [],
  elements: []
});

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      scenes: mockScenes,
      activeSceneId: mockScenes[0]?.id ?? "",
      selectedElementId: null,
      aspectRatio: "16:9",
      zoom: 1,
      isPlaying: false,
      history: {},
      setActiveScene: (sceneId) => set({ activeSceneId: sceneId, selectedElementId: null }),
      addScene: () =>
        set((state) => {
          const nextIndex = state.scenes.length + 1;
          return { scenes: [...state.scenes, generateScene(nextIndex)] };
        }),
      duplicateScene: (sceneId) =>
        set((state) => {
          const scene = state.scenes.find((s) => s.id === sceneId);
          if (!scene) return state;
          const clone: Scene = {
            ...scene,
            id: `scene-${Date.now()}`,
            title: `${scene.title} Copy`
          };
          return { scenes: [...state.scenes, clone] };
        }),
      deleteScene: (sceneId) =>
        set((state) => {
          const filtered = state.scenes.filter((scene) => scene.id !== sceneId);
          return {
            scenes: filtered,
            activeSceneId: filtered[0]?.id ?? "",
            selectedElementId: null
          };
        }),
      reorderScenes: (sceneIds) =>
        set((state) => {
          const mapped = sceneIds
            .map((id) => state.scenes.find((scene) => scene.id === id))
            .filter((scene): scene is Scene => Boolean(scene));
          return { scenes: mapped };
        }),
      setSelectedElement: (elementId) => set({ selectedElementId: elementId }),
      updateElement: (sceneId, elementId, patch) =>
        set((state) => {
          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: scene.elements.map((element) =>
                element.id === elementId ? { ...element, ...patch } : element
              )
            };
          });
          return { scenes };
        }),
      addElementToScene: (sceneId, element) =>
        set((state) => {
          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: [...scene.elements, element]
            };
          });
          return { scenes };
        }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setZoom: (zoom) => set({ zoom }),
      togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying }))
    }),
    {
      name: "canvas-editor-store"
    }
  )
);

