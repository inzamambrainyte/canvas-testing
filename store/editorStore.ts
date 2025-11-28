import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockScenes } from "@/lib/mockData";
import type { AspectRatio, CanvasElement, Scene, Animation } from "@/lib/types";

type HistoryState = {
  undo: CanvasElement[][];
  redo: CanvasElement[][];
};

type EditorStore = {
  scenes: Scene[];
  activeSceneId: string;
  selectedElementId: string | null;
  aspectRatio: AspectRatio;
  zoom: number;
  isPlaying: boolean;
  history: Record<string, HistoryState>;
  setActiveScene: (sceneId: string) => void;
  addScene: () => void;
  addScenes: (scenes: Omit<Scene, "id" | "elements">[]) => void;
  createNewProject: (scenes: Omit<Scene, "id" | "elements">[], aspectRatio?: AspectRatio) => Promise<void>;
  duplicateScene: (sceneId: string) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (sceneIds: string[]) => void;
  updateSceneScript: (sceneId: string, script: string) => void;
  setSelectedElement: (elementId: string | null) => void;
  updateElement: (
    sceneId: string,
    elementId: string,
    patch: Partial<CanvasElement>
  ) => void;
  addElementToScene: (sceneId: string, element: CanvasElement) => void;
  removeElementFromScene: (sceneId: string, elementId: string) => void;
  toggleElementLock: (sceneId: string, elementId: string) => void;
  moveElementBackward: (sceneId: string, elementId: string) => void;
  moveElementForward: (sceneId: string, elementId: string) => void;
  moveElementToBack: (sceneId: string, elementId: string) => void;
  moveElementToFront: (sceneId: string, elementId: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setZoom: (zoom: number) => void;
  togglePlayback: () => void;
  undo: (sceneId: string) => void;
  redo: (sceneId: string) => void;
  canUndo: (sceneId: string) => boolean;
  canRedo: (sceneId: string) => boolean;
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
  elements: [],
});

// Helper function to save state to history
const saveToHistory = (
  state: EditorStore,
  sceneId: string,
  elements: CanvasElement[]
) => {
  const history = state.history[sceneId] || { undo: [], redo: [] };
  const newHistory = {
    ...state.history,
    [sceneId]: {
      undo: [...history.undo, JSON.parse(JSON.stringify(elements))].slice(-50), // Keep last 50 states
      redo: [], // Clear redo stack when new action is performed
    },
  };
  return newHistory;
};

// Helper function to get current elements for a scene
const getCurrentElements = (
  state: EditorStore,
  sceneId: string
): CanvasElement[] => {
  const scene = state.scenes.find((s) => s.id === sceneId);
  return scene?.elements ?? [];
};

