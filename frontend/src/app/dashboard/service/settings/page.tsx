import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { RoleModulePage } from "@/components/operations/RoleModulePage";

const items = ["Dashboard", "Leads", "Reports", "Billing", "Settings"];

export default function Page() {
  return (
    <ProtectedRoute allowedRole="service">
      <DashboardLayout sidebarItems={items} activeItem="Settings" roleLabel="Service Dashboard">
        <RoleModulePage kind="settings" title="Service Settings" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}