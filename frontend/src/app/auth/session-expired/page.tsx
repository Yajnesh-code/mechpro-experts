import { StatusPage } from "@/components/auth/StatusPage";

export default function SessionExpiredPage() {
  return (
    <StatusPage
      icon="⊘"
      title="Session Expired"
      subtitle="For your security, your session has expired. Please login again to continue."
      tone="purple"
      info="Sessions expire after 8 hours of inactivity to protect your account."
      primary={{ label: "Login Again", href: "/auth/login" }}
    />
  );
}
