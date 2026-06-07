import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadCreateForm } from "@/components/operations/LeadCreateForm";

const items = ["Dashboard", "Leads", "Billing", "Settings"];

export default function CustomerCreateServiceRequestPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Customer Dashboard">
        <LeadCreateForm actor="customer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
