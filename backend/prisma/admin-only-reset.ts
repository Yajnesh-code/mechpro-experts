import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const adminEmail = "admin@mechproexperts.in";
const adminPassword = "MechPro@123";

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
    } catch {
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
    prisma.user.deleteMany({ where: { email: { not: adminEmail } } }),
    prisma.sequenceCounter.deleteMany(),
  ]);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin User",
      mobile: "9000000000",
      role: "ADMIN",
      status: "ACTIVE",
      companyName: "MechPro Experts HQ",
      city: "Mumbai",
      address: null,
      salesPartnerType: null,
      vendorCode: null,
      servicePartnerType: null,
      serviceCategories: [],
      gstOrLicense: null,
      refreshTokenHash: null,
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      mobile: "9000000000",
      role: "ADMIN",
      status: "ACTIVE",
      companyName: "MechPro Experts HQ",
      city: "Mumbai",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  await prisma.sequenceCounter.createMany({
    data: [
      { key: "LEAD", value: 0 },
      { key: "VENDOR_BR", value: 0 },
      { key: "VENDOR_CR", value: 0 },
      { key: "VENDOR_FT", value: 0 },
      { key: "VENDOR_AG", value: 0 },
      { key: "VENDOR_IN", value: 0 },
      { key: "VENDOR_GT", value: 0 },
    ],
  });

  await clearUploads();

  console.log("Admin-only reset complete.");
  console.log(`Kept/recreated admin: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log("Deleted all other users, leads, documents, quotes, invoices, timelines, notifications, audit logs, sequence counters, and uploads.");
  console.log("Register Sales Partner, Service Partner, and Customer from the UI for fresh testing.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
