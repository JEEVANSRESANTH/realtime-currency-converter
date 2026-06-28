import { Router } from "express";
import {
  getCurrencies, createCurrency, updateCurrency, deleteCurrency,
  convertCurrency, seedCurrencies
} from "../controllers/currencyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getCurrencies);
router.get("/convert", convertCurrency);
router.get("/seed", seedCurrencies);

router.post("/", protect, authorize("admin", "superadmin"), createCurrency);
router.put("/:id", protect, authorize("admin", "superadmin"), updateCurrency);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteCurrency);

export default router;
