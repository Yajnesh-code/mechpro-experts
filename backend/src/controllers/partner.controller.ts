import type { Response } from "express";
import { userRepository } from "../repositories/user.repository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const partnerController = {
  servicePartners: asyncHandler(async (_req, res: Response) => {
    const partners = await userRepository.listByRole("SERVICE_PARTNER");
    res.json(partners);
  }),

  salesPartners: asyncHandler(async (_req, res: Response) => {
    const partners = await userRepository.listByRole("SALES_PARTNER");
    res.json(partners);
  }),
};
