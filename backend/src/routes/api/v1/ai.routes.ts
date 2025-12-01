import { Router } from "express";
import { generateScript } from "../../../controllers/ai.controller";

const router = Router();

router.route("/generate-script").post(generateScript);

export default router;

