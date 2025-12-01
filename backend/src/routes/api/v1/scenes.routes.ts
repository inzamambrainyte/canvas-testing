import { Router } from "express";
import {
  getScenes,
  createScene,
  getScene,
  updateScene,
  deleteScene,
  duplicateScene,
} from "../../../controllers/scenes.controller";

const router = Router();

// Scenes under a project
router
  .route("/projects/:projectId/scenes")
  .get(getScenes)
  .post(createScene);

// Individual scene operations
router.route("/scenes/:id").get(getScene).put(updateScene).delete(deleteScene);
router.route("/scenes/:id/duplicate").post(duplicateScene);

export default router;

