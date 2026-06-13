import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors.js";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", details: JSON.parse(error.message) });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "unique field";
      return res.status(409).json({ message: `A record already exists with this ${target}.` });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Requested record was not found." });
    }
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json({ message });
}
