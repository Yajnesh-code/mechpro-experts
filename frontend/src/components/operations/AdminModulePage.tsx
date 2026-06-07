"use client";

import { useEffect, useState } from "react";
import { adminApi, formatMoney, formatShortDate } from "@/lib/operations";
import { useToast } from "@/context/ToastContext";

type AdminPageKind = "users" | "partners" | "documents" | "reports" | "billing" | "settings" | "activity";

export function AdminModulePage({ kind }: { kind: AdminPageKind }) {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      if (kind === "users") setData(await adminApi.listUsers());
      if (kind === "partners") setData(await adminApi.listPartners());
      if (kind === "documents") setData(await adminApi.documents());
      if (kind === "reports") setData(await adminApi.reports());
      if (kind === "billing") setData(await adminApi.billing());
      if (kind === "settings") setData(await adminApi.settings());
      if (kind === "activity") setData(await adminApi.auditLogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [kind]);

  async function deactivateUser(id: string) {
    try {
      await adminApi.deleteUser(id);
      toast("success", "User deactivated.");
      load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Action failed");
    }
  }

  async function reviewDocument(id: string, reviewStatus: string, reviewNotes?: string) {
    try {
      await adminApi.reviewDocument(id, { reviewStatus, reviewNotes });
      toast("success", "Document review updated.");
      load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Document review failed");
    }
  }

  const title = { users: "User Management", partners: "Partner Management", documents: "Document Review", reports: "Reports Dashboard", billing: "Billing Dashboard", settings: "Settings", activity: "Activity Logs" }[kind];

  return (
    <section className="rounded-[24px] border border-[#e3daf7] bg-white p-5 shadow-[0_18px_50px_rgba(111,43,255,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black text-[#0f144a]">{title}</h1><p className="text-sm font-semibold text-[#6370a4]">Connected to backend data, not dummy placeholders.</p></div>
        <button onClick={load} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700">Refresh</button>
      </div>
      {loading && <p className="mt-6 font-bold text-[#6370a4]">Loading...</p>}
      {error && <p className="mt-6 font-bold text-red-600">{error}</p>}
      {!loading && !error && (kind === "users" || kind === "partners") && <UserTable users={data || []} onDeactivate={deactivateUser} />}
      {!loading && !error && kind === "documents" && <DocumentsView documents={data || []} onReview={reviewDocument} />}
      {!loading && !error && kind === "reports" && <ReportsView report={data} />}
      {!loading && !error && kind === "billing" && <BillingView billing={data} />}
      {!loading && !error && kind === "settings" && <SettingsView settings={data} />}
      {!loading && !error && kind === "activity" && <ActivityView logs={data || []} />}
    </section>
  );
}

function UserTable({ users, onDeactivate }: { users: any[]; onDeactivate: (id: string) => void }) {
  return <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left"><thead><tr className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-[#efebfb]"><td className="px-4 py-3"><p className="font-black text-[#19204f]">{user.contact_person}</p><p className="text-xs font-semibold text-[#6370a4]">{user.email}</p></td><td className="px-4 py-3 font-bold text-[#42508a]">{user.role}</td><td className="px-4 py-3 font-bold text-[#42508a]">{user.company_name || "-"}</td><td className="px-4 py-3 font-bold text-[#42508a]">{user.city || "-"}</td><td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{user.status}</span></td><td className="px-4 py-3"><button onClick={() => onDeactivate(user.id)} className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">Deactivate</button></td></tr>)}</tbody></table></div>;
}

