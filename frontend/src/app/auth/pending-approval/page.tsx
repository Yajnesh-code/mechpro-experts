import { StatusPage } from "@/components/auth/StatusPage";

export default function PendingApprovalPage() {
  return (
    <StatusPage
      icon="◷"
      title="Account Pending Approval"
      subtitle="Your registration has been received. MechPro admin will review your business details and activate dashboard access soon."
      tone="warning"
      info="Approval typically takes 24-48 business hours. You will receive an email notification once reviewed."
      timeline={[
        { label: "Registration Submitted", status: "done", note: "May 23, 2026 · 10:32 AM" },
        { label: "Email Verified", status: "done", note: "May 23, 2026 · 10:45 AM" },
        { label: "Mobile Verified", status: "done", note: "May 23, 2026 · 10:48 AM" },
        { label: "Admin Review Pending", status: "current", note: "In progress" },
        { label: "Access Activation", status: "pending" },
      ]}
      primary={{ label: "← Back to Website", href: "/" }}
      secondary={{ label: "Contact Support", href: "/contact" }}
    />
  );
}
