import { Request, Response } from "express";
import { PexelsService } from "../services/pexels.service";
import { FreesoundService } from "../services/freesound.service";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

const pexelsService = new PexelsService();
const freesoundService = new FreesoundService();

// GET /api/v1/media/images
export const getImages = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "nature";
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.per_page as string) || 20;

  const data = await pexelsService.searchImages(query, page, perPage);

  res.json({
    success: true,
    data,
  });
});

// GET /api/v1/media/videos
export const getVideos = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "nature";
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.per_page as string) || 20;

  const data = await pexelsService.searchVideos(query, page, perPage);

  res.json({
    success: true,
    data,
  });
});

// GET /api/v1/media/audio
export const getAudio = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "nature";
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.page_size as string) || 20;

  const data = await freesoundService.searchAudio(query, page, pageSize);

  res.json({
    success: true,
    data,
  });
});
