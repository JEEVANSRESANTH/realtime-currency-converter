import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", validate({
  name: ["required"],
  email: ["required", "email"],
  password: ["required", "password"],
}), register);

router.post("/login", validate({
  email: ["required", "email"],
  password: ["required"],
}), login);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