function DocumentsView({ documents, onReview }: { documents: any[]; onReview: (id: string, status: string, notes?: string) => void }) {
  const [filter, setFilter] = useState("ALL");
  const filteredDocuments = filter === "ALL" ? documents : documents.filter((document) => String(document.reviewStatus || "PENDING_REVIEW").toUpperCase() === filter);
  const filters = [
    ["ALL", "All"],
    ["PENDING_REVIEW", "Pending"],
    ["APPROVED", "Approved"],
    ["REJECTED", "Rejected"],
    ["MISSING_REQUESTED", "Missing"],
  ];
  if (!documents.length) return <p className="mt-5 font-bold text-[#6370a4]">No documents uploaded yet.</p>;
  return (
    <div className="mt-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${filter === value ? "bg-mechpro-gradient text-white shadow-lg shadow-violet-200" : "border border-[#ded4f6] bg-white text-violet-700 hover:bg-violet-50"}`}>{label}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]">
            <th className="px-4 py-3">Document</th>
            <th className="px-4 py-3">Lead / Case</th>
            <th className="px-4 py-3">Uploaded By</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((document) => (
            <tr key={document.id} className="border-t border-[#efebfb]">
              <td className="px-4 py-3">
                <a href={document.url} target="_blank" rel="noreferrer" className="font-black text-violet-700 hover:underline">{document.name}</a>
                <p className="text-xs font-semibold text-[#6370a4]">{document.type} · Version {document.version || 1} · {document.isCurrent === false ? "Previous version" : "Current"} · {document.size ? `${Math.round(Number(document.size) / 1024)} KB` : "file"}</p>
                {document.reviewNotes && <p className="mt-1 text-xs font-bold text-[#8a5000]">Note: {document.reviewNotes}</p>}
              </td>
              <td className="px-4 py-3">
                <p className="font-black text-[#19204f]">{document.lead?.leadCode || "-"}</p>
                <p className="text-xs font-semibold text-[#6370a4]">{document.lead?.customerName || ""}</p>
              </td>
              <td className="px-4 py-3 font-bold text-[#42508a]">{document.uploadedBy?.contact_person || document.uploadedBy?.name || "MechPro User"}</td>
              <td className="px-4 py-3"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">{String(document.reviewStatus || "PENDING_REVIEW").replace(/_/g, " ")}</span></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onReview(document.id, "APPROVED")} className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Approve</button>
                  <button onClick={() => onReview(document.id, "REJECTED", "Document rejected by admin review.")} className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">Reject</button>
                  <button onClick={() => onReview(document.id, "MISSING_REQUESTED", "Please upload the required document again.")} className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">Request Missing</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredDocuments.length === 0 && <p className="py-8 text-center text-sm font-bold text-[#6370a4]">No documents in this filter.</p>}
      </div>
    </div>
  );
}

function ReportsView({ report }: { report: any }) {
  const { toast } = useToast();
  async function exportReport(format: "pdf" | "excel") {
    try {
      await adminApi.downloadReport(format);
      toast("success", `Report ${format.toUpperCase()} export started.`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Report export failed");
    }
  }
  const metrics = [["Total Leads", report.totalLeads], ["Today", report.dailyLeads || 0], ["This Month", report.monthlyLeads || 0], ["Conversion", `${report.conversionRate || 0}%`], ["Active Leads", report.activeLeads], ["Completed", report.completedLeads], ["Revenue", formatMoney(report.revenue || 0)]];
  return <div className="mt-5 space-y-5"><div className="flex flex-wrap gap-2"><button onClick={() => exportReport("pdf")} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700">Export PDF</button><button onClick={() => exportReport("excel")} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700">Export Excel</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-2 text-2xl font-black text-[#0f144a]">{value}</p></div>)}</div><div className="rounded-2xl border border-[#eee8fb] p-4"><h2 className="font-black text-[#0f144a]">Partner Performance</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{report.partnerPerformance?.map((item: any) => <div key={item.id} className="rounded-xl bg-[#faf8ff] p-3"><p className="font-black text-[#19204f]">{item.name}</p><p className="text-sm font-semibold text-[#6370a4]">Jobs: {item.jobs} · Completed: {item.completed}</p></div>)}</div></div></div>;
}

function BillingView({ billing }: { billing: any }) {
  return <div className="mt-5 space-y-5"><div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">{[["Total", billing.total], ["Paid", billing.paid], ["Pending", billing.pending], ["GST", billing.gst], ["Paid Count", billing.paidCount], ["Pending Count", billing.pendingCount]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-2 text-2xl font-black text-[#0f144a]">{typeof value === "number" && String(label).includes("Count") ? value : formatMoney(Number(value || 0))}</p></div>)}</div><div className="overflow-x-auto"><table className="min-w-full text-left"><tbody>{billing.invoices?.map((invoice: any) => <tr key={invoice.id} className="border-t border-[#efebfb]"><td className="px-4 py-3 font-black text-violet-700">{invoice.lead?.leadCode}</td><td className="px-4 py-3 font-bold text-[#19204f]">{formatMoney(Number(invoice.total))}</td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{invoice.status}</span></td><td className="px-4 py-3 text-sm font-semibold text-[#6370a4]">{formatShortDate(invoice.createdAt)}</td></tr>)}</tbody></table></div></div>;
}

function SettingsView({ settings }: { settings: any }) {
  return <div className="mt-5 grid gap-4 md:grid-cols-2">{Object.entries(settings || {}).map(([key, value]) => <div key={key} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{key}</p><p className="mt-1 whitespace-pre-wrap font-black text-[#0f144a]">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</p></div>)}</div>;
}

function ActivityView({ logs }: { logs: any[] }) {
  return <div className="mt-5 space-y-3">{logs.map((log) => <div key={log.id} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="font-black text-[#19204f]">{log.action}</p><p className="text-sm font-semibold text-[#6370a4]">{log.entityType} · {log.actor?.contact_person || "System"} · {formatShortDate(log.createdAt)}</p></div>)}</div>;
}
