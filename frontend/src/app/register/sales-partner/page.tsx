"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/portal/AuthLayout";
import { GradientButton, buttonClassName } from "@/components/portal/GradientButton";
import { InputField } from "@/components/portal/InputField";
import { PasswordField } from "@/components/portal/PasswordField";
import { useToast } from "@/context/ToastContext";
import { authApi } from "@/lib/api";
import { isStrongPassword, normalizePhone } from "@/lib/authStore";
import { cityOptions, salesPartnerTypes } from "@/lib/portal-data";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    contactNumber: z.string().min(10, "Contact number is required").regex(/^[+\d][\d\s-]{8,16}$/, "Enter a valid mobile number"),
    email: z.string().email("Enter a valid email"),
    companyName: z.string().min(2, "Company name is required"),
    partnerType: z.string().min(2, "Select a partner type"),
    city: z.string().min(2, "Select city"),
    address: z.string().min(6, "Address is required"),
    password: z.string().min(8, "Password must be at least 8 characters").refine(isStrongPassword, "Use uppercase, number, and special character"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const salesTypeToBusinessRole: Record<string, "broker" | "corporate" | "fleet" | "insurance"> = {
  BR: "broker",
  CR: "corporate",
  FT: "fleet",
  AG: "broker",
  IN: "insurance",
  IS: "corporate",
};

export default function SalesPartnerRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const normalizedEmail = values.email.trim().toLowerCase();

    try {
      await authApi.register({
        company_name: values.companyName,
        contact_person: values.fullName,
        email: normalizedEmail,
        phone: normalizePhone(values.contactNumber),
        password: values.password,
        confirm_password: values.confirmPassword,
        role: "sales",
        partnerType: values.partnerType,
        business_type: salesTypeToBusinessRole[values.partnerType] ?? "corporate",
        city: values.city,
        address: values.address,
      });

      toast("success", "Registration successful. Login with Sales Partner role.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete registration.";
      setSubmitError(message);
      toast("error", message);
    }
  });

  return (
    <AuthLayout title="Sales Partner Registration" subtitle="For B2B partners and internal sales teams. Guest customers should use Customer Registration." heroRole="sales">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <InputField<FormValues> name="fullName" label="Full Name" placeholder="Enter full name" register={register} error={errors.fullName} icon={User} />
          <InputField<FormValues> name="contactNumber" label="Contact Number" placeholder="Enter contact number" register={register} error={errors.contactNumber} icon={Phone} />
          <InputField<FormValues> name="email" label="Email" placeholder="Enter email address" register={register} error={errors.email} icon={Mail} type="email" />
          <InputField<FormValues> name="companyName" label="Company Name" placeholder="Enter company name" register={register} error={errors.companyName} icon={Building2} />
          <label className="block">
            <span className="mb-1.5 block text-[16px] font-extrabold text-[#11153d]">Partner Type</span>
            <select {...register("partnerType")} className="h-[54px] w-full rounded-[16px] border border-[#d8cef2] bg-white px-4 text-base font-semibold text-[#1a1e4f] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70">
              <option value="">Select partner type</option>
              {salesPartnerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.partnerType && <p className="mt-1 text-sm font-semibold text-red-500">{errors.partnerType.message}</p>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[16px] font-extrabold text-[#11153d]">City</span>
            <select {...register("city")} className="h-[54px] w-full rounded-[16px] border border-[#d8cef2] bg-white px-4 text-base font-semibold text-[#1a1e4f] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70">
              <option value="">Select city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && <p className="mt-1 text-sm font-semibold text-red-500">{errors.city.message}</p>}
          </label>
          <InputField<FormValues> name="address" label="Address" placeholder="Enter complete address" register={register} error={errors.address} icon={MapPin} />
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
            <PasswordField<FormValues> name="password" label="Password" placeholder="Create password" register={register} error={errors.password} />
            <PasswordField<FormValues> name="confirmPassword" label="Confirm Password" placeholder="Confirm password" register={register} error={errors.confirmPassword} />
          </div>
        </div>

        {submitError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        ) : null}

        <GradientButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </GradientButton>

        <Link href="/login" className={`flex h-[54px] items-center justify-center rounded-[16px] px-5 text-center text-base font-bold transition ${buttonClassName("ghost")}`}>
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
}
