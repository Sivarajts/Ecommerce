// backend/routes/authRoutes.js
import express from "express";
import { signup, login, logout, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", requireAuth, me); // frontend calls /auth/check
router.get("/me", requireAuth, me);    // alternative

export default router;
