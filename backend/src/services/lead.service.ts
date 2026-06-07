import type { DocumentType, Lead, LeadStatus, Prisma, UserRole } from "@prisma/client";
import fs from "fs/promises";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { leadRepository } from "../repositories/lead.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";

const workflow: LeadStatus[] = [
  "LEAD_CREATED",
  "ASSIGNED",
  "CAR_RECEIVED",
  "INSPECTION_STARTED",
  "INSPECTION_COMPLETED",
  "QUOTE_SHARED",
  "QUOTE_APPROVED",
  "WORK_STARTED",
  "WORK_COMPLETED",
  "BILL_GENERATED",
  "PAYMENT_DONE",
  "VEHICLE_DELIVERED",
];

function statusTitle(status: LeadStatus) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

async function generateLeadCode(salesPartnerId: string) {
  const partner = await userRepository.findById(salesPartnerId);
  if (!partner) throw notFound("Sales partner not found");
  const vendorCode = partner.vendorCode || (partner.role === "CUSTOMER" ? "GT01" : undefined);
  if (!vendorCode) throw badRequest("Sales partner vendor code is missing");

  const counter = await prisma.sequenceCounter.upsert({
    where: { key: "LEAD" },
    create: { key: "LEAD", value: 1 },
    update: { value: { increment: 1 } },
  });

  return `ME${String(counter.value).padStart(4, "0")}${vendorCode}`;
}

async function scopeForRole(role: UserRole, userId: string): Promise<Prisma.LeadWhereInput> {
  if (role === "ADMIN") return {};
  if (role === "SALES_PARTNER") return { salesPartnerId: userId };
  if (role === "SERVICE_PARTNER") return { assignedServicePartnerId: userId };
  const user = await userRepository.findById(userId);
  if (!user) return { id: "__none__" };
  return {
    OR: [
      { customerEmail: user.email },
      ...(user.mobile ? [{ customerMobile: user.mobile }] : []),
    ],
  };
}

async function customerOwnsLead(lead: Lead, userId: string) {
  const user = await userRepository.findById(userId);
  return Boolean(user && (lead.customerEmail === user.email || lead.customerMobile === user.mobile));
}

function isAccidentRequest(input: Record<string, unknown>) {
  const values = [input.serviceType, ...(Array.isArray(input.services) ? input.services : [])].map((item) => String(item || "").toLowerCase());
  return values.some((value) => value.includes("accident"));
}

function validateRequiredDocuments(input: Record<string, unknown>, documentTypes: DocumentType[]) {
  if (!documentTypes.includes("RC_DOCUMENT")) throw badRequest("RC document is mandatory.");
  if (isAccidentRequest(input)) {
    if (!documentTypes.includes("OTHER")) throw badRequest("Driving License is mandatory for accident requests.");
    if (!documentTypes.includes("VEHICLE_PHOTO")) throw badRequest("Damage photos are mandatory for accident requests.");
  }
}

function leadCreateData(input: Record<string, unknown>, leadCode: string, salesPartnerId: string): Prisma.LeadUncheckedCreateInput {
  return {
    leadCode,
    customerName: String(input.customerName),
    customerEmail: input.customerEmail ? String(input.customerEmail) : undefined,
    customerMobile: String(input.customerMobile),
    customerAddress: input.customerAddress ? String(input.customerAddress) : undefined,
    vehicleNumber: String(input.vehicleNumber).toUpperCase(),
    vehicleBrand: String(input.vehicleBrand),
    vehicleModel: String(input.vehicleModel),
    fuelType: input.fuelType as never,
    vehicleYear: input.vehicleYear as number | undefined,
    vehicleColor: input.vehicleColor ? String(input.vehicleColor) : undefined,
    insuranceCompany: input.insuranceCompany ? String(input.insuranceCompany) : undefined,
    serviceType: String(input.serviceType),
    services: Array.isArray(input.services) ? input.services.map(String) : [String(input.serviceType)],
    priority: (input.priority as never) ?? "MEDIUM",
    location: String(input.location),
    notes: input.notes ? String(input.notes) : undefined,
    salesPartnerId,
  };
}

async function cleanupFiles(files: Express.Multer.File[]) {
  await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => undefined)));
}

