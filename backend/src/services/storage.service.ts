import type { DocumentType } from "@prisma/client";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

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

function cloudinaryPublicIdFromUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const parts = url.pathname.split("/upload/");
    if (parts.length < 2 || !parts[1]) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    return decodeURIComponent(withoutVersion).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

function cloudinaryErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String((error as { message?: unknown }).message);
  return "Unknown Cloudinary error";
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
    } catch (error) {
      throw new AppError(502, `Cloudinary upload failed: ${cloudinaryErrorMessage(error)}`);
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

  async deleteFile(filePathOrUrl: string) {
    if (!filePathOrUrl) return { deleted: false };
    if (env.storageProvider === "cloudinary" || filePathOrUrl.startsWith("http")) {
      const publicId = cloudinaryPublicIdFromUrl(filePathOrUrl);
      if (!publicId) return { deleted: false };
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        return { deleted: true, publicId };
      } catch {
        return { deleted: false, publicId };
      }
    }

    const localFileName = filePathOrUrl.replace(/^\/+/, "").replace(new RegExp(`^${env.uploadDir}/`), "");
    const localPath = path.resolve(process.cwd(), env.uploadDir, localFileName);
    await removeLocalTempFile(localPath);
    return { deleted: true };
  },

  describe() {
    return {
      provider: env.storageProvider,
      uploadDir: env.uploadDir,
      cloudinaryFolder: env.cloudinaryFolder,
      cloudinaryConfigured: Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret),
      migrationReady: true,
    };
  },

  async healthCheck() {
    if (env.storageProvider !== "cloudinary") {
      return { ok: true, provider: env.storageProvider, message: "Local upload storage is active." };
    }

    try {
      await cloudinary.api.ping();
      return { ok: true, provider: "cloudinary", message: "Cloudinary credentials are valid." };
    } catch (error) {
      return {
        ok: false,
        provider: "cloudinary",
        message: cloudinaryErrorMessage(error),
      };
    }
  },
};
