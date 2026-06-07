import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadDetailView } from "@/components/operations/LeadDetailView";

const items = ["Dashboard", "Leads", "Billing", "Settings"];

export default async function CustomerLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute allowedRole="customer">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Customer Dashboard">
        <LeadDetailView id={id} role="customer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
