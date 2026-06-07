"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/portal/AuthLayout";
import { GradientButton } from "@/components/portal/GradientButton";
import { InputField } from "@/components/portal/InputField";
import { PasswordField } from "@/components/portal/PasswordField";
import { authApi } from "@/lib/api";

const schema = z
  .object({
    token: z.string().min(8, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [tokenFromUrl, setTokenFromUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  const password = watch("newPassword") ?? "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setTokenFromUrl(params.get("token") ?? "");
  }, []);

  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl);
    }
  }, [setValue, tokenFromUrl]);

  const strength = useMemo(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const points = [password.length >= 8, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    if (points <= 1) return { label: "Weak", width: "25%", color: "bg-red-500" };
    if (points <= 3) return { label: "Medium", width: "60%", color: "bg-amber-500" };
    return { label: "Strong", width: "100%", color: "bg-emerald-500" };
  }, [password]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setStatusMessage(null);
    try {
      const response = await authApi.resetPassword({
        token: values.token,
        password: values.newPassword,
        confirm_password: values.confirmPassword,
      });
      setStatusMessage(response.message);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to reset password right now.");
    }
  });

  return (
    <AuthLayout title="Reset Password" subtitle="Set a new password for your account and secure your MechPro Experts access.">
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <InputField<FormValues>
          name="token"
          label="Reset Token"
          placeholder="Paste reset token"
          register={register}
          error={errors.token}
          icon={KeyRound}
        />

        <PasswordField<FormValues> name="newPassword" label="New Password" placeholder="Enter new password" register={register} error={errors.newPassword} />

        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#556094] sm:text-sm">
            <span>Password strength</span>
            <span>{strength.label}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#ebe5fb]">
            <div className={`h-3 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
          </div>
        </div>

        <PasswordField<FormValues> name="confirmPassword" label="Confirm New Password" placeholder="Confirm password" register={register} error={errors.confirmPassword} />

        <div className="rounded-[16px] border border-[#e6def8] bg-[#f8f5ff] p-3 text-sm font-semibold leading-6 text-[#445083] sm:rounded-[18px] sm:p-4 sm:text-base">
          Password must contain at least 8 characters, one uppercase letter, one number, and one special character.
        </div>

        {statusMessage ? (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {statusMessage}
          </div>
        ) : null}
        {submitError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        ) : null}

        <GradientButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </GradientButton>

        <p className="text-center text-sm font-semibold text-[#4f5a8d] sm:text-base">
          Remember your password?{" "}
          <Link href="/login" className="text-sm font-black text-violet-600 hover:text-fuchsia-500 sm:text-base">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
