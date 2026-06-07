import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  name: z.string().min(2).optional(),
  fullName: z.string().min(2).optional(),
  contact_person: z.string().min(2).optional(),
  email: z.string().email(),
  mobile: z.string().min(7).optional(),
  phone: z.string().min(7).optional(),
  password,
  role: z.enum(["admin", "sales", "service", "customer", "ADMIN", "SALES_PARTNER", "SERVICE_PARTNER", "CUSTOMER"]).optional(),
  companyName: z.string().optional(),
  company_name: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  partnerType: z.enum(["BR", "CR", "FT", "AG", "IN", "IS"]).optional(),
  salesPartnerType: z.enum(["BR", "CR", "FT", "AG", "IN", "IS"]).optional(),
  category: z.string().optional(),
  servicePartnerType: z.string().optional(),
  gstOrLicense: z.string().optional(),
  gst_license: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember_me: z.boolean().optional(),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password,
  confirm_password: z.string().min(1),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match",
});
