import express from "express";
import { getMyProfile, anonymizeMe, updateMyProfile } from "../controllers/meController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getMyProfile);
router.put("/", protect, updateMyProfile);
router.delete("/", protect, anonymizeMe);

export default router;