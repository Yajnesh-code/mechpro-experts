"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/portal/AuthLayout";
import { GradientButton, buttonClassName } from "@/components/portal/GradientButton";
import { InputField } from "@/components/portal/InputField";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
    setStatusMessage(null);
    try {
      const response = await authApi.forgotPassword({ email: values.email.trim().toLowerCase() });
      setStatusMessage(response.message);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to send reset link right now.");
    }
  });

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address and we'll send a reset link to secure your account."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <InputField<FormValues>
          name="email"
          label="Email Address"
          placeholder="Enter email address"
          register={register}
          error={errors.email}
          icon={Mail}
          type="email"
        />
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
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </GradientButton>
        <Link
          href="/login"
          className={`flex h-[54px] items-center justify-center rounded-[16px] px-5 text-center text-base font-bold transition ${buttonClassName("ghost")}`}
        >
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
}
