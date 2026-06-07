import type { SalesPartnerType, ServicePartnerType, UserRole } from "@prisma/client";
import { userRepository } from "../repositories/user.repository.js";
import { badRequest, forbidden } from "../utils/errors.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { serializeUser } from "../utils/serializers.js";
import { prisma } from "../config/prisma.js";
import type { JwtPayload } from "../types/auth.js";

function normalizeRole(role?: string): UserRole {
  if (!role) return "CUSTOMER";
  const normalized = role.toLowerCase();
  if (normalized === "admin") return "ADMIN";
  if (normalized === "sales" || normalized === "sales_partner") return "SALES_PARTNER";
  if (normalized === "service" || normalized === "service_partner" || normalized === "workshop") return "SERVICE_PARTNER";
  if (normalized === "customer") return "CUSTOMER";
  return role as UserRole;
}

function normalizeServiceType(type?: string): ServicePartnerType | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase().replace(/[\s_-]/g, "");
  if (["workshop"].includes(normalized)) return "WORKSHOP";
  if (["partvendor", "battery", "tyre", "batteryandtyre"].includes(normalized)) return "PART_VENDOR";
  if (["towing", "towingservice"].includes(normalized)) return "TOWING_SERVICE";
  if (["alphago"].includes(normalized)) return "ALPHA_GO";
  return undefined;
}

async function nextVendorCode(type: SalesPartnerType) {
  const key = `VENDOR_${type}`;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const counter = await prisma.sequenceCounter.upsert({
      where: { key },
      create: { key, value: 1 },
      update: { value: { increment: 1 } },
    });
    const vendorCode = `${type}${String(counter.value).padStart(2, "0")}`;
    const existing = await prisma.user.findUnique({ where: { vendorCode } });
    if (!existing) return vendorCode;
  }
  throw badRequest("Unable to generate a unique vendor code. Please try again.");
}

export const authService = {
  async register(input: Record<string, unknown>) {
    const email = String(input.email).trim().toLowerCase();
    const mobile = input.mobile ?? input.phone;
    const name = String(input.name ?? input.fullName ?? input.contact_person ?? "").trim();
    const role = normalizeRole(input.role as string | undefined);

    if (!name) throw badRequest("Name is required");

    const duplicate = await userRepository.findDuplicate(email, mobile ? String(mobile) : undefined);
    if (duplicate) throw badRequest("Account already exists with this email or mobile number.");

    const salesType = (input.salesPartnerType ?? input.partnerType) as SalesPartnerType | undefined;
    if (role === "SALES_PARTNER" && !salesType) throw badRequest("Sales partner type is required");
    if (role === "SALES_PARTNER" && salesType === "GT") {
      throw badRequest("Guest is a customer request source, not a sales partner type.");
    }
    const vendorCode = role === "SALES_PARTNER" && salesType ? await nextVendorCode(salesType) : undefined;
    const serviceType = normalizeServiceType((input.servicePartnerType ?? input.category) as string | undefined);

    const user = await userRepository.create({
      name,
      email,
      mobile: mobile ? String(mobile) : undefined,
      passwordHash: await hashPassword(String(input.password)),
      role,
      companyName: (input.companyName ?? input.company_name ?? input.company) ? String(input.companyName ?? input.company_name ?? input.company) : undefined,
      city: input.city ? String(input.city) : undefined,
      address: input.address ? String(input.address) : undefined,
      salesPartnerType: role === "SALES_PARTNER" ? salesType : undefined,
      vendorCode,
      servicePartnerType: role === "SERVICE_PARTNER" ? serviceType : undefined,
      serviceCategories: role === "SERVICE_PARTNER" && input.category ? [String(input.category)] : [],
      gstOrLicense: input.gstOrLicense || input.gst_license ? String(input.gstOrLicense ?? input.gst_license) : undefined,
    });

    await prisma.auditLog.create({
      data: { actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id, metadata: { role } },
    });

    return serializeUser(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw forbidden("Invalid credentials");
    }
    if (user.status !== "ACTIVE") throw forbidden("Account is not active.");

    const payload: JwtPayload = { sub: user.id, id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await userRepository.updateRefreshTokenHash(user.id, await hashPassword(refreshToken));

    await prisma.auditLog.create({ data: { actorId: user.id, action: "USER_LOGIN", entityType: "User", entityId: user.id } });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer" as const,
      expires_in: 900,
      user: serializeUser(user),
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash || !(await verifyPassword(refreshToken, user.refreshTokenHash))) {
      throw forbidden("Invalid refresh token");
    }

    const nextPayload: JwtPayload = { sub: user.id, id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(nextPayload);
    const nextRefreshToken = signRefreshToken(nextPayload);
    await userRepository.updateRefreshTokenHash(user.id, await hashPassword(nextRefreshToken));

    return {
      access_token: accessToken,
      refresh_token: nextRefreshToken,
      token_type: "bearer" as const,
      expires_in: 900,
      user: serializeUser(user),
    };
  },

  async logout(userId: string) {
    await userRepository.updateRefreshTokenHash(userId, null);
    return { message: "Logged out successfully" };
  },
};
