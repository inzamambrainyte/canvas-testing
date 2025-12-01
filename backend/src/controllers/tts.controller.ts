import { Request, Response } from "express";
import { OpenAIService } from "../services/openai.service";
import { ElevenLabsService } from "../services/elevenlabs.service";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

const openAIService = new OpenAIService();
const elevenLabsService = new ElevenLabsService();

// POST /api/v1/tts/generate
export const generateTTS = asyncHandler(async (req: Request, res: Response) => {
  const { text, provider = "openai", voice, model, voice_id, model_id } =
    req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Text is required and must be a non-empty string",
    });
  }

  let result;

  if (provider === "openai") {
    result = await openAIService.textToSpeech(
      text,
      voice || "alloy",
      model || "tts-1"
    );
  } else if (provider === "elevenlabs") {
    result = await elevenLabsService.textToSpeech(
      text,
      voice_id || "21m00Tcm4TlvDq8ikWAM",
      model_id || "eleven_monolingual_v1"
    );
  } else {
    return res.status(400).json({
      success: false,
      error: 'Provider must be "openai" or "elevenlabs"',
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

