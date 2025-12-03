/**
 * Get the actual duration of an audio file
 * @param audioUrl - URL or data URL of the audio file
 * @returns Promise that resolves to the duration in seconds
 */
export const getAudioDuration = (audioUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);

    const handleLoadedMetadata = () => {
      resolve(audio.duration);
      cleanup();
    };

    const handleError = (error: Event) => {
      console.error("Error loading audio for duration:", error);
      // Fallback: calculate estimated duration based on URL type
      // If it's a data URL, we can't estimate, so reject
      if (audioUrl.startsWith("data:")) {
        reject(new Error("Failed to load audio duration from data URL"));
      } else {
        // For remote URLs, we could estimate, but it's better to reject
        reject(new Error("Failed to load audio duration"));
      }
      cleanup();
    };

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.src = ""; // Clean up
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.src = audioUrl;

    // Timeout after 10 seconds
    setTimeout(() => {
      if (audio.readyState < 1) {
        reject(new Error("Timeout loading audio duration"));
        cleanup();
      }
    }, 10000);
  });
};

/**
 * Calculate estimated duration from text based on TTS provider
 * @param text - Text to calculate duration for
 * @param provider - TTS provider ("openai" or "elevenlabs")
 * @returns Estimated duration in seconds
 */
export const calculateDurationFromText = (
  text: string,
  provider: "openai" | "elevenlabs"
): number => {
  if (provider === "openai") {
    // OpenAI: ~150 words per minute
    const wordCount = text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return Math.max(1, (wordCount / 150) * 60); // Minimum 1 second
  } else {
    // ElevenLabs: ~1000 characters per second (rough estimate)
    const characterCount = text.length;
    return Math.max(1, characterCount / 1000); // Minimum 1 second
  }
};

