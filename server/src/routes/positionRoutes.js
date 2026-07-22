import express from "express";
import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../controllers/positionController.js";

const router = express.Router();

router.get("/teacher-positions", getPositions);
router.get("/teacher-positions/:id", getPositionById);
router.post("/teacher-positions", createPosition);
router.put("/teacher-positions/:id", updatePosition);
router.delete("/teacher-positions/:id", deletePosition);

export default router;
