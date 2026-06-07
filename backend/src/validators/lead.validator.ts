import { z } from "zod";

export const createLeadSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerMobile: z.string().min(7),
  customerAddress: z.string().optional(),
  vehicleNumber: z.string().min(3),
  vehicleBrand: z.string().min(1),
  vehicleModel: z.string().min(1),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "ELECTRIC", "HYBRID"]).optional(),
  vehicleYear: z.number().int().optional(),
  vehicleColor: z.string().optional(),
  insuranceCompany: z.string().optional(),
  serviceType: z.string().min(1),
  services: z.array(z.string()).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  location: z.string().min(1),
  notes: z.string().optional(),
});

export const assignLeadSchema = z.object({
  servicePartnerId: z.string().min(1),
  notes: z.string().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum([
    "LEAD_CREATED",
    "ASSIGNED",
    "CAR_RECEIVED",
    "INSPECTION_STARTED",
    "INSPECTION_COMPLETED",
    "QUOTE_SHARED",
    "QUOTE_APPROVED",
    "WORK_STARTED",
    "WORK_COMPLETED",
    "BILL_GENERATED",
    "PAYMENT_DONE",
    "VEHICLE_DELIVERED",
  ]),
  notes: z.string().optional(),
});

const amountItem = z.object({ description: z.string().min(1), amount: z.number().positive() });

export const createQuotationSchema = z.object({
  amount: z.number().positive(),
  items: z.array(amountItem).min(1),
});

export const createInvoiceSchema = z.object({
  amount: z.number().positive(),
  gst: z.number().min(0).default(0),
  total: z.number().positive(),
  items: z.array(amountItem).min(1),
});

export const quoteDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "REVISION_REQUESTED"]),
  notes: z.string().optional(),
});

export const paymentUpdateSchema = z.object({
  paymentMode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "INSURANCE_SETTLEMENT", "OTHER"]).optional(),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export const customerTrackSchema = z.object({
  searchType: z.enum(["REQUEST_ID", "VEHICLE_NUMBER"]),
  searchValue: z.string().min(3),
  mobile: z.string().regex(/^\d{10}$/, "Registered mobile number must be 10 digits"),
});
