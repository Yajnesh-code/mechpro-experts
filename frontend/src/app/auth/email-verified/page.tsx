import { StatusPage } from "@/components/auth/StatusPage";

export default function EmailVerifiedPage() {
  return (
    <StatusPage
      icon="✉"
      title="Email Verified Successfully"
      subtitle="Your MechPro Experts account email has been verified. Mobile verification is next."
      tone="purple"
      timeline={[
        { label: "Email Verified", status: "done" },
        { label: "Mobile OTP Pending", status: "current" },
        { label: "Admin Review", status: "pending" },
      ]}
      primary={{ label: "Verify Mobile →", href: "/auth/otp-verification" }}
    />
  );
}
