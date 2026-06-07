import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const leadRepository = {
  list(where: Prisma.LeadWhereInput = {}) {
    return prisma.lead.findMany({
      where,
      include: {
        salesPartner: true,
        assignedServicePartner: true,
        timeline: { orderBy: { createdAt: "asc" }, include: { performedBy: true } },
        documents: { include: { uploadedBy: true } },
        quotations: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        salesPartner: true,
        assignedServicePartner: true,
        timeline: { orderBy: { createdAt: "asc" }, include: { performedBy: true } },
        documents: { include: { uploadedBy: true } },
        quotations: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  findByCode(leadCode: string) {
    return prisma.lead.findUnique({
      where: { leadCode },
      include: {
        salesPartner: true,
        assignedServicePartner: true,
        timeline: { orderBy: { createdAt: "asc" }, include: { performedBy: true } },
        documents: { include: { uploadedBy: true } },
        quotations: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  findByCustomerTrackingDetails(input: { searchType: "REQUEST_ID" | "VEHICLE_NUMBER"; searchValue: string; mobile: string }) {
    const searchValue = input.searchValue.trim().toUpperCase();
    return prisma.lead.findFirst({
      where: {
        customerMobile: input.mobile.trim(),
        ...(input.searchType === "REQUEST_ID" ? { leadCode: searchValue } : { vehicleNumber: searchValue }),
      },
      include: {
        salesPartner: true,
        assignedServicePartner: true,
        timeline: { orderBy: { createdAt: "asc" }, include: { performedBy: true } },
        documents: { include: { uploadedBy: true } },
        quotations: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  updateStatus(id: string, status: LeadStatus, actorId: string, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({ where: { id }, data: { status } });
      await tx.leadTimeline.create({
        data: {
          leadId: id,
          status,
          title: status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
          notes,
          performedById: actorId,
        },
      });
      await tx.auditLog.create({
        data: { actorId, action: "LEAD_STATUS_UPDATED", entityType: "Lead", entityId: id, metadata: { status, notes } },
      });
      return lead;
    });
  },
};
