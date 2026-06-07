"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { operationsApi, type UiLead } from "@/lib/operations";
import { StatusPill } from "./LeadTables";

export function CustomerLeadSearch() {
  const [searchType, setSearchType] = useState<"REQUEST_ID" | "VEHICLE_NUMBER">("REQUEST_ID");
  const [searchValue, setSearchValue] = useState("");
  const [mobile, setMobile] = useState("");
  const [lead, setLead] = useState<UiLead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    if (!searchValue.trim()) {
      setError("Enter request ID or vehicle number.");
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("Enter the registered 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setError("");
    setLead(null);
    try {
      setLead(await operationsApi.trackCustomerLead({
        searchType,
        searchValue: searchValue.trim().toUpperCase(),
        mobile: mobile.trim(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Service request not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-[#e3daf7] bg-white p-5 shadow-[0_18px_50px_rgba(111,43,255,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0f144a]">Track Service Request</h1>
          <p className="mt-1 text-sm font-semibold text-[#6370a4]">Search by Request ID or vehicle number with registered mobile verification.</p>
        </div>
        <Link href="/dashboard/customer/track/new" className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(111,43,255,0.25)]">
          Create Guest Request
        </Link>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[210px_1fr_240px_auto]">
        <select className="rounded-xl border border-[#ded4f6] bg-white px-4 py-3 text-sm font-bold text-[#19204f] outline-none focus:border-violet-400" value={searchType} onChange={(event) => setSearchType(event.target.value as "REQUEST_ID" | "VEHICLE_NUMBER")}>
          <option value="REQUEST_ID">Request ID</option>
          <option value="VEHICLE_NUMBER">Vehicle Number</option>
        </select>
        <input
          className="rounded-xl border border-[#ded4f6] px-4 py-3 text-sm font-bold uppercase outline-none focus:border-violet-400"
          placeholder={searchType === "REQUEST_ID" ? "Example: ME0001BR01" : "Example: MH12AB1234"}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value.toUpperCase())}
          onKeyDown={(event) => event.key === "Enter" && search()}
        />
        <input
          className="rounded-xl border border-[#ded4f6] px-4 py-3 text-sm font-bold outline-none focus:border-violet-400"
          placeholder="Registered mobile"
          value={mobile}
          onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
          onKeyDown={(event) => event.key === "Enter" && search()}
        />
        <button onClick={search} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-mechpro-gradient px-5 py-3 text-sm font-black text-white disabled:opacity-60"><Search className="h-4 w-4" /> {loading ? "Searching..." : "Track Request"}</button>
      </div>
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">{error}</p>}
      {lead && (
        <div className="mt-5 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xl font-black text-violet-700">{lead.leadId}</p><p className="text-sm font-semibold text-[#6370a4]">{lead.vehicle.brand} {lead.vehicle.model} · {lead.vehicle.number}</p></div>
            <StatusPill status={lead.status} />
          </div>
          <div className="mt-5 space-y-3">{lead.timeline.map((item, index) => <div key={`${item.status}-${index}`} className="flex gap-3"><span className={`mt-1 h-3 w-3 rounded-full ${item.isCurrent ? "bg-violet-600" : item.isCompleted ? "bg-emerald-500" : "bg-[#d8cdf4]"}`} /><div><p className="text-sm font-black text-[#19204f]">{item.status}</p><p className="text-xs font-semibold text-[#6370a4]">{item.timestamp || "Pending"}</p></div></div>)}</div>
          <Link href={`/dashboard/customer/track/${lead.id}`} className="mt-5 inline-flex rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white">Open Full Details</Link>
        </div>
      )}
    </section>
  );
}
