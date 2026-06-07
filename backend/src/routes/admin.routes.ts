import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serializeUser } from "../utils/serializers.js";
import { hashPassword } from "../utils/password.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { storageService } from "../services/storage.service.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole("ADMIN"));

async function getReportSummary() {
  const [leads, users, invoices] = await Promise.all([
    prisma.lead.findMany({ include: { salesPartner: true, assignedServicePartner: true } }),
    prisma.user.findMany(),
    prisma.invoice.findMany(),
  ]);
  const completed = leads.filter((lead) => lead.status === "VEHICLE_DELIVERED").length;
  const revenue = invoices.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const byStatus = leads.reduce<Record<string, number>>((acc, lead) => ({ ...acc, [lead.status]: (acc[lead.status] || 0) + 1 }), {});
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyLeads = leads.filter((lead) => lead.createdAt.toISOString().slice(0, 10) === todayKey).length;
  const monthlyLeads = leads.filter((lead) => {
    const now = new Date();
    return lead.createdAt.getMonth() === now.getMonth() && lead.createdAt.getFullYear() === now.getFullYear();
  }).length;
  const conversionRate = leads.length ? Math.round((completed / leads.length) * 100) : 0;
  const partnerPerformance = users.filter((user) => user.role === "SERVICE_PARTNER").map((partner) => ({
    id: partner.id,
    name: partner.name,
    jobs: leads.filter((lead) => lead.assignedServicePartnerId === partner.id).length,
    completed: leads.filter((lead) => lead.assignedServicePartnerId === partner.id && lead.status === "VEHICLE_DELIVERED").length,
  }));
  return { totalLeads: leads.length, activeLeads: leads.length - completed, completedLeads: completed, revenue, byStatus, dailyLeads, monthlyLeads, conversionRate, partnerPerformance };
}

