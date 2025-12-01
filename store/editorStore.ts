import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockScenes } from "@/lib/mockData";
import type {
  AspectRatio,
  CanvasElement,
  Scene,
  Animation,
  Voiceover,
  Caption,
} from "@/lib/types";
import { apiClient } from "@/lib/api/client";

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
  createNewProject: (
    scenes: Omit<Scene, "id" | "elements">[],
    aspectRatio?: AspectRatio,
    ttsProvider?: "openai" | "elevenlabs"
  ) => Promise<void>;
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
      createNewProject: async (
        newScenes,
        aspectRatio = "16:9",
        ttsProvider = "openai"
      ) => {
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

        // Then, asynchronously fetch and add media, voiceover, and captions for each scene
        const state = get();
        for (let i = 0; i < scenesToCreate.length; i++) {
          const scene = scenesToCreate[i];
          const sceneElements: CanvasElement[] = [];
          let sceneVoiceover: Voiceover | undefined;
          const sceneCaptions: Caption[] = [];

          // 1. Fetch multiple images and videos based on keywords
          if (scene.keywords) {
            try {
              const keywords = scene.keywords
                .split(",")
                .map((k) => k.trim())
                .join(" ");

              // Fetch multiple images (3-5 images)
              const imagesResponse = (await apiClient.getImages(
                keywords,
                1,
                5
              )) as any;
              const photos = imagesResponse.photos || [];

              // Fetch videos (1-2 videos for short clips/animations)
              const videosResponse = (await apiClient.getVideos(
                keywords,
                1,
                2
              )) as any;
              const videos = videosResponse.videos || [];

              // Add background image (full screen, first image)
              if (photos.length > 0) {
                const bgPhoto = photos[0];
                const bgImageUrl = bgPhoto.src.large2x || bgPhoto.src.large;
                const bgElementId = `element-${timestamp}-${i}-bg`;

                const backgroundElement: CanvasElement = {
                  id: bgElementId,
                  type: "image",
                  label: "Background",
                  x: 0,
                  y: 0,
                  width: canvasDims.width,
                  height: canvasDims.height,
                  assetUrl: bgImageUrl,
                  imageFit: "cover",
                  locked: false,
                  opacity: 1,
                  animations: generateBackgroundAnimations(bgElementId),
                };

                sceneElements.push(backgroundElement);
              }

              // Add additional images (2-4 more images, positioned as overlays)
              const additionalImages = photos.slice(1, 5); // Get 2-4 more images
              additionalImages.forEach((photo: any, imgIndex: number) => {
                const imageUrl = photo.src.large2x || photo.src.large;
                const elementId = `element-${timestamp}-${i}-img-${imgIndex}`;

                // Position images in different areas of the canvas
                const positions = [
                  { x: canvasDims.width * 0.1, y: canvasDims.height * 0.1 }, // Top-left
                  { x: canvasDims.width * 0.6, y: canvasDims.height * 0.15 }, // Top-right
                  { x: canvasDims.width * 0.05, y: canvasDims.height * 0.5 }, // Middle-left
                  { x: canvasDims.width * 0.55, y: canvasDims.height * 0.55 }, // Middle-right
                ];

                const position = positions[imgIndex] || { x: 100, y: 100 };
                const imageSize = Math.min(
                  canvasDims.width * 0.3,
                  canvasDims.height * 0.3
                );

                const imageElement: CanvasElement = {
                  id: elementId,
                  type: "image",
                  label: `Image ${imgIndex + 2}`,
                  x: position.x,
                  y: position.y,
                  width: imageSize,
                  height: imageSize,
                  assetUrl: imageUrl,
                  imageFit: "cover",
                  locked: false,
                  opacity: 0.9,
                  cornerRadius: 12,
                  animations: generateBackgroundAnimations(elementId),
                };

                sceneElements.push(imageElement);
              });

              // Add video clips (short clips/animations)
              videos.forEach((video: any, vidIndex: number) => {
                // Get the best quality video file
                const videoFile =
                  video.video_files?.find(
                    (f: any) => f.quality === "hd" || f.quality === "sd"
                  ) || video.video_files?.[0];

                if (videoFile) {
                  const elementId = `element-${timestamp}-${i}-vid-${vidIndex}`;

                  // Position videos strategically
                  const videoPositions = [
                    {
                      x: canvasDims.width * 0.5,
                      y: canvasDims.height * 0.3,
                      width: canvasDims.width * 0.4,
                      height: canvasDims.height * 0.4,
                    },
                    {
                      x: canvasDims.width * 0.1,
                      y: canvasDims.height * 0.6,
                      width: canvasDims.width * 0.35,
                      height: canvasDims.height * 0.35,
                    },
                  ];

                  const videoPos = videoPositions[vidIndex] || {
                    x: canvasDims.width * 0.3,
                    y: canvasDims.height * 0.3,
                    width: canvasDims.width * 0.4,
                    height: canvasDims.height * 0.4,
                  };

                  const videoElement: CanvasElement = {
                    id: elementId,
                    type: "video",
                    label: `Video Clip ${vidIndex + 1}`,
                    x: videoPos.x,
                    y: videoPos.y,
                    width: videoPos.width,
                    height: videoPos.height,
                    assetUrl: videoFile.link,
                    locked: false,
                    opacity: 1,
                    cornerRadius: 16,
                    animations: generateBackgroundAnimations(elementId),
                  };

                  sceneElements.push(videoElement);
                }
              });
            } catch (error) {
              console.error(
                `Error fetching media for scene ${scene.id}:`,
                error
              );
            }
          }

          // 2. Generate voiceover using TTS (OpenAI or ElevenLabs)
          if (scene.script) {
            try {
              // Use backend API client for TTS
              const ttsResult = (await apiClient.generateTTS({
                text: scene.script,
                provider: ttsProvider,
                ...(ttsProvider === "elevenlabs"
                  ? {
                      voice_id: "21m00Tcm4TlvDq8ikWAM",
                      model_id: "eleven_monolingual_v1",
                    }
                  : {
                      voice: "alloy",
                      model: "tts-1",
                    }),
              })) as any;

              if (ttsResult.success && ttsResult.audioUrl) {
                // Store voiceover data
                sceneVoiceover = {
                  audioUrl: ttsResult.audioUrl,
                  duration: ttsResult.duration,
                  voice: ttsResult.voice || ttsResult.voice_id || "alloy",
                  model: ttsResult.model || ttsResult.model_id || "tts-1",
                  provider: ttsProvider,
                };

                // Create audio element for voiceover (hidden, plays automatically)
                const voiceoverElement: CanvasElement = {
                  id: `element-${timestamp}-${i}-voiceover`,
                  type: "audio",
                  label: "Voiceover",
                  x: 0,
                  y: canvasDims.height - 60, // Position at bottom
                  width: canvasDims.width,
                  height: 60,
                  assetUrl: ttsResult.audioUrl,
                  locked: true, // Lock voiceover by default
                  opacity: 0, // Make it invisible on canvas
                };
                sceneElements.push(voiceoverElement);

                // Create caption background
                const captionBgElement: CanvasElement = {
                  id: `element-${timestamp}-${i}-caption-bg`,
                  type: "shape",
                  label: "Caption Background",
                  x: 0,
                  y: canvasDims.height - 100, // Position above voiceover
                  width: canvasDims.width,
                  height: 40,
                  fill: "#000000",
                  opacity: 0.7,
                  locked: true,
                  cornerRadius: 0,
                };
                sceneElements.push(captionBgElement);

                // Create caption text element
                const captionTextElement: CanvasElement = {
                  id: `element-${timestamp}-${i}-caption-text`,
                  type: "text",
                  label: "Caption Text",
                  x: 0,
                  y: canvasDims.height - 95, // Centered vertically in caption background
                  width: canvasDims.width,
                  height: 30,
                  content: scene.script,
                  fontFamily: "Inter",
                  fontSize: 28,
                  fill: "#FFFFFF",
                  textAlign: "center",
                  locked: true,
                };
                sceneElements.push(captionTextElement);

                // For now, a single caption for the whole script duration
                sceneCaptions.push({
                  id: `caption-${timestamp}-${i}-0`,
                  text: scene.script,
                  startTime: 0,
                  endTime: ttsResult.duration,
                });
              } else {
                console.error(
                  `Failed to generate voiceover for scene ${scene.id}:`,
                  "TTS result missing audioUrl"
                );
              }
            } catch (error) {
              console.error(
                `Error generating voiceover for scene ${scene.id}:`,
                error
              );
              // Still add other elements even if voiceover fails
              if (sceneElements.length > 0) {
                const currentState = get();
                const updatedScenes = currentState.scenes.map((s) =>
                  s.id === scene.id
                    ? { ...s, elements: [...s.elements, ...sceneElements] }
                    : s
                );
                set({ scenes: updatedScenes });
              }
            }
          } else {
            // No script, just add image elements
            if (sceneElements.length > 0) {
              const currentState = get();
              const updatedScenes = currentState.scenes.map((s) =>
                s.id === scene.id
                  ? { ...s, elements: [...s.elements, ...sceneElements] }
                  : s
              );
              set({ scenes: updatedScenes });
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
