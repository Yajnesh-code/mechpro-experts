import type { Response } from "express";
import { authService } from "../services/auth.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator.js";
import { serializeUser } from "../utils/serializers.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const authController = {
  register: asyncHandler(async (req, res: Response) => {
    const payload = registerSchema.parse(req.body);
    const user = await authService.register(payload);
    res.status(201).json(user);
  }),

  login: asyncHandler(async (req, res: Response) => {
    const payload = loginSchema.parse(req.body);
    const session = await authService.login(payload.email, payload.password);
    res.json(session);
  }),

  refresh: asyncHandler(async (req, res: Response) => {
    const payload = refreshSchema.parse(req.body);
    const session = await authService.refresh(payload.refresh_token);
    res.json(session);
  }),

  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.logout(req.user!.id);
    res.json(result);
  }),

  me: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userRepository.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(serializeUser(user));
  }),
};
