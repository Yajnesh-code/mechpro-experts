import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { OperationsOverview } from "@/components/operations/OperationsOverview";
import { adminSidebarItems } from "@/lib/portal-data";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout sidebarItems={adminSidebarItems} activeItem="Dashboard" roleLabel="Admin Dashboard">
        <OperationsOverview role="admin" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

