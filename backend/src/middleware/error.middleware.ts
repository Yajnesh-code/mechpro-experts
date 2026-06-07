import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", details: JSON.parse(error.message) });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json({ message });
}
