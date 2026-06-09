"use client";

import Link from "next/link";
import { Car, FileText, Plus, Search, Wrench } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { LeadStats, LeadsTable, StatusPill } from "./LeadTables";

export function OperationsOverview({ role }: { role: "admin" | "sales" | "service" | "customer" }) {
  const { leads, loading, error, refetch } = useLeads();

  if (error) return <section className="rounded-[22px] border border-red-100 bg-red-50 p-4 sm:rounded-[24px] sm:p-6"><p className="font-black text-red-700">{error}</p><button className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-700" onClick={refetch}>Retry</button></section>;

  if (role === "customer") {
    const lead = leads[0];
    return (
      <div className="space-y-4 sm:space-y-5">
        <MobileRoleSummary role={role} leadsCount={leads.length} />
        <LeadStats leads={leads} />
        <section className="rounded-[22px] border border-[#e3daf7] bg-white p-4 shadow-[0_18px_50px_rgba(111,43,255,0.08)] sm:rounded-[24px] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#0f144a] sm:text-xl">My Service Requests</h2>
              <p className="mt-1 text-sm font-semibold text-[#6370a4]">Requests linked to your logged-in customer account are shown automatically.</p>
            </div>
            <Link href="/dashboard/customer/track" className="inline-flex items-center gap-2 rounded-xl border border-[#ded4f6] bg-[#faf8ff] px-3 py-2 text-xs font-black text-violet-700">
              <Search className="h-3.5 w-3.5" /> Track another request
            </Link>
          </div>
          {loading && <p className="mt-4 font-bold text-[#6370a4]">Loading your service requests...</p>}
          {!loading && leads.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-[#d8cdf4] bg-[#faf8ff] p-5 text-center">
              <p className="font-black text-[#0f144a]">No service request linked yet.</p>
              <p className="mt-1 text-sm font-semibold text-[#6370a4]">Create a guest request or ask your sales partner to create one using your registered mobile/email.</p>
              <Link href="/dashboard/customer/track/new" className="mt-4 inline-flex rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white">Create Service Request</Link>
            </div>
          )}
          <div className="mt-5 grid gap-3">
            {leads.map((item) => (
              <Link key={item.id} href={`/dashboard/customer/track/${item.id}`} className="rounded-[20px] border border-[#eee8fb] bg-[#faf8ff] p-4 transition hover:border-violet-200 hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-violet-700">{item.leadId}</p>
                    <p className="mt-1 truncate text-sm font-black text-[#19204f]">{item.vehicle.brand} {item.vehicle.model}</p>
                    <p className="font-mono text-xs font-semibold text-[#6370a4]">{item.vehicle.number}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-[#6370a4]">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2"><Car className="h-4 w-4 text-violet-600" /> {item.serviceType}</span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2"><FileText className="h-4 w-4 text-violet-600" /> {item.documents.length} docs</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        {lead && (
          <section className="rounded-[22px] border border-[#e3daf7] bg-white p-4 shadow-[0_18px_50px_rgba(111,43,255,0.08)] sm:rounded-[24px] sm:p-5">
            <h2 className="text-lg font-black text-[#0f144a] sm:text-xl">Latest Service Timeline</h2>
            <div className="mt-5 space-y-4">{lead.timeline.map((step, index) => <div key={`${step.status}-${index}`} className="flex gap-3 sm:gap-4"><span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full sm:h-4 sm:w-4 ${step.isCurrent ? "bg-violet-600" : step.isCompleted ? "bg-emerald-500" : "bg-[#d7cffa]"}`} /><div><p className="text-sm font-black text-[#1b2457]">{step.status}</p><p className="text-xs font-semibold text-[#6370a4]">{step.timestamp || "Pending"}</p></div></div>)}</div>
          </section>
        )}
      </div>
    );
  }

  return <div className="space-y-4 sm:space-y-5">{role !== "sales" && <MobileRoleSummary role={role} leadsCount={leads.length} />}<LeadStats leads={leads} /><div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">{role === "sales" && <Link href="/dashboard/sales/leads/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2.5 text-sm font-black text-white"><Plus className="h-4 w-4" /> Create Lead</Link>}{role === "service" && <Link href="/dashboard/service/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2.5 text-sm font-black text-white"><Wrench className="h-4 w-4" /> View Assigned Jobs</Link>}<Link href={role === "service" ? "/dashboard/service/jobs" : `/dashboard/${role}/leads`} className="rounded-xl border border-[#ded4f6] bg-white px-4 py-2.5 text-center text-sm font-black text-violet-700">{role === "service" ? "View Jobs" : "View Leads"}</Link></div><LeadsTable role={role === "service" ? "service" : role} /></div>;
}

function MobileRoleSummary({ role, leadsCount }: { role: "admin" | "service" | "customer"; leadsCount: number }) {
  const content = {
    admin: {
      eyebrow: "Live Operations",
      title: "Claim Control Center",
      subtitle: "Review cases, documents, and partner assignments from one mobile view.",
      chips: [`${leadsCount} total cases`, "Docs review"],
    },
    service: {
      eyebrow: "Workshop Flow",
      title: "Assigned Service Jobs",
      subtitle: "Track inspections, upload media, share quotes, and close invoices faster.",
      chips: [`${leadsCount} linked jobs`, "Quote workflow"],
    },
    customer: {
      eyebrow: "Service Tracking",
      title: "Your Vehicle Request",
      subtitle: "Follow every update, document, quote, and payment status in one place.",
      chips: [`${leadsCount} request`, "Secure tracking"],
    },
  }[role];

  return (
    <section className="lg:hidden rounded-[24px] border border-[#e3daf7] bg-white p-4 shadow-[0_16px_42px_rgba(111,43,255,0.1)]">
      <div className="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#fbf8ff_0%,#f4edff_55%,#fff_100%)] p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600">{content.eyebrow}</p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#0f144a]">{content.title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#6470a2]">{content.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {content.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-[#e4d9fb] bg-white px-3 py-1.5 text-xs font-black text-[#4b3a8c] shadow-[0_8px_18px_rgba(111,43,255,0.08)]">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

