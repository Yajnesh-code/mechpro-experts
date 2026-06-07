import { PrismaClient, type SalesPartnerType, type ServicePartnerType, type UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = "MechPro@123";

async function upsertUser(input: {
  email: string;
  name: string;
  mobile: string;
  role: UserRole;
  companyName?: string;
  city?: string;
  salesPartnerType?: SalesPartnerType;
  vendorCode?: string;
  servicePartnerType?: ServicePartnerType;
  serviceCategories?: string[];
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: input,
    create: { ...input, passwordHash: await bcrypt.hash(password, 12) },
  });
}

async function main() {
  const admin = await upsertUser({ email: "admin@mechproexperts.in", name: "Admin User", mobile: "9000000000", role: "ADMIN", companyName: "MechPro Experts HQ", city: "Mumbai" });
  const sales = await upsertUser({ email: "sales@mechproexperts.in", name: "Rahul Sharma", mobile: "9000000001", role: "SALES_PARTNER", companyName: "AutoBridge Brokers", city: "Mumbai", salesPartnerType: "BR", vendorCode: "BR01" });
  const service = await upsertUser({ email: "service@mechproexperts.in", name: "Arun Joshi", mobile: "9000000002", role: "SERVICE_PARTNER", companyName: "SpeedFix Garage", city: "Navi Mumbai", servicePartnerType: "WORKSHOP", serviceCategories: ["Workshop"] });
  await upsertUser({ email: "customer@mechproexperts.in", name: "Rajesh Mehta", mobile: "9000000003", role: "CUSTOMER", city: "Thane" });

  await prisma.sequenceCounter.upsert({ where: { key: "VENDOR_BR" }, create: { key: "VENDOR_BR", value: 1 }, update: { value: 1 } });
  await prisma.sequenceCounter.upsert({ where: { key: "LEAD" }, create: { key: "LEAD", value: 1 }, update: { value: 1 } });

  const lead = await prisma.lead.upsert({
    where: { leadCode: "ME0001BR01" },
    update: {},
    create: {
      leadCode: "ME0001BR01",
      customerName: "Rajesh Mehta",
      customerEmail: "customer@mechproexperts.in",
      customerMobile: "9000000003",
      customerAddress: "Thane West, Maharashtra",
      vehicleNumber: "MH04AB1234",
      vehicleBrand: "BMW",
      vehicleModel: "320d",
      fuelType: "DIESEL",
      insuranceCompany: "HDFC Ergo",
      serviceType: "Accident Repair",
      services: ["Accident Repair", "Inspection"],
      priority: "HIGH",
      status: "ASSIGNED",
      location: "Thane",
      notes: "Front bumper damage and inspection required.",
      salesPartnerId: sales.id,
      assignedServicePartnerId: service.id,
    },
  });

  await prisma.leadTimeline.createMany({
    data: [
      { leadId: lead.id, status: "LEAD_CREATED", title: "Lead Created", notes: "Seed lead created", performedById: sales.id },
      { leadId: lead.id, status: "ASSIGNED", title: "Assigned", notes: "Assigned to SpeedFix Garage", performedById: admin.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. Default password for all seed users:", password);
}

main().finally(async () => prisma.$disconnect());
