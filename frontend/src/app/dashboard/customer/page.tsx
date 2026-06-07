import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { OperationsOverview } from "@/components/operations/OperationsOverview";

const items = ["Dashboard", "Leads", "Billing", "Settings"];

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <DashboardLayout sidebarItems={items} activeItem="Dashboard" roleLabel="Customer Dashboard">
        <OperationsOverview role="customer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


