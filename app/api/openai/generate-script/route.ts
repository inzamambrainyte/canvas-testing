import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, aspectRatio } = body;

    if (!prompt || !aspectRatio) {
      return NextResponse.json(
        { error: "Prompt and aspect ratio are required" },
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

    // Create a system prompt that instructs OpenAI to generate a script broken into scenes
    const systemPrompt = `You are a professional video script writer. Create an engaging video script based on the user's prompt. Break the script into multiple scenes (3-8 scenes recommended). Each scene should have:
1. A clear title
2. A script/description (2-4 sentences)
3. A suggested duration in seconds (3-10 seconds per scene)

Format your response as a JSON object with a "scenes" property containing an array of scene objects. Each scene object should have:
- title: string (e.g., "Introduction", "Main Content", "Conclusion")
- script: string (the actual script text for this scene, 2-4 sentences)
- duration: number (duration in seconds, between 3-10)

Return ONLY valid JSON, no markdown, no code blocks. Example format:
{"scenes":[{"title":"Scene 1","script":"Welcome to our video...","duration":5},{"title":"Scene 2","script":"In this section...","duration":7}]}`;

    const userPrompt = `Create a video script for: ${prompt}\n\nAspect Ratio: ${aspectRatio}\n\nGenerate ${aspectRatio === "16:9" ? "5-7" : aspectRatio === "9:16" ? "4-6" : "3-5"} scenes that work well for this format.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate script", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let scenes;
    try {
      const parsed = JSON.parse(content);
      // Handle both direct array and object with scenes property
      scenes = Array.isArray(parsed) ? parsed : parsed.scenes || [];
    } catch (parseError) {
      // If parsing fails, try to extract JSON from markdown code blocks
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
    }));

    return NextResponse.json({
      success: true,
      scenes: formattedScenes,
    });
  } catch (error: any) {
    console.error("Error generating script:", error);
    return NextResponse.json(
      {
        error: "Failed to generate script",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

