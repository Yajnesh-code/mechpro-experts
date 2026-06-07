import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadsTable } from "@/components/operations/LeadTables";

const items = ["Dashboard", "Leads", "Reports", "Billing", "Settings"];

export default function ServiceJobsPage() {
  return (
    <ProtectedRoute allowedRole="service">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Service Partner Dashboard">
        <LeadsTable role="service" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}


