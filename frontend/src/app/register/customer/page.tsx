"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Mail, MapPin, Phone, User } from "lucide-react";
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
import { cityOptions } from "@/lib/portal-data";

const vehicleNumberRegex = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}$/i;

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    mobileNumber: z.string().min(10, "Mobile number is required").regex(/^[+\d][\d\s-]{8,16}$/, "Enter a valid mobile number"),
    email: z.string().email("Enter a valid email"),
    vehicleNumber: z.string().min(6, "Vehicle number is required").regex(vehicleNumberRegex, "Enter a valid vehicle number"),
    city: z.string().min(2, "Select city"),
    password: z.string().min(8, "Password must be at least 8 characters").refine(isStrongPassword, "Use uppercase, number, and special character"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function CustomerRegisterPage() {
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
        contact_person: values.fullName,
        email: normalizedEmail,
        phone: normalizePhone(values.mobileNumber),
        password: values.password,
        confirm_password: values.confirmPassword,
        role: "customer",
        company_name: values.vehicleNumber.trim().toUpperCase(),
        city: values.city,
      });

      toast("success", "Customer registration successful. Login with Customer role.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete customer registration.";
      setSubmitError(message);
      toast("error", message);
    }
  });

  return (
    <AuthLayout title="Customer Registration" subtitle="Create your account to track service status, payments, and assigned partner updates." heroRole="customer">
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <InputField<FormValues> name="fullName" label="Full Name" placeholder="Enter full name" register={register} error={errors.fullName} icon={User} />
          <InputField<FormValues> name="mobileNumber" label="Mobile Number" placeholder="Enter mobile number" register={register} error={errors.mobileNumber} icon={Phone} />
          <InputField<FormValues> name="email" label="Email" placeholder="Enter email address" register={register} error={errors.email} icon={Mail} type="email" />
          <InputField<FormValues> name="vehicleNumber" label="Vehicle Number" placeholder="MH 04 AB 1234" register={register} error={errors.vehicleNumber} icon={Car} />
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[14px] font-extrabold text-[#11153d] sm:text-[16px]">City</span>
            <select {...register("city")} className="h-[50px] w-full rounded-[15px] border border-[#d8cef2] bg-white px-3.5 text-[15px] font-semibold text-[#1a1e4f] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70 sm:h-[54px] sm:rounded-[16px] sm:px-4 sm:text-base">
              <option value="">Select city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && <p className="mt-1 text-sm font-semibold text-red-500">{errors.city.message}</p>}
          </label>
          <div className="grid gap-4 md:col-span-2 sm:grid-cols-2">
            <PasswordField<FormValues> name="password" label="Password" placeholder="Create password" register={register} error={errors.password} />
            <PasswordField<FormValues> name="confirmPassword" label="Confirm Password" placeholder="Confirm password" register={register} error={errors.confirmPassword} />
          </div>
        </div>

        <div className="rounded-[16px] border border-[#e8ddfb] bg-[#fbf8ff] px-4 py-3 text-sm font-semibold leading-6 text-[#536097]">
          Customer registration is currently frontend-only for this auth phase. Backend customer APIs can be connected in the next phase.
        </div>

        {submitError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        ) : null}

        <GradientButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Register as Customer"}
        </GradientButton>

        <Link href="/login" className={`flex h-[50px] items-center justify-center rounded-[15px] px-4 text-center text-[15px] font-bold transition sm:h-[54px] sm:rounded-[16px] sm:px-5 sm:text-base ${buttonClassName("ghost")}`}>
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
}
