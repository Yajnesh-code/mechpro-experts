import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { leadRoutes } from "./lead.routes.js";
import { partnerRoutes } from "./partner.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { notificationRoutes } from "./notification.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ status: "ok", service: "mechpro-experts-api" }));

// Root-compatible routes for the existing frontend.
routes.use(authRoutes);
routes.use("/leads", leadRoutes);
routes.use("/partners", partnerRoutes);
routes.use("/admin", adminRoutes);
routes.use("/notifications", notificationRoutes);

// Versioned aliases for future API clients.
routes.use("/api/v1", authRoutes);
routes.use("/api/v1/leads", leadRoutes);
routes.use("/api/v1/partners", partnerRoutes);
routes.use("/api/v1/admin", adminRoutes);
routes.use("/api/v1/notifications", notificationRoutes);
