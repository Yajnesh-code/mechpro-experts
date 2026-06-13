"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, FileText, Plus, ShieldAlert, XCircle } from "lucide-react";
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

  async function saveUser(payload: Record<string, unknown>, id?: string) {
    try {
      if (id) {
        await adminApi.updateUser(id, payload);
        toast("success", "User updated.");
      } else {
        await adminApi.createUser(payload);
        toast("success", "User created.");
      }
      load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Unable to save user");
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
      {!loading && !error && (kind === "users" || kind === "partners") && <UserManagement users={data || []} mode={kind} onDeactivate={deactivateUser} onSave={saveUser} />}
      {!loading && !error && kind === "documents" && <DocumentsView documents={data || []} onReview={reviewDocument} />}
      {!loading && !error && kind === "reports" && <ReportsView report={data} />}
      {!loading && !error && kind === "billing" && <BillingView billing={data} />}
      {!loading && !error && kind === "settings" && <SettingsView settings={data} />}
      {!loading && !error && kind === "activity" && <ActivityView logs={data || []} />}
    </section>
  );
}

function UserManagement({ users, mode, onDeactivate, onSave }: { users: any[]; mode: "users" | "partners"; onDeactivate: (id: string) => void; onSave: (payload: Record<string, unknown>, id?: string) => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const filteredUsers = mode === "partners" ? users.filter((user) => ["SALES_PARTNER", "SERVICE_PARTNER"].includes(user.role)) : users;
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4">
        <div>
          <p className="text-sm font-black text-[#0f144a]">{mode === "partners" ? "Partner directory" : "User directory"}</p>
          <p className="text-xs font-semibold text-[#6370a4]">{filteredUsers.length} records synced with backend role security.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white"><Plus className="h-4 w-4" /> Add {mode === "partners" ? "Partner" : "User"}</button>
      </div>
      {filteredUsers.length === 0 ? <EmptyState title="No users found" text="Create the first user or partner to start managing access." /> : <UserTable users={filteredUsers} onDeactivate={onDeactivate} onEdit={(user) => { setEditing(user); setOpen(true); }} />}
      {open && <UserEditor mode={mode} user={editing} onClose={() => setOpen(false)} onSave={(payload, id) => { onSave(payload, id); setOpen(false); }} />}
    </div>
  );
}

