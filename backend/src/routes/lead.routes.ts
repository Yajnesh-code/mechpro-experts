import { Router } from "express";
import { leadController } from "../controllers/lead.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

export const leadRoutes = Router();

leadRoutes.use(requireAuth);
leadRoutes.get("/", leadController.list);
leadRoutes.post("/", requireRole("SALES_PARTNER", "CUSTOMER"), leadController.create);
leadRoutes.post("/with-documents", requireRole("SALES_PARTNER", "CUSTOMER"), upload.array("documents", 20), leadController.createWithDocuments);
leadRoutes.post("/customer-track", requireRole("CUSTOMER"), leadController.customerTrack);
leadRoutes.get("/:id", leadController.get);
leadRoutes.patch("/:id/assign", requireRole("ADMIN"), leadController.assign);
leadRoutes.patch("/:id/status", requireRole("ADMIN", "SERVICE_PARTNER"), leadController.updateStatus);
leadRoutes.post("/:id/quotes", requireRole("SERVICE_PARTNER"), leadController.quote);
leadRoutes.patch("/:id/quotes/:quoteId/decision", requireRole("CUSTOMER", "ADMIN"), leadController.decideQuote);
leadRoutes.post("/:id/invoices", requireRole("SERVICE_PARTNER"), leadController.invoice);
leadRoutes.patch("/:id/invoices/:invoiceId/pay", requireRole("ADMIN", "SERVICE_PARTNER"), leadController.markInvoicePaid);
leadRoutes.post("/:id/documents", requireRole("SALES_PARTNER", "SERVICE_PARTNER", "CUSTOMER"), upload.single("file"), leadController.uploadDocument);
