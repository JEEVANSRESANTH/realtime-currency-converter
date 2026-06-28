import { Router } from "express";
import { getHistory, deleteHistory, convertAndSave } from "../controllers/historyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getHistory);
router.post("/convert", convertAndSave);
router.delete("/:id", deleteHistory);

export default router;
