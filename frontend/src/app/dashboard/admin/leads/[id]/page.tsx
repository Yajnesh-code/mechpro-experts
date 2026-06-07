import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadDetailView } from "@/components/operations/LeadDetailView";
import { adminSidebarItems } from "@/lib/portal-data";

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout sidebarItems={adminSidebarItems} activeItem="Leads" roleLabel="Admin Dashboard">
        <LeadDetailView id={id} role="admin" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

