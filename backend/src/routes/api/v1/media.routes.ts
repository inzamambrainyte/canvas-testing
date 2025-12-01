import { Router } from "express";
import { getImages, getVideos, getAudio } from "../../../controllers/media.controller";

const router = Router();

router.route("/images").get(getImages);
router.route("/videos").get(getVideos);
router.route("/audio").get(getAudio);

export default router;

