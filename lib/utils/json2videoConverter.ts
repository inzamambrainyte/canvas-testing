/**
 * Converter utility to transform our project format to json2video format
 */

import type { Scene, CanvasElement, AspectRatio, Voiceover } from "@/lib/types";

/**
 * Map aspect ratio to width and height
 */
function getDimensionsFromAspectRatio(aspectRatio: AspectRatio): {
  width: number;
  height: number;
} {
  const dimensions = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
  };
  return dimensions[aspectRatio];
}

/**
 * Generate a short random ID (similar to json2video format)
 */
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Convert our CanvasElement to json2video element format
 */
function convertElement(
  element: CanvasElement,
  canvasWidth: number,
  canvasHeight: number
): any {
  const baseElement: any = {
    id: generateShortId(),
    type: element.type === "shape" ? "image" : element.type, // Shapes not directly supported, treat as image placeholder
  };

  // Handle different element types
  switch (element.type) {
    case "image":
      baseElement.src = element.assetUrl || "";
      // Calculate scale based on original image dimensions (if available)
      // For now, use element dimensions
      baseElement.scale = {
        width: element.width,
        height: element.height,
      };
      baseElement.x = element.x;
      baseElement.y = element.y;
      
      // Add pan animation if element has animations
      if (element.animations?.some((a) => a.type === "move")) {
        const moveAnim = element.animations.find((a) => a.type === "move");
        if (moveAnim?.to?.x !== undefined && moveAnim?.to?.x > element.x) {
          baseElement.pan = "right";
        } else if (moveAnim?.to?.x !== undefined && moveAnim?.to?.x < element.x) {
          baseElement.pan = "left";
        }
      }
      break;

    case "video":
      baseElement.src = element.assetUrl || "";
      baseElement.scale = {
        width: element.width,
        height: element.height,
      };
      baseElement.x = element.x;
      baseElement.y = element.y;
      break;

    case "text":
      baseElement.text = element.content || "";
      baseElement.x = element.x;
      baseElement.y = element.y;
      baseElement.width = element.width;
      baseElement.height = element.height;
      baseElement.style = "001"; // Default style
      
      // Convert text settings
      baseElement.settings = {
        "font-family": element.fontFamily || "Inter",
        "font-size": element.fontSize
          ? `${(element.fontSize / canvasWidth) * 100}vw`
          : "4vw",
        "font-weight": "400",
      };

      if (element.textAlign) {
        baseElement.settings["text-align"] = element.textAlign;
      }

      if (element.fill) {
        baseElement.settings.color = element.fill;
      }

      // Add line-height if fontSize is available
      if (element.fontSize) {
        baseElement.settings["line-height"] = `${(element.fontSize * 1.2 / canvasWidth) * 100}vw`;
      }

      // Add duration if element has animations
      if (element.animations && element.animations.length > 0) {
        const maxDuration = Math.max(
          ...element.animations.map((a) => a.duration + a.delay)
        );
        if (maxDuration > 0) {
          baseElement.duration = maxDuration;
        }
      }
      break;

    case "audio":
      baseElement.src = element.assetUrl || "";
      // Duration will be set at scene or global level
      break;

    case "shape":
      // Shapes are not directly supported in json2video
      // We'll skip them or convert to a placeholder image
      return null;
  }

  // Add comment from label
  if (element.label) {
    baseElement.comment = element.label;
  }

  return baseElement;
}

/**
 * Convert our Scene to json2video scene format
 */
