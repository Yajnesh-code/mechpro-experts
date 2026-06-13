"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, ExternalLink, FileText, IndianRupee, RefreshCcw, Upload, Video } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLead } from "@/hooks/useLead";
import { useServicePartners } from "@/hooks/useServicePartners";
import { compressImageFile } from "@/lib/fileCompression";
import { ALL_STATUSES, adminApi, formatMoney, formatShortDate, operationsApi, type UiDocument, type UiLeadStatus } from "@/lib/operations";
import { PriorityPill, StatusPill } from "./LeadTables";

type LeadDetailRole = "admin" | "sales" | "service" | "customer";
type DocumentGroupKey = "initial" | "service" | "billing" | "other";
type UploadOption = { label: string; type: string; hint: string };

const uploadOptionsByRole: Record<LeadDetailRole, UploadOption[]> = {
  admin: [],
  sales: [
    { label: "RC Document", type: "RC_DOCUMENT", hint: "Vehicle registration certificate or RC smart card." },
    { label: "Driving License", type: "OTHER", hint: "Required for accident cases when collected by the partner." },
    { label: "Insurance Policy", type: "INSURANCE_DOCUMENT", hint: "Policy copy or insurance claim document." },
    { label: "Initial / Damage Photos", type: "VEHICLE_PHOTO", hint: "Customer-provided initial vehicle or damage photos." },
    { label: "Other Customer Document", type: "OTHER", hint: "Any additional customer-side document." },
  ],
  customer: [
    { label: "RC Document", type: "RC_DOCUMENT", hint: "Upload your vehicle RC if requested." },
    { label: "Driving License", type: "OTHER", hint: "Required for accident cases when requested." },
    { label: "Insurance Policy", type: "INSURANCE_DOCUMENT", hint: "Insurance policy or claim related document." },
    { label: "Damage Photos", type: "VEHICLE_PHOTO", hint: "Vehicle damage photos requested by MechPro." },
    { label: "Other Requested Document", type: "OTHER", hint: "Any missing document requested by Admin." },
  ],
  service: [
    { label: "Vehicle Received Photos", type: "VEHICLE_PHOTO", hint: "Front, rear, side, odometer and received-condition photos." },
    { label: "Damage / Inspection Photos", type: "SERVICE_DOCUMENT", hint: "Detailed damage and inspection proof." },
    { label: "Inspection Video", type: "SERVICE_DOCUMENT", hint: "Walkaround or inspection video." },
    { label: "Work Progress Media", type: "SERVICE_DOCUMENT", hint: "Repair progress photos/videos." },
    { label: "After Repair Photos", type: "SERVICE_DOCUMENT", hint: "Completion proof after repair." },
    { label: "Final Delivery Video", type: "SERVICE_DOCUMENT", hint: "Delivery proof or final vehicle video." },
    { label: "Quote Document", type: "QUOTE_DOCUMENT", hint: "Formal quote document, if available." },
    { label: "Invoice Document", type: "INVOICE_DOCUMENT", hint: "Invoice PDF/image after billing." },
    { label: "Service Report", type: "SERVICE_DOCUMENT", hint: "Inspection or final service report." },
  ],
};

function uploadValue(option: UploadOption) {
  return `${option.type}|${option.label}`;
}

function getUploadOptions(role: LeadDetailRole) {
  return uploadOptionsByRole[role];
}

function getUploadIntro(role: LeadDetailRole) {
  if (role === "sales") return "Upload only customer/vehicle documents collected before assignment. Service photos, quote and invoice are handled by the Service Partner.";
  if (role === "customer") return "Upload only requested customer documents. Service photos, quote and invoice will be uploaded by MechPro/Service Partner.";
  if (role === "service") return "Upload only job/service proof such as inspection photos, videos, work progress, quote, invoice and final report.";
  return "Admin reviews all uploaded files here. Uploads are handled by Sales, Customer, or Service Partner based on workflow.";
}

