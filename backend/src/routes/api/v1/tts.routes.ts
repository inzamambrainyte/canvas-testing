import { Router } from "express";
import { generateTTS } from "../../../controllers/tts.controller";

const router = Router();

router.route("/generate").post(generateTTS);

export default router;

