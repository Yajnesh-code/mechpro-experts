"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { businessTypes, cities, vehicleRanges } from "@/lib/auth";
import { authApi } from "@/lib/api";

const documents = [
  { title: "Business Registration Proof", note: "PDF, JPG, PNG - max 5MB", required: true },
  { title: "GST Certificate", note: "optional", required: false },
  { title: "Authorization Letter", note: "optional", required: false },
  { title: "Workshop Photos / Broker License", note: "role based", required: false },
];

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const roleMap: Record<string, string> = {
      Corporate: "corporate",
      "Insurance Broker": "broker",
      "Insurance Company": "insurance",
      "Fleet Owner": "fleet",
      "Workshop / Service Provider": "workshop",
    };

    const payload = {
      company_name: String(form.get("company_name") ?? ""),
      contact_person: String(form.get("contact_person") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
      confirm_password: String(form.get("confirm_password") ?? ""),
      business_type: roleMap[String(form.get("business_type") ?? "Corporate")] ?? "corporate",
      city: String(form.get("city") ?? ""),
      number_of_vehicles: String(form.get("number_of_vehicles") ?? ""),
      gst_number: String(form.get("gst_number") ?? ""),
    };

    try {
      await authApi.register(payload);
      router.push("/auth/pending-approval");
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message}. Continuing to pending approval for UI review.` : "Continuing to pending approval for UI review.");
      window.setTimeout(() => router.push("/auth/pending-approval"), 800);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-[1.75rem] border border-[#e8e4f4] bg-white p-5 shadow-[0_18px_50px_rgba(124,58,237,0.10)] sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">Business registration</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-[#0f0f1a] sm:text-4xl">Register Your Business</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#64748b]">Apply for access to the MechPro Experts partner ecosystem. Admin approval is required before dashboard access is activated.</p>

        <div className="mt-5 grid gap-3 rounded-2xl border border-violet-100 bg-[#f8f7ff] p-4 sm:grid-cols-3">
          {[
            ["01", "Business details"],
            ["02", "OTP verification"],
            ["03", "Admin approval"],
          ].map(([count, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-black text-white shadow-lg shadow-violet-100">{count}</span>
              <span className="text-xs font-black uppercase tracking-[.08em] text-[#64748b]">{label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="company_name" label="Company Name *" defaultValue="Acme Corp Pvt. Ltd." />
            <Field name="contact_person" label="Contact Person *" defaultValue="Rajesh Kumar" />
            <Field name="email" label="Email Address *" defaultValue="rajesh@acmeco.in" type="email" />
            <Field name="phone" label="Phone Number *" defaultValue="+91 98765 43210" />
            <Field name="password" label="Password *" defaultValue="mechpro123" type="password" />
            <Field name="confirm_password" label="Confirm Password *" defaultValue="mechpro123" type="password" />
            <Select name="business_type" label="Business Type *" options={businessTypes} />
            <Select name="city" label="City *" options={cities} />
            <Select name="number_of_vehicles" label="Number of Vehicles" options={vehicleRanges} />
            <Field name="gst_number" label="GST Number Optional" defaultValue="27AAACE0531C1Z5" />
          </div>

          <div className="border-t border-[#e8e4f4] pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#0f0f1a]">Trust Verification Documents</p>
                <p className="mt-1 text-xs font-semibold text-[#64748b]">Upload the required business proof now or add optional files later.</p>
              </div>
              <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-[.12em] text-violet-600 sm:inline-flex">Secure</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {documents.map((doc, index) => (
                <label key={doc.title} className={`${index === 0 ? "sm:col-span-2" : ""} flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-violet-300 bg-[#f8f7ff] px-4 py-4 text-violet-700 transition hover:border-fuchsia-400 hover:bg-white`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">⇧</span>
                  <span>
                    <span className="block text-xs font-black">{doc.title}</span>
                    <span className="block text-[11px] font-semibold text-violet-500/70">{doc.required ? "Required" : "Optional"} · {doc.note}</span>
                  </span>
                  <input type="file" className="hidden" />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">{submitting ? "Submitting registration..." : "Submit Registration"}</button>
          {notice && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{notice}</div>}
          <p className="text-center text-sm font-semibold text-[#64748b]">Already have an account? <Link href="/auth/login" className="font-black text-violet-600">Login →</Link></p>
        </form>
      </div>
    </section>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[#64748b]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
    </label>
  );
}

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[#64748b]">{label}</span>
      <select name={name} className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
