import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadCreateForm } from "@/components/operations/LeadCreateForm";

const items = ["Dashboard", "Leads", "Reports", "Settings"];

export default function SalesLeadCreatePage() {
  return (
    <ProtectedRoute allowedRole="sales">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Sales Partner Dashboard">
        <LeadCreateForm />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