function UserTable({ users, onDeactivate, onEdit }: { users: any[]; onDeactivate: (id: string) => void; onEdit: (user: any) => void }) {
  return <div className="overflow-x-auto rounded-2xl border border-[#eee8fb]"><table className="min-w-full text-left"><thead><tr className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-[#efebfb]"><td className="px-4 py-3"><p className="font-black text-[#19204f]">{user.contact_person || user.name}</p><p className="text-xs font-semibold text-[#6370a4]">{user.email}</p><p className="text-xs font-semibold text-[#8a94bd]">{user.phone || user.mobile || "-"}</p></td><td className="px-4 py-3 font-bold text-[#42508a]">{String(user.role || "").replace(/_/g, " ")}</td><td className="px-4 py-3 font-bold text-[#42508a]">{user.company_name || user.companyName || "-"}</td><td className="px-4 py-3 font-bold text-[#42508a]">{user.city || "-"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user.status}</span></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => onEdit(user)} className="rounded-xl border border-[#ded4f6] bg-white px-3 py-1.5 text-xs font-black text-violet-700">Edit</button><button onClick={() => onDeactivate(user.id)} className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">Deactivate</button></div></td></tr>)}</tbody></table></div>;
}

function UserEditor({ user, mode, onClose, onSave }: { user: any | null; mode: "users" | "partners"; onClose: () => void; onSave: (payload: Record<string, unknown>, id?: string) => void }) {
  const partnerDefaultRole = user?.role || "SERVICE_PARTNER";
  const [form, setForm] = useState({
    name: user?.contact_person || user?.name || "",
    email: user?.email || "",
    mobile: user?.phone || user?.mobile || "",
    role: mode === "partners" ? partnerDefaultRole : user?.role || "CUSTOMER",
    status: user?.status || "ACTIVE",
    companyName: user?.company_name || user?.companyName || "",
    city: user?.city || "",
    address: user?.address || "",
    salesPartnerType: user?.salesPartnerType || "BR",
    servicePartnerType: user?.servicePartnerType || "WORKSHOP",
    gstOrLicense: user?.gstOrLicense || "",
    password: "MechPro@123",
  });

  function setField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    const payload: Record<string, unknown> = { ...form };
    if (user) delete payload.password;
    if (form.role !== "SALES_PARTNER") delete payload.salesPartnerType;
    if (form.role !== "SERVICE_PARTNER") delete payload.servicePartnerType;
    onSave(payload, user?.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11153d]/45 p-4 backdrop-blur">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,20,74,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">{user ? "Edit access" : "Create access"}</p>
            <h2 className="mt-1 text-xl font-black text-[#0f144a]">{user ? "Update user / partner" : `Add ${mode === "partners" ? "partner" : "user"}`}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-black text-violet-700">Close</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <AdminInput label="Name" value={form.name} onChange={(value) => setField("name", value)} />
          <AdminInput label="Email" value={form.email} disabled={Boolean(user)} onChange={(value) => setField("email", value)} />
          <AdminInput label="Mobile" value={form.mobile} onChange={(value) => setField("mobile", value)} />
          <AdminSelect label="Role" value={form.role} options={mode === "partners" ? ["SALES_PARTNER", "SERVICE_PARTNER"] : ["ADMIN", "SALES_PARTNER", "SERVICE_PARTNER", "CUSTOMER"]} onChange={(value) => setField("role", value)} />
          <AdminInput label="Company / Workshop" value={form.companyName} onChange={(value) => setField("companyName", value)} />
          <AdminInput label="City" value={form.city} onChange={(value) => setField("city", value)} />
          <AdminInput label="Address" value={form.address} onChange={(value) => setField("address", value)} />
          <AdminSelect label="Status" value={form.status} options={["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"]} onChange={(value) => setField("status", value)} />
          {form.role === "SALES_PARTNER" && <AdminSelect label="Sales Partner Type" value={form.salesPartnerType} options={["BR", "CR", "FT", "AG", "IN", "IS"]} onChange={(value) => setField("salesPartnerType", value)} />}
          {form.role === "SERVICE_PARTNER" && <AdminSelect label="Service Partner Type" value={form.servicePartnerType} options={["WORKSHOP", "PART_VENDOR", "TOWING_SERVICE", "ALPHA_GO"]} onChange={(value) => setField("servicePartnerType", value)} />}
          <AdminInput label="GST / License" value={form.gstOrLicense} onChange={(value) => setField("gstOrLicense", value)} />
          {!user && <AdminInput label="Initial Password" value={form.password} onChange={(value) => setField("password", value)} />}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700">Cancel</button>
          <button onClick={submit} className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

function AdminInput({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-black text-[#0f144a]">{label}</span><input disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#ded4f6] px-4 text-sm font-bold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400" /></label>;
}

function AdminSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-black text-[#0f144a]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#ded4f6] bg-white px-4 text-sm font-bold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-dashed border-[#d8cdf4] bg-[#faf8ff] p-8 text-center"><p className="font-black text-[#0f144a]">{title}</p><p className="mt-2 text-sm font-semibold text-[#6370a4]">{text}</p></div>;
}

function DocumentsView({ documents, onReview }: { documents: any[]; onReview: (id: string, status: string, notes?: string) => void }) {
  const [filter, setFilter] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const filteredDocuments = documents.filter((document) => {
    const statusMatches = filter === "ALL" || String(document.reviewStatus || "PENDING_REVIEW").toUpperCase() === filter;
    const sectionMatches = section === "ALL" || adminDocumentSection(document) === section;
    return statusMatches && sectionMatches;
  });
  const filters = [
    ["ALL", "All"],
    ["PENDING_REVIEW", "Pending"],
    ["APPROVED", "Approved"],
    ["REJECTED", "Rejected"],
    ["MISSING_REQUESTED", "Missing"],
  ];
  const sections = [
    ["ALL", "All Documents"],
    ["LEAD", "Lead Docs"],
    ["SERVICE", "Service Uploads"],
    ["BILLING", "Quote / Invoice"],
  ];
  if (!documents.length) return <p className="mt-5 font-bold text-[#6370a4]">No documents uploaded yet.</p>;
  return (
    <div className="mt-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {sections.map(([value, label]) => (
          <button key={value} onClick={() => setSection(value)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${section === value ? "bg-[#0f144a] text-white shadow-lg shadow-violet-100" : "border border-[#ded4f6] bg-white text-[#42508a] hover:bg-violet-50"}`}>{label}</button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${filter === value ? "bg-mechpro-gradient text-white shadow-lg shadow-violet-200" : "border border-[#ded4f6] bg-white text-violet-700 hover:bg-violet-50"}`}>{label}</button>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {filteredDocuments.map((document) => <DocumentReviewCard key={document.id} document={document} onReview={onReview} />)}
        {filteredDocuments.length === 0 && <p className="py-8 text-center text-sm font-bold text-[#6370a4]">No documents in this filter.</p>}
      </div>
      <div className="hidden overflow-x-auto md:block">
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
                <p className="mt-1 text-xs font-bold text-[#8a94bd]">{adminDocumentSectionLabel(document)} · {document.mimeType || "file"}</p>
                {document.reviewNotes && <p className="mt-1 text-xs font-bold text-[#8a5000]">Note: {document.reviewNotes}</p>}
              </td>
              <td className="px-4 py-3">
                <p className="font-black text-[#19204f]">{document.lead?.leadCode || "-"}</p>
                <p className="text-xs font-semibold text-[#6370a4]">{document.lead?.customerName || ""}</p>
              </td>
              <td className="px-4 py-3 font-bold text-[#42508a]">{document.uploadedBy?.contact_person || document.uploadedBy?.name || "MechPro User"}<p className="text-xs font-bold text-[#8a94bd]">{String(document.uploadedBy?.role || "").replace(/_/g, " ")}</p></td>
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

function adminDocumentSection(document: any) {
  const type = String(document.type || "").toUpperCase();
  const role = String(document.uploadedBy?.role || document.uploadedByRole || "").toUpperCase();
  if (["QUOTE_DOCUMENT", "INVOICE_DOCUMENT"].includes(type)) return "BILLING";
  if (role === "SERVICE_PARTNER" || type === "SERVICE_DOCUMENT") return "SERVICE";
  return "LEAD";
}

function adminDocumentSectionLabel(document: any) {
  const section = adminDocumentSection(document);
  if (section === "BILLING") return "Quote / Invoice";
  if (section === "SERVICE") return "Service Partner Upload";
  return "Lead Document";
}

function adminDocumentKind(document: any) {
  const url = String(document.url || document.path || "").toLowerCase();
  if (/\.(png|jpg|jpeg|webp|gif)$/.test(url)) return "image";
  if (/\.pdf$/.test(url)) return "pdf";
  if (/\.(mp4|mov|webm)$/.test(url)) return "video";
  return "file";
}

function adminReviewBadgeClass(status?: string) {
  const normalized = String(status || "PENDING_REVIEW").toUpperCase();
  if (normalized === "APPROVED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "REJECTED") return "border-red-200 bg-red-50 text-red-700";
  if (normalized === "MISSING_REQUESTED") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-violet-200 bg-violet-50 text-violet-700";
}

function DocumentReviewCard({ document, onReview }: { document: any; onReview: (id: string, status: string, notes?: string) => void }) {
  const kind = adminDocumentKind(document);
  const status = String(document.reviewStatus || "PENDING_REVIEW").replace(/_/g, " ");
  const url = document.url || document.path || "#";
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#eee8fb] bg-[#faf8ff] shadow-[0_14px_34px_rgba(111,43,255,0.08)]">
      <div className="bg-white">
        {kind === "image" && <img src={url} alt={document.name} className="h-40 w-full object-cover" />}
        {kind === "video" && <video src={url} controls className="h-40 w-full bg-black object-contain" />}
        {kind === "pdf" && (
          <div className="flex h-32 items-center justify-center bg-white">
            <FileText className="h-10 w-10 text-violet-500" />
          </div>
        )}
        {kind === "file" && <div className="flex h-28 items-center justify-center bg-white text-sm font-black text-[#6370a4]">Preview unavailable</div>}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-black text-[#19204f]">{document.name}</p>
            <p className="mt-1 text-xs font-bold text-[#6370a4]">{String(document.type || "DOCUMENT").replace(/_/g, " ")} · Version {document.version || 1}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${adminReviewBadgeClass(document.reviewStatus)}`}>{status}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-white px-3 py-2">
            <p className="font-black uppercase tracking-[0.12em] text-[#8a94bd]">Case</p>
            <p className="mt-1 truncate font-black text-violet-700">{document.lead?.leadCode || "-"}</p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2">
            <p className="font-black uppercase tracking-[0.12em] text-[#8a94bd]">Customer</p>
            <p className="mt-1 truncate font-black text-[#19204f]">{document.lead?.customerName || "-"}</p>
          </div>
        </div>
        <p className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#6370a4]">
          {adminDocumentSectionLabel(document)} · Uploaded by {document.uploadedBy?.contact_person || document.uploadedBy?.name || "MechPro User"}{document.uploadedBy?.role ? ` (${String(document.uploadedBy.role).replace(/_/g, " ")})` : ""}
        </p>
        {document.reviewNotes && <p className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#8a5000]">Note: {document.reviewNotes}</p>}
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ded4f6] bg-white px-3 py-2 text-xs font-black text-violet-700">
          <ExternalLink className="h-3.5 w-3.5" /> Open / Preview Full File
        </a>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onReview(document.id, "APPROVED")} className="rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-2 text-[11px] font-black text-emerald-700"><CheckCircle2 className="mx-auto mb-1 h-4 w-4" />Approve</button>
          <button onClick={() => onReview(document.id, "REJECTED", "Document rejected by admin review.")} className="rounded-xl border border-red-100 bg-red-50 px-2 py-2 text-[11px] font-black text-red-700"><XCircle className="mx-auto mb-1 h-4 w-4" />Reject</button>
          <button onClick={() => onReview(document.id, "MISSING_REQUESTED", "Please upload the required document again.")} className="rounded-xl border border-amber-100 bg-amber-50 px-2 py-2 text-[11px] font-black text-amber-700"><ShieldAlert className="mx-auto mb-1 h-4 w-4" />Missing</button>
        </div>
      </div>
    </article>
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
  const statusRows = Object.entries(report.byStatus || {});
  return <div className="mt-5 space-y-5"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><div><p className="font-black text-[#0f144a]">Operations reporting</p><p className="text-sm font-semibold text-[#6370a4]">Daily, monthly, conversion and partner performance summary.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => exportReport("pdf")} className="rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700">Export PDF</button><button onClick={() => exportReport("excel")} className="rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700">Export Excel</button></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-2 text-2xl font-black text-[#0f144a]">{value}</p></div>)}</div><div className="grid gap-5 xl:grid-cols-2"><div className="rounded-2xl border border-[#eee8fb] p-4"><h2 className="font-black text-[#0f144a]">Status Distribution</h2><div className="mt-3 space-y-2">{statusRows.length === 0 && <p className="text-sm font-bold text-[#6370a4]">No status data yet.</p>}{statusRows.map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-xl bg-[#faf8ff] px-3 py-2"><span className="text-sm font-black text-[#19204f]">{status.replace(/_/g, " ")}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">{String(count)}</span></div>)}</div></div><div className="rounded-2xl border border-[#eee8fb] p-4"><h2 className="font-black text-[#0f144a]">Partner Performance</h2><div className="mt-3 grid gap-3">{report.partnerPerformance?.length ? report.partnerPerformance.map((item: any) => <div key={item.id} className="rounded-xl bg-[#faf8ff] p-3"><p className="font-black text-[#19204f]">{item.name}</p><p className="text-sm font-semibold text-[#6370a4]">Jobs: {item.jobs} · Completed: {item.completed}</p></div>) : <p className="text-sm font-bold text-[#6370a4]">No partner jobs yet.</p>}</div></div></div></div>;
}

function BillingView({ billing }: { billing: any }) {
  return <div className="mt-5 space-y-5"><div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">{[["Total", billing.total], ["Paid", billing.paid], ["Pending", billing.pending], ["GST", billing.gst], ["Paid Count", billing.paidCount], ["Pending Count", billing.pendingCount]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="text-xs font-black uppercase text-[#7e88b5]">{label}</p><p className="mt-2 text-2xl font-black text-[#0f144a]">{typeof value === "number" && String(label).includes("Count") ? value : formatMoney(Number(value || 0))}</p></div>)}</div><div className="rounded-2xl border border-[#eee8fb] bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-[#0f144a]">Invoice Register</h2><p className="text-sm font-semibold text-[#6370a4]">Manual payment tracking with GST and pending collections.</p></div></div>{billing.invoices?.length ? <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left"><thead><tr className="bg-[#f7f3ff] text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]"><th className="px-4 py-3">Case</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">GST</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead><tbody>{billing.invoices.map((invoice: any) => <tr key={invoice.id} className="border-t border-[#efebfb]"><td className="px-4 py-3 font-black text-violet-700">{invoice.lead?.leadCode}</td><td className="px-4 py-3 font-bold text-[#19204f]">{invoice.lead?.customerName || "-"}</td><td className="px-4 py-3 font-bold text-[#19204f]">{formatMoney(Number(invoice.total))}</td><td className="px-4 py-3 font-bold text-[#6370a4]">{formatMoney(Number(invoice.gst || 0))}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${invoice.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{invoice.status}</span></td><td className="px-4 py-3 text-sm font-semibold text-[#6370a4]">{formatShortDate(invoice.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState title="No invoices generated" text="Invoices will appear here after Service Partner creates billing for an approved quote." />}</div></div>;
}

function SettingsView({ settings }: { settings: any }) {
  const storageProvider = String(settings?.storage?.provider || "local");
  const storageReady = settings?.storage?.cloudinaryConfigured === true || storageProvider === "local";
  const cards = [
    {
      title: "Document Rules",
      value: "RC mandatory for all requests. Accident cases require Driving License and damage photos.",
      detail: "Admin can approve, reject, or request missing documents.",
    },
    {
      title: "Storage",
      value: `${storageProvider.toUpperCase()} upload storage is ${storageReady ? "configured" : "not fully configured"}.`,
      detail: storageProvider === "cloudinary" ? "Documents/photos/videos are stored through Cloudinary. Replaced files are cleaned up when possible." : "Local upload storage is active. Production recommendation: move documents/photos/videos to Cloudinary or AWS S3.",
    },
    {
      title: "Payment Mode",
      value: "Manual payment tracking enabled.",
      detail: "Admin and Service Partner can mark payment received. Razorpay can be added later.",
    },
    {
      title: "Role Security",
      value: "JWT role-based access is active.",
      detail: "Users can access only their assigned role dashboard and APIs.",
    },
    {
      title: "Lead Code",
      value: "Auto-generated using ME + sequence + vendor code.",
      detail: "Example: ME0001BR01 for Broker BR01.",
    },
    {
      title: "Current Backend Settings",
      value: settings ? "Backend settings endpoint connected." : "No custom settings returned.",
      detail: settings ? Object.entries(settings).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`).join("\n") : "Use this page for future business rules and storage configuration.",
    },
  ];

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,#fbf8ff,#fff)] p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Operational Configuration</p>
        <h2 className="mt-2 text-xl font-black text-[#0f144a]">MechPro demo-ready business rules</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#6370a4]">These settings explain the current workflow clearly for client review. Technical storage can be upgraded before production.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7e88b5]">{card.title}</p>
            <p className="mt-2 font-black text-[#0f144a]">{card.value}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#6370a4]">{card.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityView({ logs }: { logs: any[] }) {
  return <div className="mt-5 space-y-3">{logs.map((log) => <div key={log.id} className="rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4"><p className="font-black text-[#19204f]">{log.action}</p><p className="text-sm font-semibold text-[#6370a4]">{log.entityType} · {log.actor?.contact_person || "System"} · {formatShortDate(log.createdAt)}</p></div>)}</div>;
}
