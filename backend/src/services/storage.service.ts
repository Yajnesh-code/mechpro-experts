import type { DocumentType } from "@prisma/client";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { unlink } from "node:fs/promises";
import { env } from "../config/env.js";

if (env.storageProvider === "cloudinary") {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

const DOCUMENT_FOLDERS: Record<DocumentType, string> = {
  RC_DOCUMENT: "rc",
  VEHICLE_PHOTO: "vehicle-photos",
  INSURANCE_DOCUMENT: "insurance",
  QUOTE_DOCUMENT: "quotes",
  INVOICE_DOCUMENT: "invoices",
  SERVICE_DOCUMENT: "service-documents",
  OTHER: "other",
};

type StoredFile = {
  path: string;
  provider: "local" | "cloudinary";
  publicId?: string;
  resourceType?: string;
};

async function removeLocalTempFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Best-effort cleanup only. Upload flow should not fail because temp cleanup failed.
  }
}

export const storageService = {
  provider: env.storageProvider,

  publicPath(fileName: string) {
    return `/${env.uploadDir}/${fileName}`;
  },

  async storeLeadFile(file: Express.Multer.File, type: DocumentType): Promise<StoredFile> {
    if (env.storageProvider !== "cloudinary") {
      return {
        path: this.publicPath(file.filename),
        provider: "local",
      };
    }

    const folder = `${env.cloudinaryFolder}/${DOCUMENT_FOLDERS[type]}`;
    let result: UploadApiResponse;

    try {
      result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      });
    } finally {
      await removeLocalTempFile(file.path);
    }

    return {
      path: result.secure_url,
      provider: "cloudinary",
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  },

  describe() {
    return {
      provider: env.storageProvider,
      uploadDir: env.uploadDir,
      cloudinaryFolder: env.cloudinaryFolder,
      migrationReady: true,
    };
  },
};
