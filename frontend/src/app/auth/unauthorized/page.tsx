import { StatusPage } from "@/components/auth/StatusPage";

export default function UnauthorizedPage() {
  return (
    <StatusPage
      icon="🔒"
      title="Access Restricted"
      subtitle="You do not have permission to view this workspace."
      tone="danger"
      reasons={["Account not yet approved by admin", "Account suspended or rejected", "Role mismatch for this section", "Session expired"]}
      primary={{ label: "Go to My Dashboard", href: "/dashboard/business" }}
      secondary={{ label: "Logout", href: "/auth/login" }}
    />
  );
}
