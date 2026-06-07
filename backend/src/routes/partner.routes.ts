import { Router } from "express";
import { partnerController } from "../controllers/partner.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const partnerRoutes = Router();

partnerRoutes.use(requireAuth);
partnerRoutes.get("/service-partners", requireRole("ADMIN"), partnerController.servicePartners);
partnerRoutes.get("/sales-partners", requireRole("ADMIN"), partnerController.salesPartners);
