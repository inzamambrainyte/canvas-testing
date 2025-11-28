import Konva from "konva";
import type { Animation, EasingType } from "@/lib/types";

// Easing functions
const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => t * (2 - t),
  "ease-in-out": (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  elastic: (t) => {
    return t === 0 || t === 1
      ? t
      : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
};

export const applyEasing = (t: number, easing: EasingType): number => {
  const clamped = Math.max(0, Math.min(1, t));
  return easingFunctions[easing](clamped);
};

// Animation engine using Konva
export const animateElement = (
  node: Konva.Node,
  animation: Animation,
  onComplete?: () => void
): Konva.Animation => {
  const startTime = Date.now();
  const duration = animation.duration * 1000; // Convert to milliseconds
  const delay = animation.delay * 1000;

  // Store original values
  const originalX = node.x();
  const originalY = node.y();
  const originalScaleX = node.scaleX();
  const originalScaleY = node.scaleY();
  const originalRotation = node.rotation();
  const originalOpacity = node.opacity();

  // Calculate from/to values based on animation type
  let fromValues: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  } = {};
  let toValues: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  } = {};

  switch (animation.type) {
    case "fade":
      fromValues.opacity = animation.direction === "in" ? 0 : originalOpacity;
      toValues.opacity = animation.direction === "in" ? originalOpacity : 0;
      break;

    case "slide":
      const slideDistance = 200;
      if (animation.direction === "in") {
        fromValues.x = originalX - slideDistance;
        toValues.x = originalX;
        fromValues.opacity = 0;
        toValues.opacity = originalOpacity;
      } else {
        fromValues.x = originalX;
        toValues.x = originalX + slideDistance;
        fromValues.opacity = originalOpacity;
        toValues.opacity = 0;
      }
      break;

    case "zoom":
      if (animation.direction === "in") {
        fromValues.scale = 0;
        toValues.scale = 1;
        fromValues.opacity = 0;
        toValues.opacity = originalOpacity;
      } else {
        fromValues.scale = 1;
        toValues.scale = 0;
        fromValues.opacity = originalOpacity;
        toValues.opacity = 0;
      }
      break;

    case "bounce":
      if (animation.direction === "in") {
        fromValues.scale = 0;
        toValues.scale = 1;
        fromValues.opacity = 0;
        toValues.opacity = originalOpacity;
      } else {
        fromValues.scale = 1;
        toValues.scale = 0;
        fromValues.opacity = originalOpacity;
        toValues.opacity = 0;
      }
      break;

    case "rotate":
      if (animation.direction === "in") {
        fromValues.rotation = originalRotation - 360;
        toValues.rotation = originalRotation;
        fromValues.opacity = 0;
        toValues.opacity = originalOpacity;
      } else {
        fromValues.rotation = originalRotation;
        toValues.rotation = originalRotation + 360;
        fromValues.opacity = originalOpacity;
        toValues.opacity = 0;
      }
      break;

    case "pulse":
      // Pulse is a special case - it oscillates
      fromValues.scale = 1;
      toValues.scale = 1.2;
      break;

    case "shake":
      // Shake oscillates position
      fromValues.x = originalX;
      toValues.x = originalX + 10;
      break;

    case "move":
      // Use custom from/to if provided
      fromValues.x = animation.from?.x ?? originalX;
      fromValues.y = animation.from?.y ?? originalY;
      toValues.x = animation.to?.x ?? originalX;
      toValues.y = animation.to?.y ?? originalY;
      break;

    case "scale":
      fromValues.scale = animation.from?.scale ?? 1;
      toValues.scale = animation.to?.scale ?? 1;
      break;
  }

  // Override with custom from/to if provided
  if (animation.from) {
    fromValues = { ...fromValues, ...animation.from };
  }
  if (animation.to) {
    toValues = { ...toValues, ...animation.to };
  }

  // Set initial values
  if (fromValues.x !== undefined) node.x(fromValues.x);
  if (fromValues.y !== undefined) node.y(fromValues.y);
  if (fromValues.scale !== undefined) {
    node.scaleX(fromValues.scale);
    node.scaleY(fromValues.scale);
  }
  if (fromValues.rotation !== undefined) node.rotation(fromValues.rotation);
  if (fromValues.opacity !== undefined) node.opacity(fromValues.opacity);

  const anim = new Konva.Animation((frame) => {
    if (!frame) return;

    const elapsed = Date.now() - startTime;
    const delayedElapsed = Math.max(0, elapsed - delay);

    if (delayedElapsed < 0) {
      // Still in delay period
      return;
    }

    const progress = Math.min(delayedElapsed / duration, 1);
    const eased = applyEasing(progress, animation.easing);

    // Handle special animations
    if (animation.type === "pulse") {
      // Oscillate between 1 and 1.2
      const pulseScale = 1 + 0.2 * Math.sin(progress * Math.PI * 2);
      node.scaleX(pulseScale);
      node.scaleY(pulseScale);
      if (progress >= 1) {
        node.scaleX(originalScaleX);
        node.scaleY(originalScaleY);
        anim.stop();
        onComplete?.();
      }
      return;
    }

    if (animation.type === "shake") {
      // Oscillate position
      const shakeAmount = 10 * (1 - eased);
      const shakeX = originalX + (Math.random() - 0.5) * shakeAmount * 2;
      node.x(shakeX);
      if (progress >= 1) {
        node.x(originalX);
        anim.stop();
        onComplete?.();
      }
      return;
    }

    // Interpolate values
    if (fromValues.x !== undefined && toValues.x !== undefined) {
      node.x(fromValues.x + (toValues.x - fromValues.x) * eased);
    }
    if (fromValues.y !== undefined && toValues.y !== undefined) {
      node.y(fromValues.y + (toValues.y - fromValues.y) * eased);
    }
    if (fromValues.scale !== undefined && toValues.scale !== undefined) {
      const scale = fromValues.scale + (toValues.scale - fromValues.scale) * eased;
      node.scaleX(scale);
      node.scaleY(scale);
    }
    if (fromValues.rotation !== undefined && toValues.rotation !== undefined) {
      node.rotation(
        fromValues.rotation +
          (toValues.rotation - fromValues.rotation) * eased
      );
    }
    if (fromValues.opacity !== undefined && toValues.opacity !== undefined) {
      node.opacity(
        fromValues.opacity + (toValues.opacity - fromValues.opacity) * eased
      );
    }

    if (progress >= 1) {
      anim.stop();
      onComplete?.();
    }
  }, node.getLayer());

  // Start animation after delay
  if (delay > 0) {
    setTimeout(() => anim.start(), delay);
  } else {
    anim.start();
  }

  return anim;
};

