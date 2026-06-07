import type { DocumentType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { storageService } from "./storage.service.js";

export const uploadService = {
  async attachLeadDocument(params: {
    leadId: string;
    uploadedById: string;
    file: Express.Multer.File;
    type: DocumentType;
    replacesDocumentId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const replaced = params.replacesDocumentId
        ? await tx.document.findFirst({
            where: { id: params.replacesDocumentId, leadId: params.leadId },
          })
        : null;

      if (replaced) {
        await tx.document.update({
          where: { id: replaced.id },
          data: { isCurrent: false },
        });
      }

      const document = await tx.document.create({
        data: {
          leadId: params.leadId,
          uploadedById: params.uploadedById,
          replacesDocumentId: replaced?.id,
          type: params.type,
          name: params.file.originalname,
          path: storageService.publicPath(params.file.filename),
          mimeType: params.file.mimetype,
          size: params.file.size,
          version: replaced ? replaced.version + 1 : 1,
          isCurrent: true,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: params.uploadedById,
          action: replaced ? "DOCUMENT_REPLACED" : "DOCUMENT_UPLOADED",
          entityType: "Document",
          entityId: document.id,
          metadata: { leadId: params.leadId, type: params.type, replacesDocumentId: replaced?.id },
        },
      });
      return document;
    });
  },
};
