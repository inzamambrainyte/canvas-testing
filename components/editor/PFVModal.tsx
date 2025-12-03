"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, Play, Pause } from "lucide-react";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Circle,
  Image as KonvaImage,
  Group,
} from "react-konva";
import type Konva from "konva";
import { useEditorStore } from "@/store/editorStore";
import type { CanvasElement } from "@/lib/types";
import { animateElement } from "@/lib/animations";
import { HighlightedCaption } from "./HighlightedCaption";

const ratioDimensions = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
  "1:1": { width: 720, height: 720 },
} as const;

const useHtmlImage = (src?: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    const handleLoad = () => setImage(img);
    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [src]);

  return image;
};

const CanvasImageNode = ({
  src,
  imageFit = "cover",
  ...rest
}: {
  src?: string;
  imageFit?: "cover" | "contain" | "fill" | "fit-to-screen";
} & any) => {
  const image = useHtmlImage(src);
  if (!image) return null;

  const props = { ...rest };

  if (imageFit === "contain" || imageFit === "fit-to-screen") {
    const imageAspect = image.width / image.height;
    const containerAspect = (rest.width || 1) / (rest.height || 1);

    if (imageAspect > containerAspect) {
      props.height = (rest.width || 1) / imageAspect;
    } else {
      props.width = (rest.height || 1) * imageAspect;
    }
  } else if (imageFit === "fill") {
    props.width = rest.width;
    props.height = rest.height;
  } else {
    props.width = rest.width;
    props.height = rest.height;
  }

  return <KonvaImage {...props} image={image} id={rest.id} />;
};

const CanvasVideoNode = ({
  src,
  isPlaying = true,
  ...rest
}: {
  src?: string;
  isPlaying?: boolean;
} & any) => {
  const [videoImage, setVideoImage] = useState<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!src) {
      setVideoImage(null);
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.src = src;
    videoElement.crossOrigin = "anonymous";
    videoElement.preload = "auto";
    videoElement.muted = false;
    videoElement.loop = true;
    videoElement.playsInline = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvasRef.current = canvas;
    videoRef.current = videoElement;

    const UPDATE_INTERVAL = 200; // Update every 200ms (5fps - much more efficient)

    const updateCanvas = () => {
      if (!ctx || !videoElement) return;
      if (!isPlaying) return; // Don't update if not playing

      const videoWidth = videoElement.videoWidth || rest.width || 640;
      const videoHeight = videoElement.videoHeight || rest.height || 360;
      if (videoWidth === 0 || videoHeight === 0) return;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      try {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const image = new window.Image();
        image.src = canvas.toDataURL();
        image.onload = () => setVideoImage(image);
        setVideoImage(image);
      } catch (error) {
        console.error("Error updating canvas:", error);
      }
    };

    const handleLoadedMetadata = () => updateCanvas();
    const handleLoadedData = () => updateCanvas();
    const handleCanPlay = () => updateCanvas();
    // Remove timeupdate listener - we'll use requestAnimationFrame only
    // This prevents excessive updates

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.load();

    // Use setInterval instead of requestAnimationFrame for better control
    if (isPlaying) {
      const startPlayback = () => {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Initial update
              updateCanvas();

              // Then update at intervals
              updateIntervalRef.current = setInterval(() => {
                if (isPlaying && videoElement.readyState >= 2) {
                  updateCanvas();
                }
              }, UPDATE_INTERVAL);
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              setTimeout(() => {
                videoElement.play().catch(() => {});
              }, 500);
            });
        }
      };

      const readyCheck = () => {
        if (videoElement.readyState >= 2) {
          startPlayback();
          updateCanvas();
        } else {
          setTimeout(readyCheck, 100);
        }
      };

      readyCheck();
    } else {
      videoElement.pause();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.pause();
      videoElement.src = "";
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [src, isPlaying, rest.width, rest.height]);

  if (!videoImage) {
    return (
      <Rect
        {...rest}
        fill="#0f172a"
        cornerRadius={rest.cornerRadius ?? 0}
        opacity={0.7}
        id={rest.id}
      />
    );
  }

  return (
    <KonvaImage
      {...rest}
      image={videoImage}
      cornerRadius={rest.cornerRadius ?? 0}
      opacity={rest.opacity ?? 1}
      id={rest.id}
    />
  );
};

type PFVModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PFVModal = ({ isOpen, onClose }: PFVModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage>(null);
  const animationRefs = useRef<Konva.Animation[]>([]);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);

  const { scenes, aspectRatio } = useEditorStore((state) => ({
    scenes: state.scenes,
    aspectRatio: state.aspectRatio,
  }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [voiceoverCurrentTime, setVoiceoverCurrentTime] = useState(0);
  const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);

  // Calculate total duration and scene start times
  // Use voiceover.duration if available (more accurate), otherwise use scene.duration
  const { totalDuration, sceneStartTimes } = useMemo(() => {
    let total = 0;
    const starts: number[] = [0];
    scenes.forEach((scene) => {
      // Prefer voiceover duration if available (actual audio duration)
      const sceneDuration = scene.voiceover?.duration || scene.duration;
      total += sceneDuration;
      starts.push(total);
    });
    return { totalDuration: total, sceneStartTimes: starts };
  }, [scenes]);

  // Get current scene based on time
  // Use voiceover.duration if available for accurate timing
  const currentScene = useMemo(() => {
    if (scenes.length === 0) return null;
    let sceneIndex = 0;
    let accumulatedTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      // Prefer voiceover duration if available (actual audio duration)
      const sceneDuration = scenes[i].voiceover?.duration || scenes[i].duration;
      if (
        currentTime >= accumulatedTime &&
        currentTime < accumulatedTime + sceneDuration
      ) {
        sceneIndex = i;
        break;
      }
      accumulatedTime += sceneDuration;
    }
    return { scene: scenes[sceneIndex], index: sceneIndex };
  }, [scenes, currentTime]);

  const { width, height } = ratioDimensions[aspectRatio];

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle modal open/close and cleanup
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // Reset to beginning when modal opens
      setCurrentTime(0);
      setCurrentSceneIndex(0);
      setIsPlaying(false);
    } else {
      // Clean up when modal closes
      setIsPlaying(false);
      setCurrentTime(0);
      animationRefs.current.forEach((anim) => anim.stop());
      animationRefs.current = [];
      // Stop and cleanup voiceover audio
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.src = "";
        voiceoverAudioRef.current = null;
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      animationRefs.current.forEach((anim) => anim.stop());
      animationRefs.current = [];
      // Cleanup voiceover audio
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.src = "";
        voiceoverAudioRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  // Playback control
  useEffect(() => {
    if (!isPlaying || scenes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, scenes.length]);

  // Update current scene index when time changes
  useEffect(() => {
    let accumulatedTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (
        currentTime >= accumulatedTime &&
        currentTime < accumulatedTime + scenes[i].duration
      ) {
        if (currentSceneIndex !== i) {
          setCurrentSceneIndex(i);
        }
        break;
      }
      accumulatedTime += scenes[i].duration;
    }
  }, [currentTime, scenes, currentSceneIndex]);

  // Reset element positions when scene changes and play animations
  useEffect(() => {
    if (!currentScene || !stageRef.current) return;

    // Stop previous animations
    animationRefs.current.forEach((anim) => anim.stop());
    animationRefs.current = [];

    const timeoutId = setTimeout(() => {
      const stage = stageRef.current?.getStage();
      if (!stage) {
        console.warn("Stage not found");
        return;
      }

      // Reset all elements and set initial animation states
      currentScene.scene.elements.forEach((element) => {
        const node = stage.findOne(`#${element.id}`) as Konva.Node | undefined;
        if (!node) {
          console.warn(`Node not found for element ${element.id} during reset`);
          return;
        }

        // Reset to original element properties first
        node.x(element.x);
        node.y(element.y);
        node.scaleX(1);
        node.scaleY(1);
        node.rotation(element.rotation ?? 0);
        node.opacity(element.opacity ?? 1);
      });

      // Force a redraw after reset
      stage.getLayers().forEach((layer) => layer.batchDraw());

      // Wait a bit after reset before playing animations
      setTimeout(() => {
        // Play animations for elements that have them
        currentScene.scene.elements.forEach((element) => {
          if (!element.animations || element.animations.length === 0) return;

          const node = stage.findOne(`#${element.id}`) as
            | Konva.Node
            | undefined;
          if (!node) {
            console.warn(
              `Node not found for element ${element.id} during animation`
            );
            return;
          }

          // Play all animations for the scene
          // Each animation starts after its own delay (same pattern as preview page)
          element.animations.forEach((animation) => {
            setTimeout(() => {
              try {
                const anim = animateElement(node, animation);
                animationRefs.current.push(anim);
                console.log(
                  `Playing animation ${animation.type} for element ${element.id}`
                );
              } catch (error) {
                console.error(
                  `Error playing animation for element ${element.id}:`,
                  error
                );
              }
            }, animation.delay * 1000);
          });
        });
      }, 100);
    }, 150); // Initial delay to ensure elements are fully rendered

    return () => {
      clearTimeout(timeoutId);
      animationRefs.current.forEach((anim) => anim.stop());
      animationRefs.current = [];
    };
  }, [currentScene, sceneStartTimes, isPlaying]); // Add isPlaying to trigger when playback starts

  // Handle voiceover audio playback
  useEffect(() => {
    if (!currentScene || !isPlaying) {
      // Stop voiceover when not playing or scene changes
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.currentTime = 0;
      }
      return;
    }

    const scene = currentScene.scene;

    // Find voiceover audio element in the scene
    const voiceoverElement = scene.elements.find(
      (el) => el.type === "audio" && el.label === "Voiceover"
    );

    if (!voiceoverElement || !voiceoverElement.assetUrl) {
      return;
    }

    // Create or update audio element
    if (!voiceoverAudioRef.current) {
      voiceoverAudioRef.current = document.createElement("audio");
      voiceoverAudioRef.current.preload = "auto";
      voiceoverAudioRef.current.crossOrigin = "anonymous";
    }

    // Set source if it changed
    if (voiceoverAudioRef.current.src !== voiceoverElement.assetUrl) {
      voiceoverAudioRef.current.src = voiceoverElement.assetUrl;
    }

    const audio = voiceoverAudioRef.current;

    // Track playback time for caption synchronization
    // Use time relative to the current scene (not total time)
    const handleTimeUpdate = () => {
      const sceneStartTime = sceneStartTimes[currentScene.index] || 0;
      const relativeTime = audio.currentTime;
      setVoiceoverCurrentTime(relativeTime);
    };

    const handlePlay = () => {
      setIsVoiceoverPlaying(true);
    };

    const handlePause = () => {
      setIsVoiceoverPlaying(false);
    };

    const handleEnded = () => {
      setIsVoiceoverPlaying(false);
      setVoiceoverCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Play the voiceover
    const playVoiceover = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
        console.log("✅ Voiceover audio started playing");
      } catch (error) {
        console.error("❌ Error playing voiceover audio:", error);
      }
    };

    playVoiceover();

    // Cleanup on unmount or scene change
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.currentTime = 0;
      }
    };
  }, [currentScene, isPlaying, sceneStartTimes]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    const seekTime = Math.max(0, Math.min(totalDuration, newTime));
    setCurrentTime(seekTime);
    // Pause when seeking to allow animations to restart
    setIsPlaying(false);
    // Restart animations after a brief delay
    setTimeout(() => {
      if (currentScene) {
        // This will trigger the animation useEffect
        setCurrentSceneIndex(currentScene.index);
      }
    }, 100);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    handleSeek(percentage * totalDuration);
  };

  const renderElement = (element: CanvasElement) => {
    const baseProps = {
      id: element.id,
      key: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation ?? 0,
      opacity: element.opacity ?? 1,
    };

    if (element.type === "text") {
      // Check if this is a caption text element
      const isCaptionText = element.label === "Caption Text";
      const captions = currentScene?.scene.captions || [];

      if (isCaptionText && captions.length > 0) {
        // Use HighlightedCaption component for synchronized highlighting
        return (
          <HighlightedCaption
            element={element}
            captions={captions}
            audioCurrentTime={voiceoverCurrentTime}
            isPlaying={isVoiceoverPlaying}
          />
        );
      }

      // Regular text element
      return (
        <KonvaText
          {...baseProps}
          text={element.content ?? ""}
          fontFamily={element.fontFamily ?? "Inter"}
          fontSize={element.fontSize ?? 32}
          fill={element.fill ?? "#0f172a"}
          align={element.textAlign ?? "left"}
          padding={8}
        />
      );
    }

    if (element.type === "shape") {
      if (element.shapeVariant === "circle") {
        return (
          <Circle
            {...baseProps}
            radius={Math.max(element.width, element.height) / 2}
            fill={element.fill ?? "#c7d2fe"}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth ?? 0}
          />
        );
      }
      return (
        <Rect
          {...baseProps}
          fill={element.fill ?? "#c7d2fe"}
          cornerRadius={element.cornerRadius ?? 0}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth ?? 0}
        />
      );
    }

    if (element.type === "image") {
      return (
        <CanvasImageNode
          {...baseProps}
          src={element.assetUrl}
          imageFit={element.imageFit ?? "cover"}
          cornerRadius={element.cornerRadius ?? 0}
        />
      );
    }

    if (element.type === "video") {
      return (
        <CanvasVideoNode
          {...baseProps}
          src={element.assetUrl}
          cornerRadius={element.cornerRadius ?? 0}
          isPlaying={isPlaying}
        />
      );
    }

    if (element.type === "audio") {
      return null;
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onMouseDown={(e) => {
            // Only close if clicking directly on the container (backdrop)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-6xl p-4"
            onMouseDown={(e) => e.stopPropagation()} // Stop propagation on the modal content container
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full rounded-3xl border border-white/60 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.3)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-canvas-border px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-start to-brand-end">
                    <Monitor className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      PFV
                    </h2>
                    <p className="text-sm text-slate-500">Preview Full Video</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Video Preview Area */}
                <div className="relative mb-6 flex items-center justify-center rounded-2xl border border-canvas-border bg-black overflow-hidden">
                  {scenes.length > 0 && currentScene ? (
                    <div className="relative" style={{ width, height }}>
                      <Stage
                        width={width}
                        height={height}
                        ref={stageRef}
                        key={`stage-${currentScene.index}`} // Force re-render on scene change
                      >
                        <Layer>
                          {currentScene.scene.elements.map((element) =>
                            renderElement(element)
                          )}
                        </Layer>
                      </Stage>
                    </div>
                  ) : (
                    <div className="flex h-96 items-center justify-center">
                      <p className="text-sm text-slate-400">
                        No scenes available
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="space-y-4">
                  {/* Play/Pause Button and Time Display */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-brand-start to-brand-end text-white shadow-lg transition hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-400">/</span>
                      <span>{formatTime(totalDuration)}</span>
                    </div>
                  </div>

                  {/* Timeline Slider */}
                  <div className="relative">
                    <div
                      className="relative h-2 w-full cursor-pointer rounded-full bg-slate-200"
                      onClick={handleTimelineClick}
                      onMouseMove={(e) => {
                        if (e.buttons === 1) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percentage = Math.max(
                            0,
                            Math.min(1, x / rect.width)
                          );
                          handleSeek(percentage * totalDuration);
                        }
                      }}
                      onMouseDown={(e) => {
                        setIsDragging(true);
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = Math.max(
                          0,
                          Math.min(1, x / rect.width)
                        );
                        handleSeek(percentage * totalDuration);
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                    >
                      {/* Progress Bar */}
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-start to-brand-end transition-all"
                        style={{
                          width: `${(currentTime / totalDuration) * 100}%`,
                        }}
                      />

                      {/* Scene Markers */}
                      {scenes.map((scene, index) => {
                        const sceneStart = sceneStartTimes[index];
                        const sceneEnd = sceneStartTimes[index + 1];
                        const startPercent = (sceneStart / totalDuration) * 100;
                        const widthPercent =
                          ((sceneEnd - sceneStart) / totalDuration) * 100;

                        return (
                          <div
                            key={scene.id}
                            className="absolute top-0 h-full border-l border-r border-white/30"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            title={scene.title}
                          />
                        );
                      })}

                      {/* Current Time Indicator */}
                      <div
                        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-lg border-2 border-brand-start transition-all"
                        style={{
                          left: `calc(${
                            (currentTime / totalDuration) * 100
                          }% - 8px)`,
                        }}
                      />
                    </div>

                    {/* Scene Labels */}
                    {scenes.length > 0 && (
                      <div className="mt-3 relative h-6">
                        {scenes.map((scene, index) => {
                          const sceneStart = sceneStartTimes[index];
                          const startPercent =
                            (sceneStart / totalDuration) * 100;
                          return (
                            <div
                              key={scene.id}
                              className="absolute"
                              style={{
                                left: `${startPercent}%`,
                                transform: "translateX(-50%)",
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <div className="h-1.5 w-0.5 bg-slate-400 mb-1" />
                                <span className="text-[10px] text-slate-500 whitespace-nowrap font-medium">
                                  {scene.title}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PFVModal;
