"use client";

import { FormEvent, useState } from "react";

const tabs = ["Request Demo", "Register Business", "Become Partner", "Contact Sales"];

export function LeadCaptureForm() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="glass-card rounded-3xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab
                ? "bg-mechpro-gradient text-white"
                : "bg-white text-mechpro-ink/75 hover:bg-mechpro-mist"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Field label="Company Name" placeholder="Apex Mobility Pvt. Ltd." required />
        <Field label="Contact Person" placeholder="Neha Mehra" required />
        <Field label="Email" type="email" placeholder="neha@apexmobility.com" required />
        <Field label="Phone" type="tel" placeholder="+91 98200 11223" required />
        <SelectField
          label="Business Type"
          required
          options={[
            "Large Corporate",
            "Insurance Broker / Agent",
            "Insurance Web Aggregator",
            "Fleet Owner",
            "Insurance Company",
            "Workshop / Service Partner",
          ]}
        />
        <SelectField label="City" required options={["Mumbai", "Thane", "Navi Mumbai", "Panvel", "Palghar"]} />
        <SelectField label="Number Of Vehicles" options={["1-10", "11-50", "51-200", "200+"]} />
        <SelectField
          label="Service Interested"
          options={[
            "Service Consultancy",
            "Service Packages",
            "Accident Repairs",
            "Claim Management",
            "Inspection / Pre-inspection",
            "Part Procurement",
          ]}
        />
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-mechpro-ink/60">Message</label>
          <textarea
            className="h-28 w-full rounded-xl border border-mechpro-purple/20 bg-white px-3 py-2 text-sm outline-none focus:border-mechpro-magenta"
            placeholder="Tell us your business requirement..."
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-mechpro-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:-translate-y-0.5"
          >
            {submitted ? "Submitted Successfully" : `Submit ${activeTab}`}
          </button>
          <p className="mt-3 text-center text-xs text-mechpro-ink/55">Your data is encrypted and used only for onboarding support.</p>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
};

function Field({ label, placeholder, type = "text", required = false }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-mechpro-ink/60">{label}</label>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mechpro-purple/20 bg-white px-3 py-2 text-sm outline-none focus:border-mechpro-magenta"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  options: string[];
  required?: boolean;
};

function SelectField({ label, options, required = false }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-mechpro-ink/60">{label}</label>
      <select
        required={required}
        defaultValue=""
        className="w-full rounded-xl border border-mechpro-purple/20 bg-white px-3 py-2 text-sm outline-none focus:border-mechpro-magenta"
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
