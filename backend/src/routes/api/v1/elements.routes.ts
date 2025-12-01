import { Router } from "express";
import {
  getElements,
  createElement,
  getElement,
  updateElement,
  deleteElement,
  reorderElements,
} from "../../../controllers/elements.controller";

const router = Router();

// Elements under a scene
router
  .route("/scenes/:sceneId/elements")
  .get(getElements)
  .post(createElement);

// Individual element operations
router
  .route("/elements/:id")
  .get(getElement)
  .put(updateElement)
  .delete(deleteElement);

// Reorder elements
router.route("/elements/reorder").put(reorderElements);

export default router;

