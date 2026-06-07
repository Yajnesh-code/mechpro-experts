import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "MechPro Experts Node API" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
