import express from "express";
import {
  createEvent,
  getEvents,
  deleteEvent,
} from "../controllers/eventController";
import { protect, isOrganizer } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getEvents);
router.post("/", protect, isOrganizer, createEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
