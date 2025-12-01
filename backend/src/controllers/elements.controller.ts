import { Request, Response } from "express";
import { Element } from "../models/Element.model";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

// GET /api/v1/scenes/:sceneId/elements
export const getElements = asyncHandler(async (req: Request, res: Response) => {
  const elements = await Element.find({ sceneId: req.params.sceneId }).sort({
    orderIndex: 1,
  });

  res.json({
    success: true,
    data: elements,
  });
});

// POST /api/v1/scenes/:sceneId/elements
export const createElement = asyncHandler(
  async (req: Request, res: Response) => {
    const element = await Element.create({
      sceneId: req.params.sceneId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: element,
    });
  }
);

// GET /api/v1/elements/:id
export const getElement = asyncHandler(async (req: Request, res: Response) => {
  const element = await Element.findById(req.params.id);

  if (!element) {
    return res.status(404).json({
      success: false,
      error: "Element not found",
    });
  }

  res.json({
    success: true,
    data: element,
  });
});

// PUT /api/v1/elements/:id
export const updateElement = asyncHandler(
  async (req: Request, res: Response) => {
    const element = await Element.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!element) {
      return res.status(404).json({
        success: false,
        error: "Element not found",
      });
    }

    res.json({
      success: true,
      data: element,
    });
  }
);

// DELETE /api/v1/elements/:id
export const deleteElement = asyncHandler(
  async (req: Request, res: Response) => {
    const element = await Element.findByIdAndDelete(req.params.id);

    if (!element) {
      return res.status(404).json({
        success: false,
        error: "Element not found",
      });
    }

    res.json({
      success: true,
      message: "Element deleted successfully",
    });
  }
);

// PUT /api/v1/elements/reorder
export const reorderElements = asyncHandler(
  async (req: Request, res: Response) => {
    const { elementIds } = req.body; // Array of element IDs in new order

    if (!Array.isArray(elementIds)) {
      return res.status(400).json({
        success: false,
        error: "elementIds must be an array",
      });
    }

    // Update orderIndex for each element
    const updatePromises = elementIds.map((elementId: string, index: number) =>
      Element.findByIdAndUpdate(elementId, { orderIndex: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Elements reordered successfully",
    });
  }
);
