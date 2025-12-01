import { config } from "../config/env";

export interface GenerateScriptResponse {
  success: boolean;
  scenes: Array<{
    title: string;
    script: string;
    duration: number;
    keywords: string;
  }>;
}

export interface TextToSpeechResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  format: string;
  voice: string;
  model: string;
}

export class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.openaiApiKey || "";
    if (!this.apiKey) {
      console.warn("⚠️ OpenAI API key not configured");
    }
  }

  async generateScript(
    prompt: string,
    aspectRatio: "16:9" | "9:16" | "1:1"
  ): Promise<GenerateScriptResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const systemPrompt = `You are a professional video script writer. Create an engaging video script based on the user's prompt. Break the script into multiple scenes (3-8 scenes recommended). Each scene should have:
1. A clear title
2. A script/description (2-4 sentences)
3. A suggested duration in seconds (3-10 seconds per scene)
4. Suggested keywords for finding relevant images/videos (3-5 keywords as a comma-separated string)

Format your response as a JSON object with a "scenes" property containing an array of scene objects. Each scene object should have:
- title: string (e.g., "Introduction", "Main Content", "Conclusion")
- script: string (the actual script text for this scene, 2-4 sentences)
- duration: number (duration in seconds, between 3-10)
- keywords: string (3-5 comma-separated keywords for image/video search, e.g., "nature, forest, trees, outdoor, landscape")

The keywords should be specific and relevant to the scene content, suitable for searching stock photo/video libraries like Pexels.

Return ONLY valid JSON, no markdown, no code blocks. Example format:
{"scenes":[{"title":"Scene 1","script":"Welcome to our video...","duration":5,"keywords":"introduction, welcome, greeting, friendly, warm"},{"title":"Scene 2","script":"In this section...","duration":7,"keywords":"nature, forest, trees, outdoor"}]}`;

    const userPrompt = `Create a video script for: ${prompt}\n\nAspect Ratio: ${aspectRatio}\n\nGenerate ${
      aspectRatio === "16:9" ? "5-7" : aspectRatio === "9:16" ? "4-6" : "3-5"
    } scenes that work well for this format.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from OpenAI");
    }

    // Parse the JSON response
    let scenes;
    try {
      const parsed = JSON.parse(content);
      scenes = Array.isArray(parsed) ? parsed : parsed.scenes || [];
    } catch (parseError) {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse OpenAI response");
      }
    }

    // Validate and format scenes
    const formattedScenes = scenes.map((scene: any, index: number) => ({
      title: scene.title || `Scene ${index + 1}`,
      script: scene.script || scene.description || "",
      duration: Math.max(3, Math.min(10, scene.duration || 5)),
      keywords: scene.keywords || scene.title || "",
    }));

    return {
      success: true,
      scenes: formattedScenes,
    };
  }

  async textToSpeech(
    text: string,
    voice: string = "alloy",
    model: "tts-1" | "tts-1-hd" = "tts-1"
  ): Promise<TextToSpeechResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    if (!validVoices.includes(voice)) {
      throw new Error(
        `Invalid voice. Must be one of: ${validVoices.join(", ")}`
      );
    }

    if (model !== "tts-1" && model !== "tts-1-hd") {
      throw new Error('Model must be "tts-1" or "tts-1-hd"');
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI TTS API error: ${errorData}`);
    }

    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Calculate approximate duration (~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    return {
      success: true,
      audioUrl: dataUrl,
      duration: estimatedDuration,
      format: "mp3",
      voice,
      model,
    };
  }
}
