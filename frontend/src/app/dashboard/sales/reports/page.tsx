import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { RoleModulePage } from "@/components/operations/RoleModulePage";

const items = ["Dashboard", "Leads", "Reports", "Settings"];

export default function Page() {
  return (
    <ProtectedRoute allowedRole="sales">
      <DashboardLayout sidebarItems={items} activeItem="Reports" roleLabel="Sales Dashboard">
        <RoleModulePage kind="reports" title="Sales Reports" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}