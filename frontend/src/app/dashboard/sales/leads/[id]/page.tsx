import { DashboardLayout } from "@/components/portal/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/portal/ProtectedRoute";
import { LeadDetailView } from "@/components/operations/LeadDetailView";

const items = ["Dashboard", "Leads", "Reports", "Settings"];

export default async function SalesLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute allowedRole="sales">
      <DashboardLayout sidebarItems={items} activeItem="Leads" roleLabel="Sales Partner Dashboard">
        <LeadDetailView id={id} role="sales" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

