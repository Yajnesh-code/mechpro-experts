"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileBadge2, Mail, MapPin, Phone, User } from "lucide-react";
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
import { cityOptions, servicePartnerCategories } from "@/lib/portal-data";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    contact: z.string().min(10, "Contact number is required").regex(/^[+\d][\d\s-]{8,16}$/, "Enter a valid mobile number"),
    email: z.string().email("Enter a valid email"),
    workshopName: z.string().min(2, "Workshop or company name is required"),
    category: z.string().min(2, "Select partner category"),
    city: z.string().min(2, "Select city"),
    address: z.string().min(6, "Address is required"),
    gstLicense: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").refine(isStrongPassword, "Use uppercase, number, and special character"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ServicePartnerRegisterPage() {
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
        company_name: values.workshopName,
        contact_person: values.fullName,
        email: normalizedEmail,
        phone: normalizePhone(values.contact),
        password: values.password,
        confirm_password: values.confirmPassword,
        role: "service",
        category: values.category,
        business_type: "workshop",
        city: values.city,
        address: values.address,
        gst_number: values.gstLicense || undefined,
      });

      toast("success", "Registration successful. Login with Service Partner role.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete registration.";
      setSubmitError(message);
      toast("error", message);
    }
  });

  return (
    <AuthLayout title="Service Partner Registration" subtitle="Create your account and start receiving assigned service requests from MechPro Experts." heroRole="service">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <InputField<FormValues> name="fullName" label="Full Name" placeholder="Enter full name" register={register} error={errors.fullName} icon={User} />
          <InputField<FormValues> name="contact" label="Contact" placeholder="Enter contact number" register={register} error={errors.contact} icon={Phone} />
          <InputField<FormValues> name="email" label="Email" placeholder="Enter email address" register={register} error={errors.email} icon={Mail} type="email" />
          <InputField<FormValues> name="workshopName" label="Workshop / Company Name" placeholder="Enter workshop name" register={register} error={errors.workshopName} icon={Building2} />
          <label className="block">
            <span className="mb-1.5 block text-[16px] font-extrabold text-[#11153d]">Partner Category</span>
            <select {...register("category")} className="h-[54px] w-full rounded-[16px] border border-[#d8cef2] bg-white px-4 text-base font-semibold text-[#1a1e4f] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70">
              <option value="">Select partner category</option>
              {servicePartnerCategories.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm font-semibold text-red-500">{errors.category.message}</p>}
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
          <InputField<FormValues> name="gstLicense" label="GST / License (optional)" placeholder="Enter GST / License number" register={register} error={errors.gstLicense} icon={FileBadge2} />
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
