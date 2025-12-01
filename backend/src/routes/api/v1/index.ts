import { Router } from "express";
import projectsRoutes from "./projects.routes";
import scenesRoutes from "./scenes.routes";
import elementsRoutes from "./elements.routes";
import mediaRoutes from "./media.routes";
import ttsRoutes from "./tts.routes";
import aiRoutes from "./ai.routes";

const router = Router();

router.use("/projects", projectsRoutes);
router.use("/", scenesRoutes);
router.use("/", elementsRoutes);
router.use("/media", mediaRoutes);
router.use("/tts", ttsRoutes);
router.use("/ai", aiRoutes);

export default router;

