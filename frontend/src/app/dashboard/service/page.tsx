import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { OperationsOverview } from "@/components/operations/OperationsOverview";

const items = ["Dashboard", "Leads", "Reports", "Billing", "Settings"];

export default function ServiceDashboardPage() {
  return (
    <ProtectedRoute allowedRole="service">
      <DashboardLayout sidebarItems={items} activeItem="Dashboard" roleLabel="Service Partner Dashboard">
        <OperationsOverview role="service" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