const groupLabelByRole: Record<LeadDetailRole, Record<DocumentGroupKey, string>> = {
  admin: {
    initial: "Initial Documents",
    service: "Service Partner Uploads",
    billing: "Quote & Invoice Documents",
    other: "Other Documents",
  },
  sales: {
    initial: "Submitted Customer Documents",
    service: "Service Partner Updates",
    billing: "Quote & Invoice Documents",
    other: "Other Documents",
  },
  service: {
    initial: "Customer / Case Documents",
    service: "My Service Uploads",
    billing: "Quote & Invoice Documents",
    other: "Other Documents",
  },
  customer: {
    initial: "Submitted Documents",
    service: "Service Updates",
    billing: "Quote & Invoice",
    other: "Other Documents",
  },
};

export function LeadDetailView({ id, role }: { id: string; role: "admin" | "sales" | "service" | "customer" }) {
  const { lead, loading, error, refetch } = useLead(id);
  const { toast } = useToast();
  const [assignOpen, setAssignOpen] = useState(false);
  const [status, setStatus] = useState<UiLeadStatus>("Car Received");
  const [amount, setAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const initialUploadOptions = getUploadOptions(role);
  const [uploadType, setUploadType] = useState(initialUploadOptions[0] ? uploadValue(initialUploadOptions[0]) : "");
  const [uploading, setUploading] = useState(false);
  const [reuploadingId, setReuploadingId] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<{ name: string; size: string; preview?: string } | null>(null);
  const listPath = role === "service" ? "/dashboard/service/jobs" : role === "customer" ? "/dashboard/customer/track" : `/dashboard/${role}/leads`;
  const serviceStatusOptions = ALL_STATUSES.filter((item) => !["Quote Shared", "Bill Generated", "Payment Done"].includes(item));
  const uploadOptions = getUploadOptions(role);
  const selectedUploadOption = uploadOptions.find((option) => uploadValue(option) === uploadType);
  const canUploadDocuments = uploadOptions.length > 0;
  const fileAccept = role === "service" ? ".pdf,.jpg,.jpeg,.png,.mp4,.mov,.webm" : ".pdf,.jpg,.jpeg,.png";

  useEffect(() => {
    return () => {
      if (lastUpload?.preview) URL.revokeObjectURL(lastUpload.preview);
    };
  }, [lastUpload?.preview]);

  useEffect(() => {
    if (!uploadOptions.length) {
      setUploadType("");
      return;
    }
    if (!uploadOptions.some((option) => uploadValue(option) === uploadType)) {
      setUploadType(uploadValue(uploadOptions[0]));
    }
  }, [role, uploadOptions, uploadType]);

  async function updateStatus() {
    if (!lead) return;
    try {
      await operationsApi.updateStatus(lead.id, status);
      toast("success", "Status updated successfully.");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Status update failed");
    }
  }

  async function submitQuote() {
    if (!lead || !amount) return;
    try {
      await operationsApi.createQuote(lead.id, Number(amount), "Service Charges");
      toast("success", "Quote uploaded successfully.");
      setAmount("");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Quote upload failed");
    }
  }

  async function submitInvoice() {
    if (!lead || !amount) return;
    const hasApprovedQuote = lead.quoteHistory.some((quote) => String(quote.status).toUpperCase() === "APPROVED");
    if (!hasApprovedQuote) {
      toast("error", "Customer must approve a quote before invoice generation.");
      return;
    }
    try {
      await operationsApi.createInvoice(lead.id, Number(amount));
      toast("success", "Invoice generated successfully.");
      setAmount("");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Invoice generation failed");
    }
  }

  async function decideQuote(decision: "APPROVED" | "REJECTED" | "REVISION_REQUESTED") {
    if (!lead?.quote) return;
    try {
      await operationsApi.decideQuote(lead.id, lead.quote.id, decision, quoteNotes || undefined);
      const message = decision === "APPROVED" ? "Quote approved." : decision === "REJECTED" ? "Quote rejected." : "Quote revision requested.";
      toast("success", message);
      setQuoteNotes("");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Quote action failed");
    }
  }

  async function markPaid() {
    if (!lead?.bill) return;
    try {
      await operationsApi.markInvoicePaid(lead.id, lead.bill.id, {
        paymentMode,
        paymentReference: paymentReference || undefined,
        paymentNotes: paymentNotes || undefined,
      });
      toast("success", "Payment marked successfully.");
      setPaymentReference("");
      setPaymentNotes("");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Payment update failed");
    }
  }

  async function uploadFile(file?: File) {
    if (!lead || !file) return;
    const selectedType = uploadType.split("|")[0];
    if (!selectedType) {
      toast("error", "Select a document type before upload.");
      return;
    }
    setUploading(true);
    try {
      const preparedFile = await compressImageFile(file);
      if (!preparedFile) return;
      if (lastUpload?.preview) URL.revokeObjectURL(lastUpload.preview);
      await operationsApi.uploadDocument(lead.id, preparedFile, selectedType);
      setLastUpload({
        name: preparedFile.name,
        size: `${Math.max(1, Math.round(preparedFile.size / 1024))} KB`,
        preview: preparedFile.type.startsWith("image/") ? URL.createObjectURL(preparedFile) : undefined,
      });
      toast("success", "Document uploaded successfully.");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Document upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function reuploadDocument(document: UiDocument, file?: File) {
    if (!lead || !file) return;
    setReuploadingId(document.id);
    try {
      const preparedFile = await compressImageFile(file);
      if (!preparedFile) return;
      await operationsApi.uploadDocument(lead.id, preparedFile, document.type, document.id);
      toast("success", "Replacement document uploaded for review.");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Document re-upload failed");
    } finally {
      setReuploadingId(null);
    }
  }

  async function reviewDocument(documentId: string, reviewStatus: string, reviewNotes?: string) {
    try {
      await adminApi.reviewDocument(documentId, { reviewStatus, reviewNotes });
      toast("success", "Document review updated.");
      refetch();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Document review failed");
    }
  }

  if (loading) return <Panel><p className="font-bold text-[#6370a4]">Loading service request details...</p></Panel>;
  if (error || !lead) return <Panel><p className="font-bold text-red-600">{error || "Service request not found"}</p><button className="mt-3 rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-bold text-violet-700" onClick={refetch}>Retry</button></Panel>;

  const hasApprovedQuote = lead.quoteHistory.some((quote) => String(quote.status).toUpperCase() === "APPROVED");
  const invoiceDocument = lead.documents.find((document) => document.type === "INVOICE_DOCUMENT");

  return (
    <div className="space-y-5">
      <Link href={listPath} className="inline-flex items-center gap-2 rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black text-[#0f144a]">{lead.leadId}</h1><StatusPill status={lead.status} /><PriorityPill priority={lead.priority} /></div><p className="mt-1 text-sm font-semibold text-[#6370a4]">Created {formatShortDate(lead.createdAt)} · {lead.location}</p></div>
          {role === "admin" && <button className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white" onClick={() => setAssignOpen(true)}>{lead.assignedServicePartner ? "Reassign Service Partner" : "Assign Service Partner"}</button>}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <InfoCard title="Customer Information" rows={[["Name", lead.customer.name], ["Mobile", lead.customer.mobile], ["Email", lead.customer.email], ["Address", lead.customer.address]]} />
        <InfoCard title="Vehicle Information" rows={[["Vehicle", `${lead.vehicle.brand} ${lead.vehicle.model}`], ["Number", lead.vehicle.number], ["Fuel", lead.vehicle.fuelType], ["Insurance", lead.vehicle.insuranceCompany]]} />
        <InfoCard title="Assignment" rows={[["Sales Partner", lead.salesPartner.name], ["Service Partner", lead.assignedServicePartner?.name || "Not assigned"], ["Service Type", lead.serviceType], ["Services", lead.services.join(", ")]]} />
        <Panel><h2 className="text-lg font-black text-[#0f144a]">Timeline</h2><div className="mt-4 space-y-3">{lead.timeline.map((item, index) => <div key={`${item.status}-${index}`} className="flex gap-3"><span className={`mt-1 h-3 w-3 rounded-full ${item.isCurrent ? "bg-violet-600" : item.isCompleted ? "bg-emerald-500" : "bg-[#d8cdf4]"}`} /><div><p className="text-sm font-black text-[#19204f]">{item.status}</p><p className="text-xs font-semibold text-[#6370a4]">{item.timestamp ? formatShortDate(item.timestamp) : "Pending"}</p></div></div>)}</div></Panel>
      </div>
      <Panel>
        <h2 className="text-lg font-black text-[#0f144a]">Documents</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#6370a4]">{getUploadIntro(role)}</p>
        {canUploadDocuments ? (
          <div className="mt-4 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <select className="min-h-11 rounded-xl border border-[#ded4f6] bg-white px-3 py-2 text-sm font-black text-[#19204f]" value={uploadType} onChange={(event) => setUploadType(event.target.value)}>
                {uploadOptions.map((option) => <option key={uploadValue(option)} value={uploadValue(option)}>{option.label}</option>)}
              </select>
              <label className="cursor-pointer rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700 transition hover:bg-violet-50">
                <Upload className="mr-1 inline h-4 w-4" /> {uploading ? "Uploading..." : "Upload File"}
                <input type="file" className="hidden" accept={fileAccept} onChange={(event) => uploadFile(event.target.files?.[0])} />
              </label>
              <label className="cursor-pointer rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700 transition hover:bg-violet-50">
                <Camera className="mr-1 inline h-4 w-4" /> Take Photo
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(event) => uploadFile(event.target.files?.[0])} />
              </label>
              {role === "service" && (
                <label className="cursor-pointer rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700 transition hover:bg-violet-50">
                  <Video className="mr-1 inline h-4 w-4" /> Record Video
                  <input type="file" className="hidden" accept="video/*" capture="environment" onChange={(event) => uploadFile(event.target.files?.[0])} />
                </label>
              )}
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-[#6370a4]">
              Selected: <span className="text-[#19204f]">{selectedUploadOption?.label || "Document"}</span>
              {selectedUploadOption?.hint ? ` - ${selectedUploadOption.hint}` : ""}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-violet-100 bg-[#faf8ff] p-4 text-sm font-bold text-[#6370a4]">
            Admin can review, approve, reject, or request missing documents. Uploads are collected from Sales Partner, Customer, or assigned Service Partner.
          </div>
        )}
        {lastUpload && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            {lastUpload.preview ? <img src={lastUpload.preview} alt={lastUpload.name} className="h-14 w-14 rounded-xl object-cover" /> : <FileText className="h-8 w-8 shrink-0 text-emerald-700" />}
            <div className="min-w-0">
              <p className="font-black text-emerald-800"><CheckCircle2 className="mr-1 inline h-4 w-4" /> Uploaded successfully</p>
              <p className="truncate text-xs font-bold text-emerald-700">{lastUpload.name} · {lastUpload.size}</p>
            </div>
          </div>
        )}
        {role === "service" && (
          <div className="mt-3 grid gap-2 text-xs font-bold text-[#6370a4] md:grid-cols-3">
            <p className="rounded-xl bg-[#faf8ff] px-3 py-2">Vehicle received: capture front/rear/side and odometer photos.</p>
            <p className="rounded-xl bg-[#faf8ff] px-3 py-2">Inspection: capture damage photos and inspection video.</p>
            <p className="rounded-xl bg-[#faf8ff] px-3 py-2">Completion: capture after-repair photos and final delivery video.</p>
          </div>
        )}
        <div className="mt-5 space-y-5">
          {lead.documents.length === 0 && <p className="text-sm font-bold text-[#6370a4]">No documents uploaded yet.</p>}
          {(["initial", "service", "billing", "other"] as const).map((group) => {
            const docs = groupDocuments(lead.documents)[group];
            if (!docs.length) return null;
            return (
              <div key={group}>
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#7e88b5]">{groupLabelByRole[role][group]}</h3>
                <div className="mt-3 grid gap-4 xl:grid-cols-2">
                  {docs.map((document) => <DocumentCard key={document.id} document={document} canReview={role === "admin"} onReview={reviewDocument} onReupload={reuploadDocument} reuploading={reuploadingId === document.id} />)}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      {(lead.quote || lead.bill) && (
        <Panel>
          <h2 className="text-lg font-black text-[#0f144a]">Quote & Billing</h2>
          {lead.quote && (
            <div className="mt-4 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-black text-[#19204f]">Quote Amount: {formatMoney(lead.quote.amount)}</p><p className="text-sm font-semibold text-[#6370a4]">Status: {lead.quote.status}</p></div>
                {role === "customer" && ["PENDING", "REVISION_REQUESTED"].includes(String(lead.quote.status).toUpperCase()) && (
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white" onClick={() => decideQuote("APPROVED")}>Approve Quote</button>
                    <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white" onClick={() => decideQuote("REJECTED")}>Reject Quote</button>
                    <button className="rounded-xl border border-[#ded4f6] bg-white px-4 py-2 text-sm font-black text-violet-700" onClick={() => decideQuote("REVISION_REQUESTED")}>Request Revision</button>
                  </div>
                )}
              </div>
              {role === "customer" && ["PENDING", "REVISION_REQUESTED"].includes(String(lead.quote.status).toUpperCase()) && (
                <textarea
                  className="mt-3 min-h-20 w-full rounded-2xl border border-[#ded4f6] px-4 py-3 text-sm font-semibold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  placeholder="Optional reason for rejection or revision request"
                  value={quoteNotes}
                  onChange={(event) => setQuoteNotes(event.target.value)}
                />
              )}
            </div>
          )}
          {lead.quoteHistory.length > 1 && (
            <div className="mt-4 rounded-2xl border border-[#eee8fb] bg-white p-4">
              <h3 className="font-black text-[#0f144a]">Quote History</h3>
              <div className="mt-3 space-y-2">
                {lead.quoteHistory.map((quote, index) => (
                  <div key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf8ff] px-3 py-2">
                    <p className="text-sm font-black text-[#19204f]">Quote v{lead.quoteHistory.length - index}: {formatMoney(quote.amount)}</p>
                    <p className="text-xs font-bold text-[#6370a4]">{quote.status.replace(/_/g, " ")} · {quote.createdAt ? formatShortDate(quote.createdAt) : "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lead.bill && (
            <div className="mt-4 rounded-2xl border border-[#eee8fb] bg-[#faf8ff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-[#19204f]">Invoice Total: {formatMoney(lead.bill.total)}</p>
                  <p className="text-sm font-semibold text-[#6370a4]">Status: {lead.bill.status}</p>
                  {lead.bill.paymentMode && <p className="text-xs font-bold text-[#6370a4]">Payment: {lead.bill.paymentMode.replace(/_/g, " ")} {lead.bill.paymentReference ? `· Ref ${lead.bill.paymentReference}` : ""}</p>}
                  {invoiceDocument ? (
                    <a href={invoiceDocument.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 rounded-xl border border-[#ded4f6] bg-white px-3 py-2 text-xs font-black text-violet-700"><ExternalLink className="h-3.5 w-3.5" /> Open Invoice Document</a>
                  ) : (
                    <p className="mt-2 text-xs font-bold text-[#8a94bd]">Invoice document not uploaded yet.</p>
                  )}
                </div>
                {role === "customer" && String(lead.bill.status).toUpperCase() === "UNPAID" && <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">Payment pending</span>}
              </div>
              {(role === "admin" || role === "service") && String(lead.bill.status).toUpperCase() === "UNPAID" && (
                <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
                  <select className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-bold" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="INSURANCE_SETTLEMENT">Insurance Settlement</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-bold" placeholder="Payment reference / UTR" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} />
                  <input className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-bold" placeholder="Payment notes" value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
                  <button className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white" onClick={markPaid}>Mark Payment Received</button>
                </div>
              )}
            </div>
          )}
        </Panel>
      )}
      {role === "service" && (
        <Panel>
          <h2 className="text-lg font-black text-[#0f144a]">Service Actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-bold" value={status} onChange={(e) => setStatus(e.target.value as UiLeadStatus)}>{serviceStatusOptions.map((item) => <option key={item}>{item}</option>)}</select>
            <button className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white" onClick={updateStatus}><RefreshCcw className="mr-1 inline h-4 w-4" /> Update Status</button>
            <input className="rounded-xl border border-[#ded4f6] px-3 py-2 text-sm font-bold" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700" onClick={submitQuote}><FileText className="mr-1 inline h-4 w-4" /> Upload Quote</button>
            <button disabled={!hasApprovedQuote} className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={submitInvoice}><IndianRupee className="mr-1 inline h-4 w-4" /> Generate Invoice</button>
          </div>
          {!hasApprovedQuote && <p className="mt-2 text-xs font-bold text-[#8a94bd]">Invoice unlocks after the customer approves a quote.</p>}
        </Panel>
      )}
      {assignOpen && <AssignmentModal leadId={lead.id} currentPartner={lead.assignedServicePartner?.id} onClose={() => setAssignOpen(false)} onDone={() => { setAssignOpen(false); refetch(); }} />}
    </div>
  );
}

function AssignmentModal({ leadId, currentPartner, onClose, onDone }: { leadId: string; currentPartner?: string; onClose: () => void; onDone: () => void }) {
  const { partners, loading, error } = useServicePartners();
  const { toast } = useToast();
  const [selected, setSelected] = useState(currentPartner || "");
  const [saving, setSaving] = useState(false);

  async function assign() {
    if (!selected) return;
    setSaving(true);
    try {
      await operationsApi.assignLead(leadId, selected);
      toast("success", "Lead assigned successfully.");
      onDone();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11153d]/45 p-4 backdrop-blur"><div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,20,74,0.25)]"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-[#0f144a]">Assign Service Partner</h2><button className="text-sm font-black text-[#6370a4]" onClick={onClose}>Close</button></div>{loading && <p className="mt-5 font-bold text-[#6370a4]">Loading partners...</p>}{error && <p className="mt-5 font-bold text-red-600">{error}</p>}<div className="mt-5 space-y-3">{partners.map((partner) => <button key={partner.id} onClick={() => setSelected(partner.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected === partner.id ? "border-violet-400 bg-violet-50" : "border-[#eee8fb] hover:bg-[#fbf9ff]"}`}><p className="font-black text-[#0f144a]">{partner.name}</p><p className="text-sm font-semibold text-[#6370a4]">{partner.type} · {partner.location} · {partner.rating} rating</p></button>)}</div><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border border-[#ded4f6] px-4 py-2 text-sm font-black text-violet-700" onClick={onClose}>Cancel</button><button disabled={!selected || saving} className="rounded-xl bg-mechpro-gradient px-4 py-2 text-sm font-black text-white disabled:opacity-50" onClick={assign}><CheckCircle2 className="mr-1 inline h-4 w-4" /> {saving ? "Assigning..." : "Assign Partner"}</button></div></div></div>;
}

function InfoCard({ title, rows }: { title: string; rows: string[][] }) {
  return <Panel><h2 className="text-lg font-black text-[#0f144a]">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(([key, value]) => <div key={key} className="rounded-2xl bg-[#faf8ff] p-4"><p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a94bd]">{key}</p><p className="mt-1 text-sm font-black text-[#19204f]">{value || "-"}</p></div>)}</div></Panel>;
}

function groupDocuments(documents: UiDocument[]) {
  return documents.reduce<Record<DocumentGroupKey, UiDocument[]>>((groups, document) => {
    const type = document.type;
    const uploaderRole = String(document.uploadedByRole || "").toUpperCase();
    if (["QUOTE_DOCUMENT", "INVOICE_DOCUMENT"].includes(type)) {
      groups.billing.push(document);
    } else if (uploaderRole === "SERVICE_PARTNER" || type === "SERVICE_DOCUMENT") {
      groups.service.push(document);
    } else if (["RC_DOCUMENT", "VEHICLE_PHOTO", "INSURANCE_DOCUMENT"].includes(type) || type === "OTHER") {
      groups.initial.push(document);
    } else {
      groups.other.push(document);
    }
    return groups;
  }, { initial: [], service: [], billing: [], other: [] });
}

function documentKind(document: UiDocument) {
  const url = document.url.toLowerCase();
  if (/\.(png|jpg|jpeg|webp|gif)$/.test(url)) return "image";
  if (/\.pdf$/.test(url)) return "pdf";
  if (/\.(mp4|mov|webm)$/.test(url)) return "video";
  return "file";
}

function reviewBadgeClass(status?: string) {
  const normalized = String(status || "PENDING_REVIEW").toUpperCase();
  if (normalized === "APPROVED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "REJECTED") return "border-red-200 bg-red-50 text-red-700";
  if (normalized === "MISSING_REQUESTED") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-violet-200 bg-violet-50 text-violet-700";
}

function DocumentCard({
  document,
  canReview,
  onReview,
  onReupload,
  reuploading,
}: {
  document: UiDocument;
  canReview: boolean;
  onReview: (id: string, status: string, notes?: string) => void;
  onReupload: (document: UiDocument, file?: File) => void;
  reuploading: boolean;
}) {
  const kind = documentKind(document);
  const normalizedReviewStatus = String(document.reviewStatus || "PENDING_REVIEW").toUpperCase();
  const label = normalizedReviewStatus.replace(/_/g, " ");
  const needsReupload = ["REJECTED", "MISSING_REQUESTED"].includes(normalizedReviewStatus);
  return (
    <article className="overflow-hidden rounded-2xl border border-[#eee8fb] bg-[#faf8ff]">
      <div className="bg-white">
        {kind === "image" && <img src={document.url} alt={document.name} className="h-52 w-full object-cover" />}
        {kind === "pdf" && (
          <object data={document.url} type="application/pdf" className="h-64 w-full bg-white">
            <div className="flex h-64 flex-col items-center justify-center gap-3 bg-white p-4 text-center">
              <FileText className="h-8 w-8 text-violet-500" />
              <p className="text-sm font-black text-[#19204f]">PDF preview unavailable</p>
              <p className="max-w-sm text-xs font-semibold text-[#6370a4]">Open the full file to view or download this document.</p>
            </div>
          </object>
        )}
        {kind === "video" && <video src={document.url} controls className="h-52 w-full bg-black object-contain" />}
        {kind === "file" && <div className="flex h-32 items-center justify-center bg-white text-sm font-black text-[#6370a4]">Preview not available</div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[#19204f]">{document.name}</p>
            <p className="text-xs font-semibold text-[#6370a4]">{document.type.replace(/_/g, " ")} · Version {document.version || 1} · {document.size || "file"} · Uploaded by {document.uploadedBy}{document.uploadedByRole ? ` (${document.uploadedByRole.replace(/_/g, " ")})` : ""}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${reviewBadgeClass(document.reviewStatus)}`}>{label}</span>
            {document.isCurrent === false && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">Previous Version</span>}
          </div>
        </div>
        {document.reviewNotes && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#6370a4]">Review note: {document.reviewNotes}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={document.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-[#ded4f6] bg-white px-3 py-2 text-xs font-black text-violet-700"><ExternalLink className="h-3.5 w-3.5" /> Open Full File</a>
          {needsReupload && (
            <label className="cursor-pointer rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100">
              {reuploading ? "Uploading..." : "Upload Replacement"}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov" onChange={(event) => onReupload(document, event.target.files?.[0])} />
            </label>
          )}
          {canReview && (
            <>
              <button onClick={() => onReview(document.id, "APPROVED")} className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Approve</button>
              <button onClick={() => onReview(document.id, "REJECTED", "Document rejected by admin review.")} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700">Reject</button>
              <button onClick={() => onReview(document.id, "MISSING_REQUESTED", "Please upload the required document again.")} className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Request Missing</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <section className="rounded-[24px] border border-[#e3daf7] bg-white p-5 shadow-[0_18px_50px_rgba(111,43,255,0.08)]">{children}</section>;
}




