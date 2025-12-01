import { Request, Response } from "express";
import { Project } from "../models/Project.model";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

// GET /api/v1/projects
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: projects,
  });
});

// POST /api/v1/projects
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, aspectRatio, zoom } = req.body;

    const project = await Project.create({
      title: title || "Untitled Project",
      aspectRatio: aspectRatio || "16:9",
      zoom: zoom || 1,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  }
);

// GET /api/v1/projects/:id
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    });
  }

  res.json({
    success: true,
    data: project,
  });
});

// PUT /api/v1/projects/:id
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, aspectRatio, zoom } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(aspectRatio && { aspectRatio }),
        ...(zoom !== undefined && { zoom }),
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  }
);

// DELETE /api/v1/projects/:id
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  }
);