// Helper function to generate animations for background images
// Returns a random selection of professional animations
const generateBackgroundAnimations = (elementId: string): Animation[] => {
  const baseId = elementId.replace("element-", "anim-");
  let animCounter = 0;
  
  const createAnimId = () => `${baseId}-${animCounter++}`;

  // Animation presets - using system's built-in animation logic
  const animationPresets: Omit<Animation, "id">[] = [
    // Fade In - Classic and smooth (0.8s)
    {
      type: "fade",
      duration: 0.8,
      delay: 0,
      easing: "ease-out",
      direction: "in",
    },
    // Zoom In - Ken Burns effect (1.2s)
    {
      type: "zoom",
      duration: 1.2,
      delay: 0,
      easing: "ease-out",
      direction: "in",
    },
    // Slide In - Smooth entrance (1.0s)
    {
      type: "slide",
      duration: 1.0,
      delay: 0,
      easing: "ease-out",
      direction: "in",
    },
    // Zoom In - Faster version (0.9s)
    {
      type: "zoom",
      duration: 0.9,
      delay: 0,
      easing: "ease-in-out",
      direction: "in",
    },
    // Fade In - Slower, more dramatic (1.5s)
    {
      type: "fade",
      duration: 1.5,
      delay: 0,
      easing: "ease-out",
      direction: "in",
    },
  ];

  // Randomly select 1 animation (70% chance) or 2 animations (30% chance) for variety
  const selectedCount = Math.random() < 0.3 ? 2 : 1;
  const shuffled = [...animationPresets].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, selectedCount);

  // Add IDs and adjust delays if multiple animations
  return selected.map((preset, index) => ({
    ...preset,
    id: createAnimId(),
    delay: index === 0 ? 0 : 0.3, // Second animation starts slightly after first
  }));
};

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
      setActiveScene: (sceneId) =>
        set({ activeSceneId: sceneId, selectedElementId: null }),
      addScene: () =>
        set((state) => {
          const nextIndex = state.scenes.length + 1;
          return { scenes: [...state.scenes, generateScene(nextIndex)] };
        }),
      addScenes: (newScenes) =>
        set((state) => {
          const scenesToAdd: Scene[] = newScenes.map((sceneData, index) => ({
            ...sceneData,
            id: `scene-${Date.now()}-${index}`,
            elements: [],
            fonts: [],
            media: [],
            thumbnail:
              "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
          }));
          const updatedScenes = [...state.scenes, ...scenesToAdd];
          return {
            scenes: updatedScenes,
            activeSceneId: scenesToAdd[0]?.id ?? state.activeSceneId,
          };
        }),
      createNewProject: async (newScenes, aspectRatio = "16:9") => {
        const timestamp = Date.now();
        const canvasDims = {
          "16:9": { width: 960, height: 540 },
          "9:16": { width: 540, height: 960 },
          "1:1": { width: 720, height: 720 },
        }[aspectRatio];

        // Create scenes with initial empty elements
        const scenesToCreate: Scene[] = newScenes.map((sceneData, index) => ({
          ...sceneData,
          id: `scene-${timestamp}-${index}`,
          elements: [],
          fonts: [],
          media: [],
          thumbnail:
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
        }));

        // Set scenes first (synchronously)
        set({
          scenes: scenesToCreate,
          activeSceneId: scenesToCreate[0]?.id ?? "",
          selectedElementId: null,
          history: {},
          aspectRatio,
        });

        // Then, asynchronously fetch and add media for each scene
        const state = get();
        for (let i = 0; i < scenesToCreate.length; i++) {
          const scene = scenesToCreate[i];
          if (scene.keywords) {
            try {
              // Search Pexels for images using keywords
              const keywords = scene.keywords.split(",").map((k) => k.trim()).join(" ");
              const response = await fetch(
                `/api/pexels?query=${encodeURIComponent(keywords)}&page=1&per_page=1&type=images`
              );

              if (response.ok) {
                const data = await response.json();
                const photos = data.photos || [];
                
                if (photos.length > 0) {
                  const photo = photos[0];
                  const imageUrl = photo.src.large2x || photo.src.large;

                  // Create element ID first
                  const elementId = `element-${timestamp}-${i}-bg`;
                  
                  // Generate animations for the background image
                  const animations = generateBackgroundAnimations(elementId);

                  // Create a background image element with animations
                  const backgroundElement: CanvasElement = {
                    id: elementId,
                    type: "image",
                    label: "Background",
                    x: 0,
                    y: 0,
                    width: canvasDims.width,
                    height: canvasDims.height,
                    assetUrl: imageUrl,
                    imageFit: "cover",
                    locked: false,
                    animations: animations, // Add automatically generated animations
                  };

                  // Add element to the scene using the store's update mechanism
                  const currentState = get();
                  const updatedScenes = currentState.scenes.map((s) =>
                    s.id === scene.id
                      ? { ...s, elements: [...s.elements, backgroundElement] }
                      : s
                  );
                  set({ scenes: updatedScenes });
                }
              }
            } catch (error) {
              console.error(`Error fetching media for scene ${scene.id}:`, error);
              // Continue with other scenes even if one fails
            }
          }
        }
      },
      duplicateScene: (sceneId) =>
        set((state) => {
          const scene = state.scenes.find((s) => s.id === sceneId);
          if (!scene) return state;
          const clone: Scene = {
            ...scene,
            id: `scene-${Date.now()}`,
            title: `${scene.title} Copy`,
          };
          return { scenes: [...state.scenes, clone] };
        }),
      deleteScene: (sceneId) =>
        set((state) => {
          const filtered = state.scenes.filter((scene) => scene.id !== sceneId);
          return {
            scenes: filtered,
            activeSceneId: filtered[0]?.id ?? "",
            selectedElementId: null,
          };
        }),
      reorderScenes: (sceneIds) =>
        set((state) => {
          const mapped = sceneIds
            .map((id) => state.scenes.find((scene) => scene.id === id))
            .filter((scene): scene is Scene => Boolean(scene));
          return { scenes: mapped };
        }),
      updateSceneScript: (sceneId, script) =>
        set((state) => {
          const scenes = state.scenes.map((scene) =>
            scene.id === sceneId ? { ...scene, script } : scene
          );
          return { scenes };
        }),
      setSelectedElement: (elementId) => set({ selectedElementId: elementId }),
      updateElement: (sceneId, elementId, patch) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: scene.elements.map((element) =>
                element.id === elementId ? { ...element, ...patch } : element
              ),
            };
          });
          return { scenes, history };
        }),
      addElementToScene: (sceneId, element) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: [...scene.elements, element],
            };
          });
          return { scenes, history };
        }),
      removeElementFromScene: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            const filteredElements = scene.elements.filter(
              (element) => element.id !== elementId
            );
            return {
              ...scene,
              elements: filteredElements,
            };
          });
          const shouldClearSelection = state.selectedElementId === elementId;
          return {
            scenes,
            history,
            selectedElementId: shouldClearSelection
              ? null
              : state.selectedElementId,
          };
        }),
      toggleElementLock: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: scene.elements.map((element) =>
                element.id === elementId
                  ? { ...element, locked: !element.locked }
                  : element
              ),
            };
          });
          return { scenes, history };
        }),
      moveElementBackward: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            const index = scene.elements.findIndex((el) => el.id === elementId);
            if (index <= 0) return scene;
            const newElements = [...scene.elements];
            [newElements[index - 1], newElements[index]] = [
              newElements[index],
              newElements[index - 1],
            ];
            return { ...scene, elements: newElements };
          });
          return { scenes, history };
        }),
      moveElementForward: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            const index = scene.elements.findIndex((el) => el.id === elementId);
            if (index < 0 || index >= scene.elements.length - 1) return scene;
            const newElements = [...scene.elements];
            [newElements[index], newElements[index + 1]] = [
              newElements[index + 1],
              newElements[index],
            ];
            return { ...scene, elements: newElements };
          });
          return { scenes, history };
        }),
      moveElementToBack: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            const index = scene.elements.findIndex((el) => el.id === elementId);
            if (index <= 0) return scene;
            const newElements = [...scene.elements];
            const [element] = newElements.splice(index, 1);
            newElements.unshift(element);
            return { ...scene, elements: newElements };
          });
          return { scenes, history };
        }),
      moveElementToFront: (sceneId, elementId) =>
        set((state) => {
          const currentElements = getCurrentElements(state, sceneId);
          const history = saveToHistory(state, sceneId, currentElements);

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            const index = scene.elements.findIndex((el) => el.id === elementId);
            if (index < 0 || index >= scene.elements.length - 1) return scene;
            const newElements = [...scene.elements];
            const [element] = newElements.splice(index, 1);
            newElements.push(element);
            return { ...scene, elements: newElements };
          });
          return { scenes, history };
        }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setZoom: (zoom) => set({ zoom }),
      togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
      undo: (sceneId) =>
        set((state) => {
          const history = state.history[sceneId];
          if (!history || history.undo.length === 0) return state;

          const currentElements = getCurrentElements(state, sceneId);
          const previousState = history.undo[history.undo.length - 1];
          const newUndoStack = history.undo.slice(0, -1);
          const newRedoStack = [
            ...history.redo,
            JSON.parse(JSON.stringify(currentElements)),
          ];

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: JSON.parse(JSON.stringify(previousState)),
            };
          });

          return {
            scenes,
            history: {
              ...state.history,
              [sceneId]: {
                undo: newUndoStack,
                redo: newRedoStack,
              },
            },
          };
        }),
      redo: (sceneId) =>
        set((state) => {
          const history = state.history[sceneId];
          if (!history || history.redo.length === 0) return state;

          const currentElements = getCurrentElements(state, sceneId);
          const nextState = history.redo[history.redo.length - 1];
          const newRedoStack = history.redo.slice(0, -1);
          const newUndoStack = [
            ...history.undo,
            JSON.parse(JSON.stringify(currentElements)),
          ];

          const scenes = state.scenes.map((scene) => {
            if (scene.id !== sceneId) return scene;
            return {
              ...scene,
              elements: JSON.parse(JSON.stringify(nextState)),
            };
          });

          return {
            scenes,
            history: {
              ...state.history,
              [sceneId]: {
                undo: newUndoStack,
                redo: newRedoStack,
              },
            },
          };
        }),
      canUndo: (sceneId) => {
        const state = get();
        const history = state.history[sceneId];
        return history ? history.undo.length > 0 : false;
      },
      canRedo: (sceneId) => {
        const state = get();
        const history = state.history[sceneId];
        return history ? history.redo.length > 0 : false;
      },
    }),
    {
      name: "canvas-editor-store",
    }
  )
);
