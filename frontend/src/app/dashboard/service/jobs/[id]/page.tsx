import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadDetailView } from "@/components/operations/LeadDetailView";

const items = ["Dashboard", "Leads", "Reports", "Billing", "Settings"];

export default async function ServiceJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute allowedRole="service">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Service Partner Dashboard">
        <LeadDetailView id={id} role="service" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

