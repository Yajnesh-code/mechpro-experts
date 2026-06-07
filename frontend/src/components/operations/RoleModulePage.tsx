"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { formatMoney, formatShortDate } from "@/lib/operations";

type RoleModuleKind = "reports" | "billing" | "settings";

type RoleModulePageProps = {
  kind: RoleModuleKind;
  title: string;
};

export function RoleModulePage({ kind, title }: RoleModulePageProps) {
  const { session } = useAuth();
  const { leads, loading, error, refetch } = useLeads();

  const metrics = useMemo(() => {
    const completed = leads.filter((lead) => lead.status === "Vehicle Delivered" || lead.status === "Work Completed").length;
    const active = leads.length - completed;
    const quoteTotal = leads.reduce((sum, lead) => sum + Number(lead.quote?.amount || 0), 0);
    const invoiceTotal = leads.reduce((sum, lead) => sum + Number(lead.bill?.total || 0), 0);
    const pendingInvoices = leads.filter((lead) => lead.bill && String(lead.bill.status).toUpperCase() !== "PAID").length;
    return { total: leads.length, active, completed, quoteTotal, invoiceTotal, pendingInvoices };
  }, [leads]);

  return (
    <section className="rounded-[24px] border border-[#e3daf7] bg-white p-5 shadow-[0_18px_50px_rgba(111,43,255,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0f144a]">{title}</h1>
          <p className="text-sm font-semibold text-[#6370a4]">Live role-scoped data from your backend APIs.</p>
        </div>
        <button onClick={refetch} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700">Refresh</button>
      </div>

      {loading && <p className="mt-6 font-bold text-[#6370a4]">Loading...</p>}
      {error && <p className="mt-6 font-bold text-red-600">{error}</p>}

      {!loading && !error && kind === "reports" && (
        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Total Leads" value={metrics.total} />
            <Metric label="Active Leads" value={metrics.active} />
            <Metric label="Completed" value={metrics.completed} />
            <Metric label="Quote Value" value={formatMoney(metrics.quoteTotal)} />
          </div>
          <RecentLeads leads={leads} />
        </div>
      )}

      {!loading && !error && kind === "billing" && (
        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Invoice Value" value={formatMoney(metrics.invoiceTotal)} />
            <Metric label="Pending Invoices" value={metrics.pendingInvoices} />
            <Metric label="Quote Value" value={formatMoney(metrics.quoteTotal)} />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#eee8fb]">
            <table className="min-w-full text-left">
              <thead className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]"><tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Quote</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>{leads.map((lead) => <tr key={lead.id} className="border-t border-[#efebfb]"><td className="px-4 py-3 font-black text-violet-700">{lead.leadId}</td><td className="px-4 py-3 font-bold text-[#19204f]">{lead.customer.name}</td><td className="px-4 py-3 font-bold text-[#42508a]">{lead.quote ? formatMoney(lead.quote.amount) : "-"}</td><td className="px-4 py-3 font-bold text-[#42508a]">{lead.bill ? formatMoney(lead.bill.total) : "-"}</td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{lead.bill?.status || lead.quote?.status || lead.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && kind === "settings" && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Setting label="Account" value={session?.user.name || "MechPro User"} />
          <Setting label="Role" value={session?.role || "-"} />
          <Setting label="Email" value={session?.user.email || "-"} />
          <Setting label="Company" value={session?.user.company || "-"} />
          <Setting label="Lead Visibility" value="Restricted to your authorized role" />
          <Setting label="Session" value="JWT protected" />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-2 text-2xl font-black text-[#0f144a]">{value}</p></div>;
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-1 font-black text-[#0f144a]">{value}</p></div>;
}

function RecentLeads({ leads }: { leads: Array<{ id: string; leadId: string; customer: { name: string }; status: string; createdAt: string }> }) {
  return <div className="rounded-2xl border border-[#eee8fb] p-4"><h2 className="font-black text-[#0f144a]">Recent Activity</h2><div className="mt-3 space-y-3">{leads.slice(0, 8).map((lead) => <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf8ff] p-3"><div><p className="font-black text-[#19204f]">{lead.leadId} · {lead.customer.name}</p><p className="text-sm font-semibold text-[#6370a4]">Created {formatShortDate(lead.createdAt)}</p></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">{lead.status}</span></div>)}</div></div>;
}
