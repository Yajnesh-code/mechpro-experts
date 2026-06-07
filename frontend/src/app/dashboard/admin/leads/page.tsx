import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadsTable } from "@/components/operations/LeadTables";
import { adminSidebarItems } from "@/lib/portal-data";

export default function AdminLeadsPage() {
  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout sidebarItems={adminSidebarItems} activeItem="Leads" roleLabel="Admin Dashboard">
        <LeadsTable role="admin" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

