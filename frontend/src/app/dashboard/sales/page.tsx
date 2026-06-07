import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { OperationsOverview } from "@/components/operations/OperationsOverview";

const items = ["Dashboard", "Leads", "Reports", "Settings"];

export default function SalesDashboardPage() {
  return (
    <ProtectedRoute allowedRole="sales">
      <DashboardLayout sidebarItems={items} activeItem="Dashboard" roleLabel="Sales Partner Dashboard">
        <OperationsOverview role="sales" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


