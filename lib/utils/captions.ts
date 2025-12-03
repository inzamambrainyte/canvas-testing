/**
 * Utility functions for caption synchronization and highlighting
 */

import type { Caption } from "@/lib/types";

/**
 * Split text into words for word-by-word highlighting
 */
export function splitTextIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Calculate word timings based on caption duration
 * Distributes time evenly across words
 */
export function calculateWordTimings(
  words: string[],
  startTime: number,
  endTime: number
): Array<{ word: string; startTime: number; endTime: number }> {
  const duration = endTime - startTime;
  const wordDuration = duration / words.length;

  return words.map((word, index) => ({
    word,
    startTime: startTime + index * wordDuration,
    endTime: startTime + (index + 1) * wordDuration,
  }));
}

/**
 * Find the active caption based on current time
 */
export function getActiveCaption(
  captions: Caption[],
  currentTime: number
): Caption | null {
  return (
    captions.find(
      (caption) =>
        currentTime >= caption.startTime && currentTime <= caption.endTime
    ) || null
  );
}

/**
 * Find the active word within a caption based on current time
 */
export function getActiveWordIndex(
  words: Array<{ word: string; startTime: number; endTime: number }>,
  currentTime: number
): number {
  const index = words.findIndex(
    (w) => currentTime >= w.startTime && currentTime < w.endTime
  );
  return index >= 0 ? index : -1;
}

/**
 * Highlight text with HTML-like tags for Konva Text
 * Returns an array of text segments with fill colors
 */
export function highlightText(
  words: string[],
  activeWordIndex: number,
  defaultColor: string = "#FFFFFF",
  highlightColor: string = "#FFD700"
): Array<{ text: string; fill: string }> {
  return words.map((word, index) => ({
    text: index === activeWordIndex ? word : word,
    fill: index === activeWordIndex ? highlightColor : defaultColor,
  }));
}

/**
 * Create highlighted text string for Konva Text component
 * Konva Text doesn't support rich text, so we'll use a different approach:
 * Create multiple Text nodes or use a single text with visual highlighting
 */
export function createHighlightedText(
  words: string[],
  activeWordIndex: number,
  highlightColor: string = "#FFD700"
): string {
  // For Konva, we'll return the full text and handle highlighting via separate Text nodes
  // or use a background highlight
  return words.join(" ");
}


