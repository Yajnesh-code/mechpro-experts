"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Plus, Search } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { formatMoney, formatShortDate, type UiLead } from "@/lib/operations";

const statusClass: Record<string, string> = {
  "Lead Created": "bg-emerald-50 text-emerald-700",
  Assigned: "bg-blue-50 text-blue-700",
  "Car Received": "bg-violet-50 text-violet-700",
  "Inspection Started": "bg-orange-50 text-orange-700",
  "Inspection Completed": "bg-amber-50 text-amber-700",
  "Quote Shared": "bg-yellow-50 text-yellow-700",
  "Quote Approved": "bg-emerald-50 text-emerald-700",
  "Work Started": "bg-purple-50 text-purple-700",
  "Work Completed": "bg-green-50 text-green-700",
  "Bill Generated": "bg-sky-50 text-sky-700",
  "Payment Done": "bg-emerald-50 text-emerald-700",
  "Vehicle Delivered": "bg-fuchsia-50 text-fuchsia-700",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black sm:text-xs ${statusClass[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

export function PriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = { Low: "bg-emerald-50 text-emerald-700", Medium: "bg-blue-50 text-blue-700", High: "bg-amber-50 text-amber-700", Urgent: "bg-red-50 text-red-700" };
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black sm:text-xs ${styles[priority] ?? styles.Medium}`}>{priority}</span>;
}

export function LeadsTable({ role }: { role: "admin" | "sales" | "service" }) {
  const { leads, loading, error, refetch } = useLeads();
  const [search, setSearch] = useState("");
  const basePath = role === "service" ? "/dashboard/service/jobs" : `/dashboard/${role}/leads`;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const scoped = role === "service" ? leads.filter((lead) => lead.assignedServicePartner) : leads;
    if (!q) return scoped;
    return scoped.filter((lead) => [lead.leadId, lead.customer.name, lead.vehicle.number, lead.vehicle.brand, lead.salesPartner.name].some((value) => value.toLowerCase().includes(q)));
  }, [leads, role, search]);

  return (
    <section className="w-full max-w-full overflow-hidden rounded-[22px] border border-[#e3daf7] bg-white p-4 shadow-[0_18px_50px_rgba(111,43,255,0.08)] sm:rounded-[24px] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0f144a] sm:text-xl">{role === "service" ? "Assigned Jobs" : role === "admin" ? "Lead / Case Management" : "Lead Management"}</h2>
          <p className="mt-1 text-xs font-semibold text-[#6370a4] sm:text-sm">{role === "admin" ? "Live lead and service request operations" : "Live backend-connected operations"}</p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#ded4f6] bg-[#faf8ff] px-3 py-2 text-sm font-bold text-[#42508a] sm:flex-none">
            <Search className="h-4 w-4 text-violet-600" />
            <input className="min-w-0 bg-transparent outline-none placeholder:text-[#8d97c1]" placeholder={role === "admin" ? "Search leads/cases..." : "Search leads..."} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          {role !== "service" && (
            <Link href={`${basePath}/new`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(111,43,255,0.25)] sm:w-auto">
              <Plus className="h-4 w-4" /> Create Lead / Case
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {loading && Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[18px] bg-[#f3eefc]" />
        ))}
        {error && (
          <div className="rounded-[18px] border border-red-100 bg-red-50 p-4 text-center">
            <p className="font-bold text-red-600">{error}</p>
            <button className="mt-3 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-700" onClick={refetch}>Retry</button>
          </div>
        )}
        {!loading && !error && rows.length === 0 && <div className="rounded-[18px] bg-[#faf8ff] p-5 text-center text-sm font-bold text-[#6370a4]">No leads found.</div>}
        {!loading && !error && rows.map((lead) => <LeadMobileCard key={lead.id} lead={lead} href={`${basePath}/${lead.id}`} />)}
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]">
              <th className="px-4 py-3">Lead / Case ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, index) => <tr key={index} className="border-t border-[#efebfb]"><td colSpan={8} className="px-4 py-4"><div className="h-4 w-full animate-pulse rounded-full bg-[#eee8fb]" /></td></tr>)}
            {error && <tr><td colSpan={8} className="px-4 py-8 text-center"><p className="font-bold text-red-600">{error}</p><button className="mt-3 rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-bold text-violet-700" onClick={refetch}>Retry</button></td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm font-bold text-[#6370a4]">No leads found.</td></tr>}
            {!loading && !error && rows.map((lead) => <LeadRow key={lead.id} lead={lead} href={`${basePath}/${lead.id}`} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeadRow({ lead, href }: { lead: UiLead; href: string }) {
  return (
    <tr className="border-t border-[#efebfb] transition hover:bg-[#fbf9ff]">
      <td className="px-4 py-3 font-black text-violet-700">{lead.leadId}</td>
      <td className="px-4 py-3"><p className="font-bold text-[#19204f]">{lead.customer.name}</p><p className="text-xs font-semibold text-[#6f7aa9]">{lead.customer.mobile}</p></td>
      <td className="px-4 py-3"><p className="font-bold text-[#19204f]">{lead.vehicle.brand} {lead.vehicle.model}</p><p className="font-mono text-xs text-[#6f7aa9]">{lead.vehicle.number}</p></td>
      <td className="px-4 py-3"><p className="font-bold text-[#19204f]">{lead.assignedServicePartner?.name ?? lead.salesPartner.name}</p><p className="text-xs font-semibold text-[#6f7aa9]">{lead.assignedServicePartner?.type ?? lead.salesPartner.typeName}</p></td>
      <td className="px-4 py-3"><StatusPill status={lead.status} /></td>
      <td className="px-4 py-3"><PriorityPill priority={lead.priority} /></td>
      <td className="px-4 py-3 text-sm font-bold text-[#6370a4]">{formatShortDate(lead.createdAt)}</td>
      <td className="px-4 py-3"><Link href={href} className="inline-flex rounded-xl border border-[#ded4f6] p-2 text-violet-700 transition hover:bg-violet-50"><Eye className="h-4 w-4" /></Link></td>
    </tr>
  );
}

function LeadMobileCard({ lead, href }: { lead: UiLead; href: string }) {
  return (
    <Link href={href} className="block w-full max-w-full overflow-hidden rounded-[20px] border border-[#e7def8] bg-white p-4 shadow-[0_14px_34px_rgba(111,43,255,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-violet-700">{lead.leadId}</p>
          <p className="mt-1 truncate text-sm font-black text-[#19204f]">{lead.customer.name}</p>
          <p className="truncate text-xs font-semibold text-[#6f7aa9]">{lead.customer.mobile}</p>
        </div>
        <div className="shrink-0">
          <StatusPill status={lead.status} />
        </div>
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="font-black uppercase tracking-[0.12em] text-[#8a94bd]">Vehicle</p>
          <p className="mt-1 truncate font-bold text-[#19204f]">{lead.vehicle.brand} {lead.vehicle.model}</p>
          <p className="truncate font-mono text-[#6f7aa9]">{lead.vehicle.number}</p>
        </div>
        <div className="min-w-0">
          <p className="font-black uppercase tracking-[0.12em] text-[#8a94bd]">Partner</p>
          <p className="mt-1 truncate font-bold text-[#19204f]">{lead.assignedServicePartner?.name ?? lead.salesPartner.name}</p>
          <p className="truncate text-[#6f7aa9]">{lead.assignedServicePartner?.type ?? lead.salesPartner.typeName}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#eee8fb] pt-3">
        <PriorityPill priority={lead.priority} />
        <span className="shrink-0 text-xs font-bold text-[#6370a4]">{formatShortDate(lead.createdAt)}</span>
      </div>
    </Link>
  );
}

export function LeadStats({ leads }: { leads: UiLead[] }) {
  const revenue = leads.reduce((sum, lead) => sum + (lead.bill?.total || 0), 0);
  const cards = [
    ["Total Leads", leads.length],
    ["Pending", leads.filter((lead) => !["Payment Done", "Vehicle Delivered"].includes(lead.status)).length],
    ["Completed", leads.filter((lead) => lead.status === "Vehicle Delivered").length],
    ["Revenue", revenue ? formatMoney(revenue) : "INR 0"],
  ];
  return <div className="grid w-full max-w-full grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{cards.map(([title, value]) => <div key={title} className="min-w-0 rounded-[20px] border border-[#e3daf7] bg-white p-4 shadow-[0_14px_34px_rgba(111,43,255,0.08)] sm:rounded-[22px] sm:p-5"><p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#7e88b5] sm:text-xs">{title}</p><p className="mt-2 truncate text-2xl font-black text-[#0f144a] sm:text-3xl">{value}</p></div>)}</div>;
}

