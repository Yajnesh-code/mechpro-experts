import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 180;
const buckets = new Map<string, { count: number; resetAt: number }>();

function cleanValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim().replace(/\0/g, "");
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cleanValue(item)]));
  }
  return value;
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    return res.status(429).json({ message: "Too many requests. Please try again shortly." });
  }

  return next();
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  req.body = cleanValue(req.body) as never;
  req.query = cleanValue(req.query) as never;
  req.params = cleanValue(req.params) as never;
  next();
}
