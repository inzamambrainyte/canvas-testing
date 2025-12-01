import { NextRequest, NextResponse } from "next/server";

/**
 * ElevenLabs Text-to-Speech API Route
 * Converts text to speech using ElevenLabs TTS API
 * 
 * POST /api/elevenlabs/text-to-speech
 * Body: { text: string, voice_id?: string, model_id?: string, stability?: number, similarity_boost?: number }
 * 
 * Returns: Audio file as blob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      voice_id = "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
      model_id = "eleven_monolingual_v1", // or "eleven_multilingual_v2"
      stability = 0.5,
      similarity_boost = 0.75
    } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured" },
        { status: 500 }
      );
    }

    // Call ElevenLabs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
            style: 0.0, // 0.0 to 1.0
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech", details: errorData },
        { status: response.status }
      );
    }

    // Get audio blob (ElevenLabs returns MP3 by default)
    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();

    // Convert to base64 for easy storage/transmission
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Calculate approximate duration
    // ElevenLabs: ~1,000 characters = 1 credit = ~1 second of audio
    const characterCount = text.length;
    const estimatedDuration = characterCount / 1000; // Rough estimate

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      duration: estimatedDuration,
      format: "mp3",
      voice_id,
      model_id,
      provider: "elevenlabs",
    });
  } catch (error: any) {
    console.error("Error generating speech with ElevenLabs:", error);
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

