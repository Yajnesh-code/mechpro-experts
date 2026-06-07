import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { AdminModulePage } from "@/components/operations/AdminModulePage";

const items = ["Dashboard", "Leads", "Users", "Partners", "Reports", "Billing", "Settings"];

export default function Page() {
  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout sidebarItems={items} activeItem="Reports" roleLabel="Admin Dashboard">
        <AdminModulePage kind="reports" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
