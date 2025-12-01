import { config } from "../config/env";

export interface TextToSpeechResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  format: string;
  voice_id: string;
  model_id: string;
  provider: "elevenlabs";
}

export class ElevenLabsService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.elevenlabsApiKey || "";
    if (!this.apiKey) {
      console.warn("⚠️ ElevenLabs API key not configured");
    }
  }

  async textToSpeech(
    text: string,
    voiceId: string = "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
    modelId: string = "eleven_monolingual_v1",
    stability: number = 0.5,
    similarityBoost: number = 0.75
  ): Promise<TextToSpeechResponse> {
    if (!this.apiKey) {
      throw new Error("ElevenLabs API key is not configured");
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Text is required and must be a non-empty string");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ElevenLabs API error: ${errorData}`);
    }

    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Calculate approximate duration
    // ElevenLabs: ~1,000 characters = 1 credit = ~1 second of audio
    const characterCount = text.length;
    const estimatedDuration = characterCount / 1000; // Rough estimate

    return {
      success: true,
      audioUrl: dataUrl,
      duration: estimatedDuration,
      format: "mp3",
      voice_id: voiceId,
      model_id: modelId,
      provider: "elevenlabs",
    };
  }
}