export const leadService = {
  workflow,

  async listForUser(userId: string, role: UserRole) {
    return leadRepository.list(await scopeForRole(role, userId));
  },

  async getForUser(idOrCode: string, userId: string, role: UserRole) {
    const lead = idOrCode.startsWith("ME") ? await leadRepository.findByCode(idOrCode) : await leadRepository.findById(idOrCode);
    if (!lead) throw notFound("Lead not found");

    if (role === "SALES_PARTNER" && lead.salesPartnerId !== userId) throw forbidden();
    if (role === "SERVICE_PARTNER" && lead.assignedServicePartnerId !== userId) throw forbidden();
    if (role === "CUSTOMER") {
      if (!(await customerOwnsLead(lead, userId))) throw forbidden();
    }

    return lead;
  },

  async trackForCustomer(input: { searchType: "REQUEST_ID" | "VEHICLE_NUMBER"; searchValue: string; mobile: string }, userId: string) {
    const lead = await leadRepository.findByCustomerTrackingDetails(input);
    if (!lead || !(await customerOwnsLead(lead, userId))) {
      throw notFound("Service request not found for provided customer details.");
    }
    return lead;
  },

  async create(input: Record<string, unknown>, salesPartnerId: string) {
    const leadCode = await generateLeadCode(salesPartnerId);
    const lead = await prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: leadCreateData(input, leadCode, salesPartnerId),
      });

      await tx.leadTimeline.create({
        data: { leadId: created.id, status: "LEAD_CREATED", title: "Lead Created", notes: "Lead created by sales partner", performedById: salesPartnerId },
      });
      await tx.auditLog.create({
        data: { actorId: salesPartnerId, action: "LEAD_CREATED", entityType: "Lead", entityId: created.id, metadata: { leadCode } },
      });
      return created;
    });

    return leadRepository.findById(lead.id);
  },

  async createWithDocuments(input: Record<string, unknown>, salesPartnerId: string, files: Express.Multer.File[], rawTypes: unknown[]) {
    const documentTypes = rawTypes.map((type) => String(type)) as DocumentType[];
    try {
      if (!files.length) throw badRequest("At least RC document is required.");
      if (files.length !== documentTypes.length) throw badRequest("Document type mapping is invalid.");
      validateRequiredDocuments(input, documentTypes);

      const leadCode = await generateLeadCode(salesPartnerId);
      const lead = await prisma.$transaction(async (tx) => {
        const created = await tx.lead.create({ data: leadCreateData(input, leadCode, salesPartnerId) });
        await tx.document.createMany({
          data: files.map((file, index) => ({
            leadId: created.id,
            uploadedById: salesPartnerId,
            type: documentTypes[index] || "OTHER",
            name: file.originalname,
            path: `/${env.uploadDir}/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
          })),
        });
        await tx.leadTimeline.create({
          data: { leadId: created.id, status: "LEAD_CREATED", title: "Lead Created", notes: "Lead created with mandatory documents", performedById: salesPartnerId },
        });
        await tx.auditLog.create({
          data: { actorId: salesPartnerId, action: "LEAD_CREATED_WITH_DOCUMENTS", entityType: "Lead", entityId: created.id, metadata: { leadCode, documentTypes } },
        });
        return created;
      });
      return leadRepository.findById(lead.id);
    } catch (error) {
      await cleanupFiles(files);
      throw error;
    }
  },

  async assign(leadId: string, servicePartnerId: string, adminId: string, notes?: string) {
    const servicePartner = await userRepository.findById(servicePartnerId);
    if (!servicePartner || servicePartner.role !== "SERVICE_PARTNER") throw badRequest("Invalid service partner");

    const updated = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({
        where: { id: leadId },
        data: { assignedServicePartnerId: servicePartnerId, status: "ASSIGNED" },
      });
      await tx.leadTimeline.create({ data: { leadId, status: "ASSIGNED", title: "Assigned", notes, performedById: adminId } });
      await tx.auditLog.create({ data: { actorId: adminId, action: "LEAD_ASSIGNED", entityType: "Lead", entityId: leadId, metadata: { servicePartnerId, notes } } });
      await tx.notification.create({ data: { userId: servicePartnerId, title: "New job assigned", message: `${lead.leadCode} has been assigned to you.` } });
      return lead;
    });

    return leadRepository.findById(updated.id);
  },

  async updateStatus(leadId: string, status: LeadStatus, actorId: string, role: UserRole, notes?: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw notFound("Lead not found");
    if (role === "SERVICE_PARTNER" && lead.assignedServicePartnerId !== actorId) throw forbidden();
    if (role === "SALES_PARTNER") throw forbidden("Sales partners cannot update service workflow status");
    if (status === "QUOTE_SHARED") throw badRequest("Create a quote to move this service request to Quote Shared.");

    const currentIndex = workflow.indexOf(lead.status);
    const nextIndex = workflow.indexOf(status);
    if (nextIndex < currentIndex) throw badRequest("Cannot move lead backward in workflow");

    await leadRepository.updateStatus(leadId, status, actorId, notes);
    return leadRepository.findById(leadId);
  },

  async createQuotation(leadId: string, input: Record<string, unknown>, actorId: string) {
    const assignedLead = await leadRepository.findById(leadId);
    if (!assignedLead) throw notFound("Lead not found");
    if (assignedLead.assignedServicePartnerId !== actorId) throw forbidden("Only assigned service partner can create quote for this job.");

    const quotation = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotation.create({
        data: { leadId, createdById: actorId, amount: input.amount as number, items: input.items as Prisma.InputJsonValue },
      });
      await tx.lead.update({ where: { id: leadId }, data: { status: "QUOTE_SHARED" } });
      await tx.leadTimeline.create({ data: { leadId, status: "QUOTE_SHARED", title: statusTitle("QUOTE_SHARED"), notes: "Quotation shared", performedById: actorId } });
      await tx.auditLog.create({ data: { actorId, action: "QUOTE_CREATED", entityType: "Quotation", entityId: quote.id, metadata: { leadId } } });
      return quote;
    });
    return quotation;
  },

  async createInvoice(leadId: string, input: Record<string, unknown>, actorId: string) {
    const assignedLead = await leadRepository.findById(leadId);
    if (!assignedLead) throw notFound("Lead not found");
    if (assignedLead.assignedServicePartnerId !== actorId) throw forbidden("Only assigned service partner can create invoice for this job.");
    const hasApprovedQuote = assignedLead.quotations.some((quote) => quote.status === "APPROVED");
    if (!hasApprovedQuote) throw badRequest("Invoice can be generated only after customer approves a quote.");

    const invoice = await prisma.$transaction(async (tx) => {
      const bill = await tx.invoice.create({
        data: {
          leadId,
          createdById: actorId,
          amount: input.amount as number,
          gst: input.gst as number,
          total: input.total as number,
          items: input.items as Prisma.InputJsonValue,
        },
      });
      await tx.lead.update({ where: { id: leadId }, data: { status: "BILL_GENERATED" } });
      await tx.leadTimeline.create({ data: { leadId, status: "BILL_GENERATED", title: statusTitle("BILL_GENERATED"), notes: "Bill generated", performedById: actorId } });
      await tx.auditLog.create({ data: { actorId, action: "INVOICE_CREATED", entityType: "Invoice", entityId: bill.id, metadata: { leadId } } });
      return bill;
    });
    return invoice;
  },

  async decideQuote(leadId: string, quoteId: string, decision: "APPROVED" | "REJECTED" | "REVISION_REQUESTED", actorId: string, role: UserRole, notes?: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw notFound("Lead not found");
    if (role === "CUSTOMER") {
      if (!(await customerOwnsLead(lead, actorId))) throw forbidden();
    }
    const quote = await prisma.quotation.findUnique({ where: { id: quoteId } });
    if (!quote || quote.leadId !== leadId) throw notFound("Quote not found for this service request.");

    await prisma.$transaction(async (tx) => {
      await tx.quotation.update({
        where: { id: quoteId },
        data: { status: decision as never, approvedAt: decision === "APPROVED" ? new Date() : null },
      });
      if (decision === "APPROVED") {
        await tx.lead.update({ where: { id: leadId }, data: { status: "QUOTE_APPROVED" } });
        await tx.leadTimeline.create({ data: { leadId, status: "QUOTE_APPROVED", title: statusTitle("QUOTE_APPROVED"), notes: notes ?? "Quote approved", performedById: actorId } });
      } else if (decision === "REVISION_REQUESTED") {
        await tx.lead.update({ where: { id: leadId }, data: { status: "QUOTE_SHARED" } });
        await tx.leadTimeline.create({ data: { leadId, status: "QUOTE_SHARED", title: "Quote Revision Requested", notes: notes ?? "Customer requested quote revision", performedById: actorId } });
      }
      await tx.auditLog.create({ data: { actorId, action: `QUOTE_${decision}`, entityType: "Quotation", entityId: quoteId, metadata: { leadId, notes } } });
      if (lead.assignedServicePartnerId) {
        await tx.notification.create({
          data: {
            userId: lead.assignedServicePartnerId,
            title: decision === "APPROVED" ? "Quote approved" : decision === "REVISION_REQUESTED" ? "Quote revision requested" : "Quote rejected",
            message: `${lead.leadCode} quote has been ${decision.toLowerCase().replace(/_/g, " ")}.`,
          },
        });
      }
    });

    return leadRepository.findById(leadId);
  },

  async markInvoicePaid(leadId: string, invoiceId: string, actorId: string, role: UserRole, payment?: { paymentMode?: string; paymentReference?: string; paymentNotes?: string }) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw notFound("Lead not found");
    if (role === "CUSTOMER") {
      throw forbidden("Customers can view payment status. Admin or service partner updates payment.");
    }
    if (role === "SERVICE_PARTNER" && lead.assignedServicePartnerId !== actorId) throw forbidden();
    const existingInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existingInvoice || existingInvoice.leadId !== leadId) throw notFound("Invoice not found for this service request.");

    const invoice = await prisma.$transaction(async (tx) => {
      const paid = await tx.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } });
      await tx.$executeRaw`
        UPDATE "Invoice"
        SET "paymentMode" = ${payment?.paymentMode ?? null},
            "paymentReference" = ${payment?.paymentReference ?? null},
            "paymentNotes" = ${payment?.paymentNotes ?? null},
            "paymentUpdatedById" = ${actorId}
        WHERE id = ${invoiceId}
      `;
      await tx.lead.update({ where: { id: leadId }, data: { status: "PAYMENT_DONE" } });
      await tx.leadTimeline.create({ data: { leadId, status: "PAYMENT_DONE", title: statusTitle("PAYMENT_DONE"), notes: payment?.paymentNotes ?? "Payment marked as completed", performedById: actorId } });
      await tx.auditLog.create({ data: { actorId, action: "INVOICE_PAID", entityType: "Invoice", entityId: invoiceId, metadata: { leadId, ...payment } } });
      return paid;
    });
    return invoice;
  },
};
