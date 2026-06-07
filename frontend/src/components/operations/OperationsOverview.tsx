"use client";

import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { LeadStats, LeadsTable } from "./LeadTables";

export function OperationsOverview({ role }: { role: "admin" | "sales" | "service" | "customer" }) {
  const { leads, loading, error, refetch } = useLeads();

  if (error) return <section className="rounded-[22px] border border-red-100 bg-red-50 p-4 sm:rounded-[24px] sm:p-6"><p className="font-black text-red-700">{error}</p><button className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-700" onClick={refetch}>Retry</button></section>;

  if (role === "customer") {
    const lead = leads[0];
    return <div className="space-y-4 sm:space-y-5"><LeadStats leads={leads} /><section className="rounded-[22px] border border-[#e3daf7] bg-white p-4 shadow-[0_18px_50px_rgba(111,43,255,0.08)] sm:rounded-[24px] sm:p-5"><h2 className="text-lg font-black text-[#0f144a] sm:text-xl">Current Service Timeline</h2>{loading ? <p className="mt-4 font-bold text-[#6370a4]">Loading customer tracking...</p> : !lead ? <p className="mt-4 font-bold text-[#6370a4]">No active service found.</p> : <div className="mt-5 space-y-4">{lead.timeline.map((step, index) => <div key={`${step.status}-${index}`} className="flex gap-3 sm:gap-4"><span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full sm:h-4 sm:w-4 ${step.isCurrent ? "bg-violet-600" : step.isCompleted ? "bg-emerald-500" : "bg-[#d7cffa]"}`} /><div><p className="text-sm font-black text-[#1b2457]">{step.status}</p><p className="text-xs font-semibold text-[#6370a4]">{step.timestamp || "Pending"}</p></div></div>)}</div>}</section></div>;
  }

  return <div className="space-y-4 sm:space-y-5"><LeadStats leads={leads} /><div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">{role === "sales" && <Link href="/dashboard/sales/leads/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2.5 text-sm font-black text-white"><Plus className="h-4 w-4" /> Create Lead</Link>}{role === "service" && <Link href="/dashboard/service/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2.5 text-sm font-black text-white"><Wrench className="h-4 w-4" /> View Assigned Jobs</Link>}<Link href={role === "service" ? "/dashboard/service/jobs" : `/dashboard/${role}/leads`} className="rounded-xl border border-[#ded4f6] bg-white px-4 py-2.5 text-center text-sm font-black text-violet-700">View Leads</Link></div><LeadsTable role={role === "service" ? "service" : role} /></div>;
}

