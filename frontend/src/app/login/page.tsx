"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/portal/AuthLayout";
import { GradientButton, buttonClassName } from "@/components/portal/GradientButton";
import { InputField } from "@/components/portal/InputField";
import { PasswordField } from "@/components/portal/PasswordField";
import { RoleSelector } from "@/components/portal/RoleSelector";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { findUserByIdentifier, roleToDashboardPath } from "@/lib/authStore";
import type { PortalRole } from "@/lib/portal-data";

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter email or mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
  role: z.enum(["admin", "sales", "service", "customer"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true,
      role: "admin",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const identifier = values.identifier.trim();
    const normalizedIdentifier = identifier.toLowerCase();
    const localAccount = findUserByIdentifier(identifier);

    if (!normalizedIdentifier.includes("@") && !localAccount) {
      const message = "Account not found.";
      setSubmitError(message);
      toast("error", message);
      return;
    }

    try {
      const session = await login({
        email: localAccount?.email ?? normalizedIdentifier,
        password: values.password,
        selectedRole: values.role,
        remember: values.rememberMe,
      });
      toast("success", "Login successful. Redirecting to your dashboard...");
      router.push(roleToDashboardPath(session.role));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to login right now.";
      setSubmitError(message);
      toast("error", message);
    }
  });

  return (
    <AuthLayout
      title="Login to MechPro Experts"
      subtitle="Access your role dashboard for claims, leads, approvals, and service tracking."
      heroRole={selectedRole}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField<LoginFormValues>
          name="identifier"
          label="Email or Mobile Number"
          placeholder="Enter email or mobile number"
          register={register}
          error={errors.identifier}
          icon={watch("identifier").includes("@") ? Mail : Phone}
        />

        <PasswordField<LoginFormValues>
          name="password"
          label="Password"
          placeholder="Enter password"
          register={register}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm font-semibold text-[#4f5a8d]">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-violet-600" {...register("rememberMe")} />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-base font-bold text-violet-600 hover:text-fuchsia-500">
            Forgot Password?
          </Link>
        </div>

        <RoleSelector value={selectedRole} onChange={(role) => setValue("role", role as PortalRole, { shouldValidate: true })} />

        {submitError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        ) : null}

        <GradientButton type="submit" disabled={isSubmitting} className="group">
          {isSubmitting ? "Logging in..." : "Login"}
        </GradientButton>

        <button type="button" className={`h-[54px] w-full rounded-[16px] px-5 text-base font-bold transition ${buttonClassName("ghost")}`}>
          Continue with Google
        </button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link href="/register/sales-partner" className={`flex h-[54px] items-center justify-center rounded-[16px] px-4 text-center text-base font-bold transition ${buttonClassName("secondary")}`}>
            Sales Register
          </Link>
          <Link href="/register/service-partner" className={`flex h-[54px] items-center justify-center rounded-[16px] px-4 text-center text-base font-bold transition ${buttonClassName("ghost")}`}>
            Service Register
          </Link>
          <Link href="/register/customer" className={`flex h-[54px] items-center justify-center rounded-[16px] px-4 text-center text-base font-bold transition ${buttonClassName("ghost")}`}>
            Customer Register
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
