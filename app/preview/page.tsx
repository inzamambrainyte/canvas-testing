"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { HighlightedCaption } from "@/components/editor/HighlightedCaption";

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

  // Ensure id is passed through
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

      // Try to get video dimensions, fallback to element dimensions
      const videoWidth = videoElement.videoWidth || rest.width || 640;
      const videoHeight = videoElement.videoHeight || rest.height || 360;

      if (videoWidth === 0 || videoHeight === 0) {
        // Video dimensions not ready yet
        return;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      try {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const image = new window.Image();
        image.src = canvas.toDataURL();
        image.onload = () => {
          setVideoImage(image);
        };
        // Set immediately as fallback
        setVideoImage(image);
      } catch (error) {
        console.error("Error updating canvas:", error);
      }
    };

    const handleLoadedMetadata = () => {
      updateCanvas();
    };

    const handleLoadedData = () => {
      updateCanvas();
    };

    const handleCanPlay = () => {
      updateCanvas();
    };

    // Remove timeupdate listener - we'll use requestAnimationFrame only
    // This prevents excessive updates

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplay", handleCanPlay);

    // Try to load the video
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
              // Try again after a delay
              setTimeout(() => {
                videoElement.play().catch(() => {});
              }, 500);
            });
        }
      };

      // Wait for video to be ready before starting playback
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

const PreviewPage = () => {
  const { scenes, activeSceneId, aspectRatio } = useEditorStore((state) => ({
    scenes: state.scenes,
    activeSceneId: state.activeSceneId,
    aspectRatio: state.aspectRatio,
  }));

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0],
    [scenes, activeSceneId]
  );

  const { width, height } = ratioDimensions[aspectRatio];

  const stageRef = useRef<Stage>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceoverCurrentTime, setVoiceoverCurrentTime] = useState(0);
  const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);

  // Play voiceover audio when preview loads
  useEffect(() => {
    if (!activeScene) {
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.src = "";
        voiceoverAudioRef.current = null;
      }
      return;
    }

    // Find voiceover audio element in the scene
    const voiceoverElement = activeScene.elements.find(
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
    const handleTimeUpdate = () => {
      setVoiceoverCurrentTime(audio.currentTime);
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

    // Play the voiceover automatically
    const playVoiceover = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
        console.log("✅ Voiceover audio started playing in preview");
      } catch (error) {
        console.error("❌ Error playing voiceover audio in preview:", error);
      }
    };

    // Small delay to ensure audio is ready
    const timeoutId = setTimeout(() => {
      playVoiceover();
    }, 200);

    // Cleanup on unmount or scene change
    return () => {
      clearTimeout(timeoutId);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
        voiceoverAudioRef.current.currentTime = 0;
      }
    };
  }, [activeScene]);

  // Play animations when preview loads
  useEffect(() => {
    if (!activeScene || !stageRef.current) return;

    // Small delay to ensure all elements are rendered
    const timeoutId = setTimeout(() => {
      const stage = stageRef.current?.getStage();
      if (!stage) return;

      activeScene.elements.forEach((element) => {
        if (!element.animations || element.animations.length === 0) return;

        const node = stage.findOne(`#${element.id}`) as Konva.Node | undefined;
        if (!node) {
          console.warn(`Node not found for element ${element.id}`);
          return;
        }

        // Play all animations for this element
        // Each animation starts after its own delay (allowing simultaneous playback)
        element.animations.forEach((animation) => {
          setTimeout(() => {
            animateElement(node!, animation);
          }, animation.delay * 1000);
        });
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeScene]);

  const renderElement = (element: CanvasElement) => {
    const baseProps = {
      id: element.id, // Add ID for finding the node for animations
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
      const captions = activeScene?.captions || [];

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
          isPlaying={true}
        />
      );
    }

    if (element.type === "audio") {
      // Audio elements are not visually rendered in preview
      return null;
    }

    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <div className="rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          {activeScene?.title ?? "Preview"}
        </h1>
        <Stage width={width} height={height} ref={stageRef}>
          <Layer>
            {activeScene?.elements.map((element) => renderElement(element))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PreviewPage;
