import type { Response } from "express";
import type { DocumentType, UserRole } from "@prisma/client";
import { leadService } from "../services/lead.service.js";
import { uploadService } from "../services/upload.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { assignLeadSchema, createInvoiceSchema, createLeadSchema, createQuotationSchema, customerTrackSchema, paymentUpdateSchema, quoteDecisionSchema, updateLeadStatusSchema } from "../validators/lead.validator.js";
import { badRequest } from "../utils/errors.js";

const allowedUploadTypesByRole: Record<UserRole, DocumentType[]> = {
  ADMIN: [],
  SALES_PARTNER: ["RC_DOCUMENT", "OTHER", "INSURANCE_DOCUMENT", "VEHICLE_PHOTO"],
  CUSTOMER: ["RC_DOCUMENT", "OTHER", "INSURANCE_DOCUMENT", "VEHICLE_PHOTO"],
  SERVICE_PARTNER: ["VEHICLE_PHOTO", "SERVICE_DOCUMENT", "QUOTE_DOCUMENT", "INVOICE_DOCUMENT"],
};

function validateUploadType(role: UserRole, type: DocumentType) {
  const allowed = allowedUploadTypesByRole[role] || [];
  if (!allowed.includes(type)) {
    throw badRequest(`Document type ${type} is not allowed for ${role.replace(/_/g, " ").toLowerCase()} uploads.`);
  }
}

export const leadController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const leads = await leadService.listForUser(req.user!.id, req.user!.role);
    res.json(leads);
  }),

  get: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lead = await leadService.getForUser(req.params.id!, req.user!.id, req.user!.role);
    res.json(lead);
  }),

  customerTrack: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = customerTrackSchema.parse(req.body);
    const lead = await leadService.trackForCustomer(payload, req.user!.id);
    res.json(lead);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = createLeadSchema.parse(req.body);
    const lead = await leadService.create(payload, req.user!.id);
    res.status(201).json(lead);
  }),

  createWithDocuments: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const rawPayload = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
    const rawTypes = typeof req.body.documentTypes === "string" ? JSON.parse(req.body.documentTypes) : [];
    const payload = createLeadSchema.parse(rawPayload);
    const lead = await leadService.createWithDocuments(payload, req.user!.id, (req.files || []) as Express.Multer.File[], rawTypes);
    res.status(201).json(lead);
  }),

  assign: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = assignLeadSchema.parse(req.body);
    const lead = await leadService.assign(req.params.id!, payload.servicePartnerId, req.user!.id, payload.notes);
    res.json(lead);
  }),

  updateStatus: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = updateLeadStatusSchema.parse(req.body);
    const lead = await leadService.updateStatus(req.params.id!, payload.status, req.user!.id, req.user!.role, payload.notes);
    res.json(lead);
  }),

  quote: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = createQuotationSchema.parse(req.body);
    const quote = await leadService.createQuotation(req.params.id!, payload, req.user!.id);
    res.status(201).json(quote);
  }),

  invoice: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = createInvoiceSchema.parse(req.body);
    const invoice = await leadService.createInvoice(req.params.id!, payload, req.user!.id);
    res.status(201).json(invoice);
  }),

  decideQuote: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = quoteDecisionSchema.parse(req.body);
    const lead = await leadService.decideQuote(req.params.id!, req.params.quoteId!, payload.decision, req.user!.id, req.user!.role, payload.notes);
    res.json(lead);
  }),

  markInvoicePaid: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = paymentUpdateSchema.parse(req.body ?? {});
    const invoice = await leadService.markInvoicePaid(req.params.id!, req.params.invoiceId!, req.user!.id, req.user!.role, payload);
    res.json(invoice);
  }),

  uploadDocument: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "File is required" });
    await leadService.getForUser(req.params.id!, req.user!.id, req.user!.role);
    const type = (req.body.type ?? "OTHER") as DocumentType;
    validateUploadType(req.user!.role, type);
    const document = await uploadService.attachLeadDocument({
      leadId: req.params.id!,
      uploadedById: req.user!.id,
      file: req.file,
      type,
      replacesDocumentId: req.body.replacesDocumentId ? String(req.body.replacesDocumentId) : undefined,
    });
    res.status(201).json(document);
  }),
};
