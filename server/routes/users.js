import { Router } from "express";
import {
  getUsers, getUser, updateUser, deleteUser,
  promoteUser, demoteAdmin, createAdmin
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", authorize("admin", "superadmin"), getUsers);
router.get("/:id", authorize("admin", "superadmin"), getUser);
router.put("/:id", authorize("admin", "superadmin"), updateUser);
router.delete("/:id", authorize("superadmin"), deleteUser);

router.put("/role/promote/:id", authorize("superadmin"), promoteUser);
router.put("/role/demote/:id", authorize("superadmin"), demoteAdmin);
router.post("/create-admin", authorize("superadmin"), createAdmin);

export default router;
