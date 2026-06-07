import type { User, UserRole } from "@prisma/client";

export function toApiRole(role: UserRole) {
  if (role === "ADMIN") return "admin";
  if (role === "SALES_PARTNER") return "sales";
  if (role === "SERVICE_PARTNER") return "service";
  return "customer";
}

export function serializeUser(user: Pick<User, "id" | "name" | "email" | "mobile" | "role" | "status" | "companyName" | "city">) {
  return {
    id: user.id,
    company_name: user.companyName ?? "",
    contact_person: user.name,
    email: user.email,
    phone: user.mobile ?? "",
    role: toApiRole(user.role),
    status: user.status.toLowerCase(),
    city: user.city ?? "",
    email_verified: true,
    mobile_verified: Boolean(user.mobile),
  };
}
