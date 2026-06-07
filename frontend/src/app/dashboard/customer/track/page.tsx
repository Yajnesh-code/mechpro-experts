import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { CustomerLeadSearch } from "@/components/operations/CustomerLeadSearch";

const items = ["Dashboard", "Leads", "Billing", "Settings"];

export default function CustomerTrackPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Customer Dashboard">
        <CustomerLeadSearch />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

