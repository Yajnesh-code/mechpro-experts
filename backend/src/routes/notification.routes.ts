import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get("/", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const status = String(req.query.status || "all").toLowerCase();
  const notifications = await prisma.notification.findMany({
    where: {
      userId: authReq.user!.id,
      ...(status === "unread" ? { readAt: null } : status === "read" ? { readAt: { not: null } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
}));

notificationRoutes.patch("/read-all", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const result = await prisma.notification.updateMany({
    where: { userId: authReq.user!.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ updated: result.count });
}));

notificationRoutes.patch("/:id/read", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const notification = await prisma.notification.update({ where: { id: req.params.id, userId: authReq.user!.id }, data: { readAt: new Date() } });
  res.json(notification);
}));
