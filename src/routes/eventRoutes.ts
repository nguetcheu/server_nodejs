import express from "express";
import {
  createEvent,
  getEvents,
  deleteEvent,
  registerToEvent,
  updateEvent,
  getEventById,
} from "../controllers/eventController";
import { protect, isOrganizer } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, isOrganizer, createEvent);
router.post("/:id/register", protect, registerToEvent);
router.put("/:id", protect, isOrganizer, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
