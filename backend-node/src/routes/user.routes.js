import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), listUsers);

export default router;
