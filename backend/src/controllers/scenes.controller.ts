import { Request, Response } from "express";
import { Scene } from "../models/Scene.model";
import { Element } from "../models/Element.model";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

// GET /api/v1/projects/:projectId/scenes
export const getScenes = asyncHandler(async (req: Request, res: Response) => {
  const scenes = await Scene.find({ projectId: req.params.projectId })
    .sort({ orderIndex: 1 })
    .populate("projectId");

  res.json({
    success: true,
    data: scenes,
  });
});

// POST /api/v1/projects/:projectId/scenes
export const createScene = asyncHandler(async (req: Request, res: Response) => {
  const { title, script, duration, keywords, thumbnail, voiceover, captions } =
    req.body;

  const scene = await Scene.create({
    projectId: req.params.projectId,
    title: title || "Untitled Scene",
    script: script || "",
    duration: duration || 5,
    keywords: keywords || "",
    thumbnail:
      thumbnail ||
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&auto=format&fit=crop&q=60",
    ...(voiceover && { voiceover }),
    ...(captions && { captions }),
  });

  res.status(201).json({
    success: true,
    data: scene,
  });
});

// GET /api/v1/scenes/:id
export const getScene = asyncHandler(async (req: Request, res: Response) => {
  const scene = await Scene.findById(req.params.id).populate("projectId");

  if (!scene) {
    return res.status(404).json({
      success: false,
      error: "Scene not found",
    });
  }

  // Get elements for this scene
  const elements = await Element.find({ sceneId: scene._id }).sort({
    orderIndex: 1,
  });

  res.json({
    success: true,
    data: {
      ...scene.toObject(),
      elements,
    },
  });
});

// PUT /api/v1/scenes/:id
export const updateScene = asyncHandler(async (req: Request, res: Response) => {
  const { title, script, duration, keywords, thumbnail, voiceover, captions } =
    req.body;

  const scene = await Scene.findByIdAndUpdate(
    req.params.id,
    {
      ...(title && { title }),
      ...(script !== undefined && { script }),
      ...(duration !== undefined && { duration }),
      ...(keywords !== undefined && { keywords }),
      ...(thumbnail && { thumbnail }),
      ...(voiceover && { voiceover }),
      ...(captions && { captions }),
    },
    { new: true, runValidators: true }
  );

  if (!scene) {
    return res.status(404).json({
      success: false,
      error: "Scene not found",
    });
  }

  res.json({
    success: true,
    data: scene,
  });
});

// DELETE /api/v1/scenes/:id
export const deleteScene = asyncHandler(async (req: Request, res: Response) => {
  const scene = await Scene.findByIdAndDelete(req.params.id);

  if (!scene) {
    return res.status(404).json({
      success: false,
      error: "Scene not found",
    });
  }

  // Delete all elements for this scene
  await Element.deleteMany({ sceneId: scene._id });

  res.json({
    success: true,
    message: "Scene deleted successfully",
  });
});

// POST /api/v1/scenes/:id/duplicate
export const duplicateScene = asyncHandler(
  async (req: Request, res: Response) => {
    const originalScene = await Scene.findById(req.params.id);

    if (!originalScene) {
      return res.status(404).json({
        success: false,
        error: "Scene not found",
      });
    }

    // Create duplicate scene
    const duplicatedScene = await Scene.create({
      projectId: originalScene.projectId,
      title: `${originalScene.title} Copy`,
      script: originalScene.script,
      duration: originalScene.duration,
      keywords: originalScene.keywords,
      thumbnail: originalScene.thumbnail,
      voiceover: originalScene.voiceover,
      captions: originalScene.captions,
    });

    // Duplicate elements
    const originalElements = await Element.find({ sceneId: originalScene._id });
    const duplicatedElements = originalElements.map((element: any) => ({
      ...element.toObject(),
      _id: undefined,
      sceneId: duplicatedScene._id,
      createdAt: undefined,
      updatedAt: undefined,
    }));

    await Element.insertMany(duplicatedElements);

    res.status(201).json({
      success: true,
      data: duplicatedScene,
    });
  }
);