function convertScene(
  scene: Scene,
  canvasWidth: number,
  canvasHeight: number
): any {
  const json2videoScene: any = {
    id: generateShortId(),
    comment: scene.title || "Scene",
    elements: [],
  };

  // Convert elements
  scene.elements.forEach((element) => {
    // Skip audio elements (they'll be added globally)
    if (element.type === "audio") {
      return;
    }

    const convertedElement = convertElement(element, canvasWidth, canvasHeight);
    if (convertedElement) {
      json2videoScene.elements.push(convertedElement);
    }
  });

  // Add captions as text elements if they exist
  if (scene.captions && scene.captions.length > 0) {
    scene.captions.forEach((caption) => {
      // Find if there's already a caption text element
      const existingCaptionElement = scene.elements.find(
        (el) => el.type === "text" && el.label === "Caption Text"
      );

      if (existingCaptionElement) {
        // Update the existing text element with caption text
        const captionElement = json2videoScene.elements.find(
          (el: any) => el.type === "text"
        );
        if (captionElement) {
          captionElement.text = caption.text;
          if (caption.style) {
            if (caption.style.fontSize) {
              captionElement.settings["font-size"] = `${(caption.style.fontSize / canvasWidth) * 100}vw`;
            }
            if (caption.style.fontFamily) {
              captionElement.settings["font-family"] = caption.style.fontFamily;
            }
            if (caption.style.fill) {
              captionElement.settings.color = caption.style.fill;
            }
            if (caption.style.textAlign) {
              captionElement.settings["text-align"] = caption.style.textAlign;
            }
          }
        }
      } else {
        // Create a new text element for caption
        const captionElement: any = {
          id: generateShortId(),
          type: "text",
          text: caption.text,
          x: caption.x || canvasWidth / 2 - 200,
          y: caption.y || canvasHeight - 150,
          width: 400,
          height: 100,
          style: "001",
          settings: {
            "font-family": caption.style?.fontFamily || "Inter",
            "font-size": caption.style?.fontSize
              ? `${(caption.style.fontSize / canvasWidth) * 100}vw`
              : "4vw",
            "text-align": caption.style?.textAlign || "center",
            color: caption.style?.fill || "#FFFFFF",
          },
          comment: "Caption",
        };
        json2videoScene.elements.push(captionElement);
      }
    });
  }

  // Add scene duration
  if (scene.duration) {
    json2videoScene.duration = scene.duration;
  }

  // Add transition if scene has animations (check for fade transitions)
  // You can enhance this to detect other transition types
  const hasFadeAnimation = scene.elements.some(
    (el) => el.animations?.some((a) => a.type === "fade")
  );
  
  if (hasFadeAnimation) {
    json2videoScene.transition = {
      style: "fade",
      duration: 0.5,
    };
  }

  // Add background color if available
  // Try to extract from a background element or use default
  const backgroundElement = scene.elements.find(
    (el) => el.type === "shape" && el.label?.toLowerCase().includes("background")
  );
  
  if (backgroundElement?.fill) {
    json2videoScene["background-color"] = backgroundElement.fill;
  }

  return json2videoScene;
}

/**
 * Convert our project format to json2video format
 */
export function convertToJson2VideoFormat(
  scenes: Scene[],
  aspectRatio: AspectRatio,
  voiceovers?: Voiceover[]
): any {
  const dimensions = getDimensionsFromAspectRatio(aspectRatio);
  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height;

  // Determine resolution string
  let resolution = "custom";
  if (aspectRatio === "9:16") {
    resolution = "instagram-story";
  } else if (aspectRatio === "16:9") {
    resolution = "youtube";
  } else if (aspectRatio === "1:1") {
    resolution = "instagram-post";
  }

  // Convert scenes
  const convertedScenes = scenes.map((scene) =>
    convertScene(scene, canvasWidth, canvasHeight)
  );

  // Collect global audio elements (voiceovers)
  const globalElements: any[] = [];
  
  // Add voiceover as global audio if available
  if (voiceovers && voiceovers.length > 0) {
    // Use the first voiceover or combine all
    const mainVoiceover = voiceovers[0];
    if (mainVoiceover.audioUrl) {
      globalElements.push({
        id: generateShortId(),
        type: "audio",
        src: mainVoiceover.audioUrl,
        duration: -2, // -2 means play until end
        "fade-out": 2, // 2 second fade out
      });
    }
  }

  // Also collect audio elements from scenes that should be global
  scenes.forEach((scene) => {
    scene.elements.forEach((element) => {
      if (element.type === "audio" && element.assetUrl) {
        // Check if it's a voiceover (not already added)
        if (element.label === "Voiceover") {
          // Already handled above
          return;
        }
        // Add other audio elements
        globalElements.push({
          id: generateShortId(),
          type: "audio",
          src: element.assetUrl,
          duration: -2,
        });
      }
    });
  });

  // Build the json2video format
  const json2videoProject = {
    id: generateShortId(),
    comment: "Default movie",
    width: canvasWidth,
    height: canvasHeight,
    quality: "medium",
    draft: false,
    scenes: convertedScenes,
    elements: globalElements,
    resolution: resolution,
    fps: 25,
    settings: {},
    cache: true,
  };

  return json2videoProject;
}