function reportPdf(summary: Awaited<ReturnType<typeof getReportSummary>>) {
  const lines = [
    "MechPro Experts Report",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    `Total Leads: ${summary.totalLeads}`,
    `Active Leads: ${summary.activeLeads}`,
    `Completed Leads: ${summary.completedLeads}`,
    `Revenue: INR ${summary.revenue}`,
    `Today: ${summary.dailyLeads}`,
    `This Month: ${summary.monthlyLeads}`,
    `Conversion: ${summary.conversionRate}%`,
  ];
  const text = lines.map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 20} Td (${line.replace(/[()]/g, "")}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(text)} >> stream\n${text}\nendstream endobj`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(body));
    body += `${object}\n`;
  });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  body += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}

adminRoutes.get("/users", asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json(users.map(serializeUser));
}));

adminRoutes.post("/users", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const passwordHash = await hashPassword(String(req.body.password || "MechPro@123"));
  const user = await prisma.user.create({
    data: {
      name: String(req.body.name),
      email: String(req.body.email).toLowerCase(),
      mobile: req.body.mobile ? String(req.body.mobile) : undefined,
      role: req.body.role,
      status: req.body.status || "ACTIVE",
      companyName: req.body.companyName,
      city: req.body.city,
      address: req.body.address,
      salesPartnerType: req.body.salesPartnerType,
      vendorCode: req.body.vendorCode,
      servicePartnerType: req.body.servicePartnerType,
      serviceCategories: req.body.serviceCategories || [],
      gstOrLicense: req.body.gstOrLicense,
      passwordHash,
    },
  });
  await prisma.auditLog.create({ data: { actorId: authReq.user!.id, action: "USER_CREATED", entityType: "User", entityId: user.id } });
  res.status(201).json(serializeUser(user));
}));

adminRoutes.patch("/users/:id", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const allowed = ["name", "mobile", "status", "companyName", "city", "address", "servicePartnerType", "salesPartnerType", "vendorCode", "gstOrLicense"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  await prisma.auditLog.create({ data: { actorId: authReq.user!.id, action: "USER_UPDATED", entityType: "User", entityId: user.id, metadata: data as Prisma.InputJsonValue } });
  res.json(serializeUser(user));
}));

adminRoutes.delete("/users/:id", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "INACTIVE" } });
  await prisma.auditLog.create({ data: { actorId: authReq.user!.id, action: "USER_DEACTIVATED", entityType: "User", entityId: user.id } });
  res.json(serializeUser(user));
}));

adminRoutes.get("/partners", asyncHandler(async (_req, res) => {
  const partners = await prisma.user.findMany({ where: { role: { in: ["SALES_PARTNER", "SERVICE_PARTNER"] } }, orderBy: { createdAt: "desc" } });
  res.json(partners.map(serializeUser));
}));

adminRoutes.get("/audit-logs", asyncHandler(async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { actor: true } });
  res.json(logs.map((log) => ({ ...log, actor: log.actor ? serializeUser(log.actor) : null })));
}));

adminRoutes.get("/reports/summary", asyncHandler(async (_req, res) => {
  res.json(await getReportSummary());
}));

adminRoutes.get("/reports/export/:format", asyncHandler(async (req, res) => {
  const summary = await getReportSummary();
  const format = String(req.params.format || "").toLowerCase();
  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=mechpro-report.pdf");
    return res.send(reportPdf(summary));
  }
  if (format === "excel") {
    const rows = [
      ["Metric", "Value"],
      ["Total Leads", summary.totalLeads],
      ["Active Leads", summary.activeLeads],
      ["Completed Leads", summary.completedLeads],
      ["Revenue", summary.revenue],
      ["Today", summary.dailyLeads],
      ["This Month", summary.monthlyLeads],
      ["Conversion", `${summary.conversionRate}%`],
    ];
    const html = `<table>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table>`;
    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("Content-Disposition", "attachment; filename=mechpro-report.xls");
    return res.send(html);
  }
  res.status(400).json({ message: "Unsupported export format" });
}));

adminRoutes.get("/billing/summary", asyncHandler(async (_req, res) => {
  const invoices = await prisma.invoice.findMany({ include: { lead: true }, orderBy: { createdAt: "desc" } });
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const paid = invoices.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const pending = invoices.filter((invoice) => invoice.status === "UNPAID").reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const gst = invoices.reduce((sum, invoice) => sum + Number(invoice.gst), 0);
  const pendingCount = invoices.filter((invoice) => invoice.status === "UNPAID").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "PAID").length;
  res.json({ total, paid, pending, gst, pendingCount, paidCount, invoices });
}));

adminRoutes.get("/documents", asyncHandler(async (_req, res) => {
  const documents = await prisma.$queryRaw`
    SELECT
      d.id,
      d.type,
      d.name,
      d.path,
      d."mimeType",
      d.size,
      d.version,
      d."isCurrent",
      d."replacesDocumentId",
      d."createdAt",
      d."reviewStatus",
      d."reviewNotes",
      d."reviewedAt",
      l.id AS "leadId",
      l."leadCode",
      l."customerName",
      u.name AS "uploadedByName",
      u.role AS "uploadedByRole"
    FROM "Document" d
    JOIN "Lead" l ON l.id = d."leadId"
    JOIN "User" u ON u.id = d."uploadedById"
    ORDER BY d."createdAt" DESC
    LIMIT 250
  `;
  res.json((documents as Array<Record<string, unknown>>).map((document) => ({
    id: document.id,
    type: document.type,
    name: document.name,
    path: document.path,
    url: document.path,
    mimeType: document.mimeType,
    size: document.size,
    version: document.version,
    isCurrent: document.isCurrent,
    replacesDocumentId: document.replacesDocumentId,
    createdAt: document.createdAt,
    reviewStatus: document.reviewStatus,
    reviewNotes: document.reviewNotes,
    reviewedAt: document.reviewedAt,
    lead: {
      id: document.leadId,
      leadCode: document.leadCode,
      customerName: document.customerName,
    },
    uploadedBy: {
      name: document.uploadedByName,
      contact_person: document.uploadedByName,
      role: document.uploadedByRole,
    },
  })));
}));

adminRoutes.patch("/documents/:id/review", asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const status = String(req.body.status || "").toUpperCase();
  if (!["APPROVED", "REJECTED", "MISSING_REQUESTED", "PENDING_REVIEW"].includes(status)) {
    return res.status(400).json({ message: "Invalid document review status" });
  }
  const notes = req.body.notes ? String(req.body.notes) : null;
  const [document] = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    UPDATE "Document"
    SET "reviewStatus" = ${status},
        "reviewNotes" = ${notes},
        "reviewedById" = ${authReq.user!.id},
        "reviewedAt" = NOW()
    WHERE id = ${req.params.id}
    RETURNING *
  `;
  if (!document) return res.status(404).json({ message: "Document not found" });
  await prisma.auditLog.create({
    data: {
      actorId: authReq.user!.id,
      action: `DOCUMENT_${status}`,
      entityType: "Document",
      entityId: req.params.id,
      metadata: { notes },
    },
  });
  const lead = await prisma.lead.findUnique({
    where: { id: String(document.leadId) },
    select: { leadCode: true },
  });
  const reviewLabel = status.toLowerCase().replace(/_/g, " ");
  await prisma.notification.create({
    data: {
      userId: String(document.uploadedById),
      title: status === "APPROVED" ? "Document approved" : status === "REJECTED" ? "Document rejected" : status === "MISSING_REQUESTED" ? "Document re-upload requested" : "Document review updated",
      message: `${String(document.name)}${lead?.leadCode ? ` for ${lead.leadCode}` : ""} is ${reviewLabel}.`,
    },
  });
  res.json(document);
}));

adminRoutes.get("/settings", asyncHandler(async (_req, res) => {
  res.json({ appName: "MechPro Experts", gstPercent: 18, notificationsEnabled: true, storage: storageService.describe(), paymentProvider: "manual" });
}));
