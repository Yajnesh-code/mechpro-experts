import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadsTable } from "@/components/operations/LeadTables";

const items = ["Dashboard", "Leads", "Reports", "Settings"];

export default function SalesLeadsPage() {
  return (
    <ProtectedRoute allowedRole="sales">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Sales Partner Dashboard">
        <LeadsTable role="sales" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


