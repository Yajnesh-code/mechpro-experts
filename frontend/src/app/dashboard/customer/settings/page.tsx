import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { RoleModulePage } from "@/components/operations/RoleModulePage";

const items = ["Dashboard", "Leads", "Billing", "Settings"];

export default function Page() {
  return (
    <ProtectedRoute allowedRole="customer">
      <DashboardLayout sidebarItems={items} activeItem="Settings" roleLabel="Customer Dashboard">
        <RoleModulePage kind="settings" title="Customer Settings" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}