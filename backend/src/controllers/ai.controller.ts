import { Request, Response } from "express";
import { OpenAIService } from "../services/openai.service";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

const openAIService = new OpenAIService();

// POST /api/v1/ai/generate-script
export const generateScript = asyncHandler(
  async (req: Request, res: Response) => {
    const { prompt, aspectRatio } = req.body;

    if (!prompt || !aspectRatio) {
      return res.status(400).json({
        success: false,
        error: "Prompt and aspect ratio are required",
      });
    }

    if (!["16:9", "9:16", "1:1"].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: 'Aspect ratio must be "16:9", "9:16", or "1:1"',
      });
    }

    const result = await openAIService.generateScript(
      prompt,
      aspectRatio as "16:9" | "9:16" | "1:1"
    );

    res.json({
      success: true,
      data: result,
    });
  }
);

