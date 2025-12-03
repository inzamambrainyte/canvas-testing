"use client";

import { useMemo, useEffect, useState } from "react";
import { Group, Text as KonvaText, Rect } from "react-konva";
import Konva from "konva";
import type { Caption, CanvasElement } from "@/lib/types";
import {
  splitTextIntoWords,
  calculateWordTimings,
  getActiveCaption,
  getActiveWordIndex,
} from "@/lib/utils/captions";

type HighlightedCaptionProps = {
  element: CanvasElement;
  captions: Caption[];
  audioCurrentTime: number;
  isPlaying: boolean;
  // Transformation props
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (event: any) => void;
  onTransformEnd?: (event: any) => void;
  onClick?: () => void;
  onTap?: () => void;
  listening?: boolean;
};

/**
 * Component that renders caption text with word-by-word highlighting
 * synchronized with voiceover audio playback
 */
export const HighlightedCaption = ({
  element,
  captions,
  audioCurrentTime,
  isPlaying,
  id,
  x,
  y,
  width,
  height,
  rotation,
  draggable = true,
  onDragStart,
  onDragEnd,
  onTransformEnd,
  onClick,
  onTap,
  listening = true,
}: HighlightedCaptionProps) => {
  const [wordTimings, setWordTimings] = useState<
    Array<{ word: string; startTime: number; endTime: number }>
  >([]);

  // Find active caption based on current audio time
  const activeCaption = useMemo(() => {
    if (!isPlaying || captions.length === 0) return null;
    return getActiveCaption(captions, audioCurrentTime);
  }, [captions, audioCurrentTime, isPlaying]);

  // Calculate word timings when active caption changes
  useEffect(() => {
    if (!activeCaption) {
      setWordTimings([]);
      return;
    }

    const words = splitTextIntoWords(activeCaption.text);
    const timings = calculateWordTimings(
      words,
      activeCaption.startTime,
      activeCaption.endTime
    );
    setWordTimings(timings);
  }, [activeCaption]);

  // Find active word index
  const activeWordIndex = useMemo(() => {
    if (!isPlaying || wordTimings.length === 0 || !activeCaption) return -1;
    return getActiveWordIndex(wordTimings, audioCurrentTime);
  }, [wordTimings, audioCurrentTime, isPlaying, activeCaption]);

  // Split text into words
  const words = useMemo(() => {
    if (activeCaption) {
      return splitTextIntoWords(activeCaption.text);
    }
    // Fallback to element content if no active caption
    return splitTextIntoWords(element.content || "");
  }, [activeCaption, element.content]);

  // Render word-by-word with highlighting - constants
  const fontSize = element.fontSize || 28;
  const fontFamily = element.fontFamily || "Inter";
  const defaultColor = element.fill || "#FFFFFF";
  const highlightColor = "#FFD700"; // Gold color for highlighting
  const lineHeight = fontSize * 1.2;
  const padding = 8;

  // Calculate which words should be visible (window around active word)
  const visibleWordsRange = useMemo(() => {
    if (
      !activeCaption ||
      !isPlaying ||
      activeWordIndex < 0 ||
      words.length === 0
    ) {
      return { start: 0, end: 0 };
    }

    const maxWidth = element.width - padding * 2;
    const tempText = new Konva.Text({
      text: "",
      fontSize,
      fontFamily,
    });

    // Start with the active word and expand outward
    let startIndex = activeWordIndex;
    let endIndex = activeWordIndex + 1;
    let totalWidth = 0;

    // First, measure the active word
    tempText.text(words[activeWordIndex] + " ");
    totalWidth = tempText.width();

    // Add words after the active word until we reach max width
    for (
      let i = activeWordIndex + 1;
      i < words.length && totalWidth < maxWidth;
      i++
    ) {
      tempText.text(words[i] + " ");
      const wordWidth = tempText.width();
      if (totalWidth + wordWidth <= maxWidth) {
        totalWidth += wordWidth;
        endIndex = i + 1;
      } else {
        break;
      }
    }

    // Add words before the active word if there's space
    // Try to center the active word when possible
    for (let i = activeWordIndex - 1; i >= 0 && totalWidth < maxWidth; i--) {
      tempText.text(words[i] + " ");
      const wordWidth = tempText.width();
      if (totalWidth + wordWidth <= maxWidth) {
        totalWidth += wordWidth;
        startIndex = i;
      } else {
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [
    words,
    activeWordIndex,
    element.width,
    fontSize,
    fontFamily,
    padding,
    activeCaption,
    isPlaying,
  ]);

  // Get visible words based on the calculated range
  const visibleWords = useMemo(() => {
    if (
      !activeCaption ||
      !isPlaying ||
      visibleWordsRange.end <= visibleWordsRange.start
    ) {
      return [];
    }
    return words.slice(visibleWordsRange.start, visibleWordsRange.end);
  }, [words, visibleWordsRange, activeCaption, isPlaying]);

  // Calculate word positions for visible words only
  const wordPositions: Array<{
    word: string;
    x: number;
    y: number;
    width: number;
    isHighlighted: boolean;
    originalIndex: number; // Original index in full words array
  }> = useMemo(() => {
    // If no active caption or not playing, return empty positions
    if (!activeCaption || !isPlaying || visibleWords.length === 0) {
      return [];
    }

    const positions: Array<{
      word: string;
      x: number;
      y: number;
      width: number;
      isHighlighted: boolean;
      originalIndex: number;
    }> = [];
    // Use relative positions (0,0) since Group will handle absolute positioning
    let currentX = padding;
    let currentY = padding;
    const maxWidth = element.width - padding * 2;

    // Use Konva.Text to measure text width
    const tempText = new Konva.Text({
      text: "",
      fontSize,
      fontFamily,
    });

    visibleWords.forEach((word, visibleIndex) => {
      const originalIndex = visibleWordsRange.start + visibleIndex;

      // Measure word width
      tempText.text(word + " ");
      const wordWidth = tempText.width();

      // Check if word fits on current line
      if (currentX + wordWidth > maxWidth && currentX > padding) {
        // Move to next line
        currentX = padding;
        currentY += lineHeight;
      }

      positions.push({
        word,
        x: currentX,
        y: currentY,
        width: wordWidth,
        isHighlighted: originalIndex === activeWordIndex,
        originalIndex,
      });

      currentX += wordWidth;
    });

    return positions;
  }, [
    visibleWords,
    visibleWordsRange,
    activeWordIndex,
    element,
    fontSize,
    fontFamily,
    lineHeight,
    padding,
    activeCaption,
    isPlaying,
  ]);

  // Use provided props or fallback to element properties
  const groupX = x !== undefined ? x : element.x;
  const groupY = y !== undefined ? y : element.y;
  const groupWidth = width !== undefined ? width : element.width;
  const groupHeight = height !== undefined ? height : element.height;
  const groupRotation =
    rotation !== undefined ? rotation : element.rotation ?? 0;

  // If no active caption or not playing, render normal text
  if (!activeCaption || !isPlaying) {
    return (
      <KonvaText
        id={id || element.id}
        x={groupX}
        y={groupY}
        width={groupWidth}
        height={groupHeight}
        rotation={groupRotation}
        text={element.content || ""}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fill={defaultColor}
        align={element.textAlign || "center"}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        onClick={onClick}
        onTap={onTap}
        listening={listening}
      />
    );
  }

  return (
    <Group
      id={id || element.id}
      x={groupX}
      y={groupY}
      width={groupWidth}
      height={groupHeight}
      rotation={groupRotation}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onClick={onClick}
      onTap={onTap}
      listening={listening}
    >
      {/* Render each visible word as a separate Text node */}
      {wordPositions.map((pos, index) => (
        <Group key={`word-${pos.originalIndex}`}>
          {/* Highlight background for active word */}
          {pos.isHighlighted && (
            <Rect
              x={pos.x - 2}
              y={pos.y - fontSize * 0.1}
              width={pos.width + 4}
              height={fontSize * 1.1}
              fill={highlightColor}
              opacity={0.3}
              cornerRadius={4}
            />
          )}
          {/* Word text */}
          <KonvaText
            x={pos.x}
            y={pos.y}
            text={pos.word + (index < wordPositions.length - 1 ? " " : "")}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fill={pos.isHighlighted ? highlightColor : defaultColor}
            fontStyle={pos.isHighlighted ? "bold" : "normal"}
          />
        </Group>
      ))}
    </Group>
  );
};