// Preview a single animation
export const previewAnimation = (
  node: Konva.Node,
  animation: Animation,
  onComplete?: () => void
): Konva.Animation => {
  // Store original values to restore after preview
  const originalX = node.x();
  const originalY = node.y();
  const originalScaleX = node.scaleX();
  const originalScaleY = node.scaleY();
  const originalRotation = node.rotation();
  const originalOpacity = node.opacity();

  const anim = animateElement(node, animation, () => {
    // Restore original values after preview
    node.x(originalX);
    node.y(originalY);
    node.scaleX(originalScaleX);
    node.scaleY(originalScaleY);
    node.rotation(originalRotation);
    node.opacity(originalOpacity);
    onComplete?.();
  });

  return anim;
};

// Play all animations in sequence
export const playAllAnimations = (
  node: Konva.Node,
  animations: Animation[],
  onComplete?: () => void
): Konva.Animation[] => {
  if (animations.length === 0) return [];

  // Store original values to restore after preview
  const originalX = node.x();
  const originalY = node.y();
  const originalScaleX = node.scaleX();
  const originalScaleY = node.scaleY();
  const originalRotation = node.rotation();
  const originalOpacity = node.opacity();

  const anims: Konva.Animation[] = [];
  let currentIndex = 0;

  const playNext = () => {
    if (currentIndex >= animations.length) {
      // All animations complete, restore original values
      node.x(originalX);
      node.y(originalY);
      node.scaleX(originalScaleX);
      node.scaleY(originalScaleY);
      node.rotation(originalRotation);
      node.opacity(originalOpacity);
      onComplete?.();
      return;
    }

    const animation = animations[currentIndex];
    const anim = animateElement(node, animation, () => {
      currentIndex++;
      playNext();
    });

    anims.push(anim);
  };

  playNext();
  return anims;
};

