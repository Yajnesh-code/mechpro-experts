import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: "Missing access token" });

  try {
    const payload = verifyAccessToken(token);
    req.user = { ...payload, id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}
