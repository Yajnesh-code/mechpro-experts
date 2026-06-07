import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearUploads() {
  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const resolved = path.resolve(process.cwd(), uploadDir);
  const backendRoot = path.resolve(process.cwd());

  if (!resolved.startsWith(backendRoot)) {
    throw new Error(`Refusing to clear upload directory outside backend: ${resolved}`);
  }

  await fs.promises.mkdir(resolved, { recursive: true });
  const entries = await fs.promises.readdir(resolved, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    const target = path.join(resolved, entry.name);
    try {
      await fs.promises.rm(target, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Skipped locked upload file: ${target}`);
    }
  }
}

async function main() {
  await prisma.$transaction([
    prisma.document.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.leadTimeline.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.sequenceCounter.upsert({
      where: { key: "LEAD" },
      create: { key: "LEAD", value: 0 },
      update: { value: 0 },
    }),
  ]);

  await clearUploads();

  console.log("Demo reset complete.");
  console.log("Kept demo users. Deleted leads, timelines, documents, quotes, invoices, notifications, audit logs, and unlocked uploaded files.");
  console.log("Next sales lead will start from ME0001 + vendor code.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
