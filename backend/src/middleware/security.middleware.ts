import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 180;
const buckets = new Map<string, { count: number; resetAt: number }>();

function limitForPath(path: string, method: string) {
  if (path.includes("/login") || path.includes("/register") || path.includes("/refresh-session")) return 30;
  if (path.includes("/with-documents") || path.includes("/documents")) return method === "GET" ? 180 : 60;
  if (["POST", "PATCH", "DELETE"].includes(method)) return 90;
  return MAX_REQUESTS;
}

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
  const bucketKey = `${key}:${req.method}:${req.path}`;
  const current = buckets.get(bucketKey);
  const maxRequests = limitForPath(req.path, req.method);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + WINDOW_MS });
    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(maxRequests - 1));
    return next();
  }

  current.count += 1;
  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - current.count)));
  if (current.count > maxRequests) {
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
