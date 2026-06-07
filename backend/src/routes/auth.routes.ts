import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh-session", authController.refresh);
authRoutes.post("/logout", requireAuth, authController.logout);
authRoutes.get("/me", requireAuth, authController.me);

// UI-only auth screens use these until email/SMS provider integration is added.
authRoutes.post("/forgot-password", (_req, res) => res.json({ message: "Reset link sent if account exists." }));
authRoutes.post("/reset-password", (_req, res) => res.json({ message: "Password reset successful." }));
authRoutes.post("/send-otp", (_req, res) => res.json({ message: "OTP sent." }));
authRoutes.post("/verify-otp", (_req, res) => res.json({ message: "OTP verified." }));
