"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/portal/AuthLayout";
import { buttonClassName } from "@/components/portal/GradientButton";

export default function OtpVerificationPage() {
  return (
    <AuthLayout
      title="Verification Pending"
      subtitle="Your account is registered. Please complete OTP/email verification from your inbox to continue."
    >
      <div className="space-y-6">
        <div className="rounded-[18px] border border-[#e6def8] bg-[#f8f5ff] p-5 text-base font-semibold text-[#445083]">
          <div className="mb-2 inline-flex items-center gap-2 text-[#2f3d79]">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            Verification Required
          </div>
          <p>Open the verification email sent by MechPro Experts and finish the OTP flow to activate dashboard access.</p>
        </div>
        <Link
          href="/login"
          className={`flex h-[58px] items-center justify-center rounded-[18px] px-5 text-center text-lg font-bold transition ${buttonClassName("primary")}`}
        >
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

