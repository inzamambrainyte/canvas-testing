import { NextRequest, NextResponse } from "next/server";

/**
 * OpenAI Text-to-Speech API Route
 * Converts text to speech using OpenAI's TTS API
 * 
 * POST /api/openai/text-to-speech
 * Body: { text: string, voice?: string, model?: "tts-1" | "tts-1-hd" }
 * 
 * Returns: Audio file as blob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = "alloy", model = "tts-1" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate voice
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${validVoices.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate model
    if (model !== "tts-1" && model !== "tts-1-hd") {
      return NextResponse.json(
        { error: 'Model must be "tts-1" or "tts-1-hd"' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Call OpenAI TTS API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3", // or "opus", "aac", "flac"
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI TTS API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech", details: errorData },
        { status: response.status }
      );
    }

    // Get audio blob
    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();

    // Convert to base64 for easy storage/transmission
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Calculate approximate duration (rough estimate: ~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      duration: estimatedDuration,
      format: "mp3",
      voice,
      model,
    });
  } catch (error: any) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

