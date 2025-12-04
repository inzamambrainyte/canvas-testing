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
import { getAudioDuration, calculateDurationFromText } from "@/lib/utils/audio";
import { convertToJson2VideoFormat } from "@/lib/utils/json2videoConverter";

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
  regenerateVoiceover: (
    sceneId: string,
    ttsProvider?: "openai" | "elevenlabs"
  ) => Promise<void>;
  exportProject: () => {
    project: {
      version: string;
      aspectRatio: AspectRatio;
      scenes: Scene[];
      exportedAt: string;
    };
    download: () => void;
  };
  exportProjectAsJson2Video: () => {
    project: any;
    download: () => void;
  };
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

              // Debug: Check response structure
              console.log(
                `[Scene ${i}] Images API response keys:`,
                Object.keys(imagesResponse || {})
              );
              console.log(
                `[Scene ${i}] Images response has photos?:`,
                "photos" in (imagesResponse || {})
              );

              // Backend returns { success: true, data: { photos: [...] } }
              // API client extracts data, so we get { photos: [...] }
              const photos =
                imagesResponse?.photos || imagesResponse?.data?.photos || [];

              console.log(
                `[Scene ${i}] ✅ Fetched ${photos.length} images for keywords: ${keywords}`
              );
              if (photos.length === 0) {
                console.error(
                  `[Scene ${i}] ❌ No images found! Response structure:`,
                  imagesResponse
                );
              } else {
                console.log(
                  `[Scene ${i}] First image URL:`,
                  photos[0]?.src?.large2x || photos[0]?.src?.large
                );
              }

              // Fetch videos (1-2 videos for short clips/animations)
              const videosResponse = (await apiClient.getVideos(
                keywords,
                1,
                2
              )) as any;

              // Debug: Check response structure
              console.log(
                `[Scene ${i}] Videos API response keys:`,
                Object.keys(videosResponse || {})
              );
              console.log(
                `[Scene ${i}] Videos response has videos?:`,
                "videos" in (videosResponse || {})
              );

              // Backend returns { success: true, data: { videos: [...] } }
              // API client extracts data, so we get { videos: [...] }
              const videos =
                videosResponse?.videos || videosResponse?.data?.videos || [];

              console.log(
                `[Scene ${i}] ✅ Fetched ${videos.length} videos for keywords: ${keywords}`
              );
              if (videos.length === 0) {
                console.error(
                  `[Scene ${i}] ❌ No videos found! Response structure:`,
                  videosResponse
                );
              }
              if (videos.length === 0) {
                console.warn(
                  `[Scene ${i}] No videos found. Response:`,
                  videosResponse
                );
              }

              console.log(
                `[Scene ${i}] Total elements before adding media: ${sceneElements.length}`
              );

              // Add background image (full screen, first image)
              if (photos.length > 0) {
                const bgPhoto = photos[0];
                const bgImageUrl =
                  bgPhoto?.src?.large2x ||
                  bgPhoto?.src?.large ||
                  bgPhoto?.src?.original;

                if (!bgImageUrl) {
                  console.error(
                    `[Scene ${i}] ❌ Background photo missing src:`,
                    bgPhoto
                  );
                } else {
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
                  console.log(`[Scene ${i}] ✅ Added background image element`);
                }
              } else {
                console.warn(
                  `[Scene ${i}] ⚠️ No photos available to add as background`
                );
              }

              // Add additional images (2-4 more images, positioned as overlays)
              const additionalImages = photos.slice(1, 5); // Get 2-4 more images
              additionalImages.forEach((photo: any, imgIndex: number) => {
                const imageUrl =
                  photo?.src?.large2x ||
                  photo?.src?.large ||
                  photo?.src?.original;

                if (!imageUrl) {
                  console.error(
                    `[Scene ${i}] ❌ Additional image ${imgIndex} missing src:`,
                    photo
                  );
                  return;
                }

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
                console.log(
                  `[Scene ${i}] ✅ Added overlay image ${imgIndex + 2}`
                );
              });

              // Add video clips (short clips/animations)
              videos.forEach((video: any, vidIndex: number) => {
                // Get the best quality video file
                const videoFile =
                  video?.video_files?.find(
                    (f: any) => f.quality === "hd" || f.quality === "sd"
                  ) || video?.video_files?.[0];

                if (!videoFile) {
                  console.error(
                    `[Scene ${i}] ❌ Video ${vidIndex} missing video_files:`,
                    video
                  );
                  return;
                }

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
                  console.log(
                    `[Scene ${i}] ✅ Added video clip ${vidIndex + 1}`
                  );
                }
              });

              console.log(
                `[Scene ${i}] Total elements after adding media: ${sceneElements.length}`
              );
            } catch (error) {
              console.error(
                `Error fetching media for scene ${scene.id}:`,
                error
              );
              // Even if media fetch fails, continue to add voiceover if available
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
                // Get actual audio duration (more accurate than estimate)
                let actualDuration = ttsResult.duration;
                try {
                  actualDuration = await getAudioDuration(ttsResult.audioUrl);
                  console.log(
                    `[Scene ${i}] Actual audio duration: ${actualDuration.toFixed(
                      2
                    )}s`
                  );
                } catch (error) {
                  console.warn(
                    `[Scene ${i}] Failed to get actual audio duration, using estimate:`,
                    error
                  );
                  // Fallback to calculated duration from text
                  actualDuration = calculateDurationFromText(
                    scene.script,
                    ttsProvider
                  );
                }

                // Store voiceover data with actual duration
                sceneVoiceover = {
                  audioUrl: ttsResult.audioUrl,
                  duration: actualDuration,
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
                  locked: false, // Allow transformation and positioning
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
                  locked: false, // Allow transformation and positioning
                };
                sceneElements.push(captionTextElement);

                // For now, a single caption for the whole script duration
                // Use actual duration for accurate timing
                sceneCaptions.push({
                  id: `caption-${timestamp}-${i}-0`,
                  text: scene.script,
                  startTime: 0,
                  endTime: actualDuration,
                });

                // Update scene duration to match actual voiceover duration
                // This ensures scene duration matches the actual audio playback time
                scene.duration = Math.max(3, Math.ceil(actualDuration));
                console.log(
                  `[Scene ${i}] Updated scene duration to ${scene.duration}s (matching voiceover)`
                );
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
            }
          }

          // Update the scene with all generated elements, voiceover, and captions
          // This runs regardless of whether voiceover succeeded or failed
          if (
            sceneElements.length > 0 ||
            sceneVoiceover ||
            sceneCaptions.length > 0
          ) {
            set((state) => ({
              scenes: state.scenes.map((s) =>
                s.id === scene.id
                  ? {
                      ...s,
                      elements: [...s.elements, ...sceneElements],
                      voiceover: sceneVoiceover,
                      captions: sceneCaptions,
                      // Update duration if voiceover was generated (scene.duration was updated above)
                      duration: sceneVoiceover ? scene.duration : s.duration,
                    }
                  : s
              ),
            }));
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
      regenerateVoiceover: async (sceneId, ttsProvider = "openai") => {
        const state = get();
        const scene = state.scenes.find((s) => s.id === sceneId);

        if (!scene) {
          throw new Error(`Scene ${sceneId} not found`);
        }

        if (!scene.script || scene.script.trim().length === 0) {
          throw new Error("Scene has no script to generate voiceover");
        }

        try {
          console.log(`Regenerating voiceover for scene ${sceneId}...`);

          // 1. Generate new voiceover using backend API
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

          if (!ttsResult.success || !ttsResult.audioUrl) {
            throw new Error(
              "Failed to generate voiceover: No audio URL returned"
            );
          }

          // 2. Get actual audio duration
          let actualDuration = ttsResult.duration;
          try {
            actualDuration = await getAudioDuration(ttsResult.audioUrl);
            console.log(`Actual audio duration: ${actualDuration.toFixed(2)}s`);
          } catch (error) {
            console.warn(
              "Failed to get actual audio duration, using estimate:",
              error
            );
            // Fallback to calculated duration from text
            actualDuration = calculateDurationFromText(
              scene.script,
              ttsProvider
            );
          }

          // 3. Update scene with new voiceover
          set((state) => {
            const updatedScenes = state.scenes.map((s) => {
              if (s.id !== sceneId) return s;

              // Find and update voiceover audio element
              const updatedElements = s.elements.map((el) =>
                el.type === "audio" && el.label === "Voiceover"
                  ? { ...el, assetUrl: ttsResult.audioUrl }
                  : el
              );

              // Update caption text element if it exists
              const elementsWithUpdatedCaption = updatedElements.map((el) =>
                el.type === "text" && el.label === "Caption Text"
                  ? { ...el, content: scene.script }
                  : el
              );

              // Update voiceover and captions
              const updatedVoiceover: Voiceover = {
                audioUrl: ttsResult.audioUrl,
                duration: actualDuration,
                voice: ttsResult.voice || ttsResult.voice_id || "alloy",
                model: ttsResult.model || ttsResult.model_id || "tts-1",
                provider: ttsProvider,
              };

              const updatedCaptions: Caption[] = [
                {
                  id: `caption-${sceneId}-0`,
                  text: scene.script,
                  startTime: 0,
                  endTime: actualDuration,
                },
              ];

              return {
                ...s,
                voiceover: updatedVoiceover,
                captions: updatedCaptions,
                duration: Math.max(3, Math.ceil(actualDuration)), // Update scene duration
                elements: elementsWithUpdatedCaption,
              };
            });

            return { scenes: updatedScenes };
          });

          console.log(
            `✅ Successfully regenerated voiceover for scene ${sceneId}`
          );
        } catch (error) {
          console.error(
            `❌ Error regenerating voiceover for scene ${sceneId}:`,
            error
          );
          throw error;
        }
      },
      exportProject: () => {
        const state = get();
        const projectData = {
          version: "1.0.0",
          aspectRatio: state.aspectRatio,
          scenes: state.scenes,
          exportedAt: new Date().toISOString(),
        };

        return {
          project: projectData,
          download: () => {
            const jsonString = JSON.stringify(projectData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `project-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
        };
      },
      exportProjectAsJson2Video: () => {
        const state = get();
        
        // Collect all voiceovers from scenes
        const voiceovers = state.scenes
          .map((scene) => scene.voiceover)
          .filter((vo): vo is Voiceover => vo !== undefined);

        // Convert to json2video format
        const json2videoProject = convertToJson2VideoFormat(
          state.scenes,
          state.aspectRatio,
          voiceovers
        );

        return {
          project: json2videoProject,
          download: () => {
            const jsonString = JSON.stringify(json2videoProject, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `project-json2video-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
        };
      },
    }),
    {
      name: "canvas-editor-store",
      // Exclude large data from persistence to avoid localStorage quota errors
      partialize: (state) => {
        // Remove large base64 data URLs from elements before persisting
        const sanitizedScenes = state.scenes.map((scene) => ({
          ...scene,
          // Remove voiceover audioUrl (base64 data can be very large)
          voiceover: scene.voiceover
            ? {
                ...scene.voiceover,
                audioUrl: "", // Don't persist base64 audio data
              }
            : undefined,
          // Remove large asset URLs from elements (keep only metadata)
          elements: scene.elements.map((element) => {
            // If assetUrl is a base64 data URL, don't persist it
            if (element.assetUrl && element.assetUrl.startsWith("data:")) {
              return {
                ...element,
                assetUrl: "", // Don't persist base64 data
              };
            }
            return element;
          }),
        }));

        return {
          ...state,
          scenes: sanitizedScenes,
          // Don't persist history (can be large)
          history: {},
        };
      },
      // Note: Large base64 data (audio/video URLs) is excluded from persistence
      // to avoid localStorage quota errors. Users will need to regenerate
      // voiceovers after page refresh, but all other data (scenes, elements, etc.)
      // will be preserved.
    }
  )
);
