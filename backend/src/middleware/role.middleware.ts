import type { Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import type { AuthenticatedRequest } from "../types/auth.js";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}
