"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BatteryCharging,
  Car,
  CarFront,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Image as ImageIcon,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  Paintbrush,
  Route,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  Video,
  Wrench,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { compressImageFile, compressImageFiles } from "@/lib/fileCompression";
import { operationsApi, type UiPriority } from "@/lib/operations";

type ServiceOption = {
  label: string;
  value: string;
  description: string;
  accident?: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const serviceOptions: ServiceOption[] = [
  { label: "Accident Claim", value: "Accident Claim", description: "Accident repair and claim support", accident: true, icon: ShieldAlert },
  { label: "Insurance Claim", value: "Insurance Claim", description: "Insurance claim assistance", icon: ShieldCheck },
  { label: "General Service", value: "General Service", description: "Routine car service request", icon: Wrench },
  { label: "Breakdown Assistance", value: "Breakdown Assistance", description: "Emergency roadside support", icon: AlertTriangle },
  { label: "Towing", value: "Towing", description: "Vehicle towing request", icon: Truck },
  { label: "Battery Issue", value: "Battery Issue", description: "Battery support or replacement", icon: BatteryCharging },
  { label: "Tyre Issue", value: "Tyre Issue", description: "Tyre puncture or replacement", icon: CarFront },
  { label: "Denting & Painting", value: "Denting & Painting", description: "Body repair and paint work", icon: Paintbrush },
  { label: "Vehicle Inspection", value: "Vehicle Inspection", description: "Inspection and assessment", icon: ClipboardCheck },
  { label: "Pickup & Drop", value: "Pickup & Drop", description: "Vehicle pickup and delivery", icon: Route },
  { label: "Other", value: "Other", description: "Other vehicle support", icon: MoreHorizontal },
];

const priorities: UiPriority[] = ["Low", "Medium", "High", "Urgent"];
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

type RequestForm = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuelType: string;
  insuranceCompany: string;
  serviceType: string;
  priority: UiPriority;
  location: string;
  notes: string;
};

type UploadFiles = {
  rc?: File;
  dl?: File;
  photos: File[];
  videos: File[];
  insurance?: File;
  other: File[];
};

const initialForm: RequestForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  vehicleNumber: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  fuelType: "Petrol",
  insuranceCompany: "",
  serviceType: "Accident Claim",
  priority: "High",
  location: "",
  notes: "",
};

export function LeadCreateForm({ actor = "sales" }: { actor?: "sales" | "customer" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RequestForm>(initialForm);
  const [files, setFiles] = useState<UploadFiles>({ photos: [], videos: [], other: [] });

  const selectedService = useMemo(
    () => serviceOptions.find((item) => item.value === form.serviceType) ?? serviceOptions[0],
    [form.serviceType],
  );
  const isAccident = Boolean(selectedService.accident);
  const isCustomer = actor === "customer";
  const entityLabel = isCustomer ? "Service Request" : "Lead / Case";

  function setField<K extends keyof RequestForm>(key: K, value: RequestForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!form.name.trim()) return "Customer name is required.";
      if (!/^\d{10}$/.test(form.mobile.trim())) return "Enter a valid 10-digit mobile number.";
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    }
    if (step === 2) {
      if (!form.vehicleNumber.trim()) return "Vehicle number is required.";
      if (!form.brand.trim()) return "Vehicle brand is required.";
      if (!form.model.trim()) return "Vehicle model is required.";
      if (form.year && !/^\d{4}$/.test(form.year)) return "Vehicle year must be a 4-digit year.";
    }
    if (step === 3) {
      if (!form.serviceType) return "Select service request type.";
      if (!form.location.trim()) return "Location is required.";
    }
    if (step === 4) {
      if (!files.rc) return "RC document is mandatory for all service requests.";
      if (isAccident && !files.dl) return "Driving License is mandatory for accident requests.";
      if (isAccident && files.photos.length === 0) return "Damage photos are mandatory for accident requests.";
    }
    return "";
  }

  function nextStep() {
    const error = validateCurrentStep();
    if (error) {
      toast("error", error);
      return;
    }
    setStep((current) => Math.min(current + 1, 4));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit() {
    const error = validateCurrentStep();
    if (error) {
      toast("error", error);
      return;
    }

    setSaving(true);
    try {
      const documents = [
        ...(files.rc ? [{ file: files.rc, type: "RC_DOCUMENT" }] : []),
        ...(files.insurance ? [{ file: files.insurance, type: "INSURANCE_DOCUMENT" }] : []),
        ...(files.dl ? [{ file: files.dl, type: "OTHER" }] : []),
        ...files.photos.map((file) => ({ file, type: "VEHICLE_PHOTO" })),
        ...files.videos.map((file) => ({ file, type: "VEHICLE_PHOTO" })),
        ...files.other.map((file) => ({ file, type: "OTHER" })),
      ];
      const request = await operationsApi.createLeadWithDocuments({
        ...form,
        services: [form.serviceType],
        year: form.year ? Number(form.year) : undefined,
      }, documents);

      toast("success", `${entityLabel} ${request.leadId} created successfully.`);
      router.push(actor === "customer" ? `/dashboard/customer/track/${request.id}` : `/dashboard/sales/leads/${request.id}`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Service request creation failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-[#e3daf7] bg-white shadow-[0_24px_70px_rgba(111,43,255,0.12)]">
      <div className="border-b border-[#eee8fb] p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7e88b5]">{isCustomer ? "Guest Customer Request" : "Sales Partner Lead Entry"}</p>
        <h1 className="mt-1 text-3xl font-black text-[#0f144a]">{isCustomer ? "Create Service Request" : "Create Lead / Case"}</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold text-[#6370a4]">
          {isCustomer ? "Create a customer service request" : "Create an internal customer lead/case"} with confirmed document rules. RC is mandatory; accident cases also require Driving License and damage photos.
        </p>
      </div>

      <div className="grid gap-3 p-6 md:grid-cols-4">
        {["Customer Info", "Vehicle Info", "Service Type", "Documents"].map((label, index) => {
          const active = step === index + 1;
          const done = step > index + 1;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index + 1)}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                active
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#e4dcf8] bg-white text-[#42508a]"
              }`}
            >
              {done ? <CheckCircle2 className="mr-1 inline h-4 w-4" /> : null}
              {index + 1}. {label}
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-6">
        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Customer Name" value={form.name} onChange={(value) => setField("name", value)} required />
            <Input label="Mobile Number" value={form.mobile} onChange={(value) => setField("mobile", value)} required />
            <Input label="Email Address" value={form.email} onChange={(value) => setField("email", value)} />
            <Input label="Address" value={form.address} onChange={(value) => setField("address", value)} />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Vehicle Number" value={form.vehicleNumber} onChange={(value) => setField("vehicleNumber", value.toUpperCase())} required />
            <Input label="Vehicle Brand" value={form.brand} onChange={(value) => setField("brand", value)} required />
            <Input label="Vehicle Model" value={form.model} onChange={(value) => setField("model", value)} required />
            <Input label="Manufacturing Year" value={form.year} onChange={(value) => setField("year", value.replace(/\D/g, "").slice(0, 4))} placeholder="2022" />
            <Input label="Vehicle Color" value={form.color} onChange={(value) => setField("color", value)} />
            <Select label="Fuel Type" value={form.fuelType} options={fuelTypes} onChange={(value) => setField("fuelType", value)} />
            <Input label="Insurance Company" value={form.insuranceCompany} onChange={(value) => setField("insuranceCompany", value)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-[#0f144a]">Select Service Request Type</h2>
              <p className="mt-1 text-sm font-semibold text-[#6370a4]">
                {isCustomer ? "Guest customers can opt for all services directly." : "Select the service required by the customer."} Accident cases require extra mandatory documents.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {serviceOptions.map((service) => {
                const Icon = service.icon;
                const selected = form.serviceType === service.value;
                return (
                  <button
                    key={service.value}
                    type="button"
                    onClick={() => setField("serviceType", service.value)}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      selected ? "border-violet-400 bg-violet-50 shadow-[0_14px_34px_rgba(111,43,255,0.14)]" : "border-[#eee8fb] bg-white hover:bg-[#faf8ff]"
                    }`}
                  >
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${selected ? "bg-mechpro-gradient text-white" : "bg-[#f3edff] text-violet-700"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 font-black text-[#0f144a]">{service.label}</p>
                    <p className="mt-1 text-xs font-semibold text-[#6370a4]">{service.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Priority" value={form.priority} options={priorities} onChange={(value) => setField("priority", value as UiPriority)} />
              <Input label="Location / City" value={form.location} onChange={(value) => setField("location", value)} required />
              <Textarea label="Notes" value={form.notes} onChange={(value) => setField("notes", value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-violet-100 bg-[#faf8ff] p-4">
              <h2 className="text-lg font-black text-[#0f144a]">Document Rules</h2>
              <div className="mt-3 grid gap-3 text-sm font-bold text-[#42508a] md:grid-cols-3">
                <Rule icon={<FileText className="h-4 w-4" />} text="RC mandatory for all requests" />
                <Rule icon={<ShieldAlert className="h-4 w-4" />} text="Accident: DL mandatory" />
                <Rule icon={<ImageIcon className="h-4 w-4" />} text="Accident: damage photos mandatory" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FilePicker label="RC Document" required fileName={files.rc?.name} onChange={(file) => setFiles((current) => ({ ...current, rc: file }))} />
              <FilePicker label="Insurance Policy" fileName={files.insurance?.name} onChange={(file) => setFiles((current) => ({ ...current, insurance: file }))} />
              <FilePicker label="Driving License" required={isAccident} fileName={files.dl?.name} onChange={(file) => setFiles((current) => ({ ...current, dl: file }))} />
              <MultiFilePicker label="Damage / Vehicle Photos" required={isAccident} files={files.photos} accept="image/*" cameraLabel="Take Damage Photo" onChange={(next) => setFiles((current) => ({ ...current, photos: next }))} />
              <MultiFilePicker label="Accident / Vehicle Video" files={files.videos} accept="video/*" video cameraLabel="Record Video" onChange={(next) => setFiles((current) => ({ ...current, videos: next }))} />
              <MultiFilePicker label="Other Documents" files={files.other} onChange={(next) => setFiles((current) => ({ ...current, other: next }))} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee8fb] p-6">
        <button type="button" onClick={previousStep} disabled={step === 1 || saving} className="rounded-2xl border border-[#ded4f6] px-5 py-3 text-sm font-black text-violet-700 disabled:opacity-40">
          Back
        </button>
        {step < 4 ? (
          <button type="button" onClick={nextStep} className="rounded-2xl bg-mechpro-gradient px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(111,43,255,0.24)]">
            Continue
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={saving} className="rounded-2xl bg-mechpro-gradient px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(111,43,255,0.24)] disabled:opacity-60">
            {saving ? "Submitting..." : isCustomer ? "Submit Service Request" : "Submit Lead / Case"}
          </button>
        )}
      </div>
    </section>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">{icon}<span>{text}</span></div>;
}

function Input({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#0f144a]">{label}{required ? <span className="text-pink-600"> *</span> : null}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-[#ded4f6] px-4 text-sm font-bold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#0f144a]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-[#ded4f6] bg-white px-4 text-sm font-bold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block md:col-span-2">
      <span className="text-sm font-black text-[#0f144a]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-[#ded4f6] px-4 py-3 text-sm font-bold text-[#19204f] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
    </label>
  );
}

function FilePicker({ label, required, fileName, onChange }: { label: string; required?: boolean; fileName?: string; onChange: (file?: File) => void }) {
  const [preview, setPreview] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  async function handleFile(file?: File) {
    const preparedFile = await compressImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(preparedFile?.type.startsWith("image/") ? URL.createObjectURL(preparedFile) : "");
    setSelectedSize(preparedFile ? `${Math.max(1, Math.round(preparedFile.size / 1024))} KB` : "");
    onChange(preparedFile);
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setSelectedSize("");
    onChange(undefined);
  }

  return (
    <div className="block rounded-2xl border border-dashed border-[#cdbdf4] bg-[#fbf9ff] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#0f144a]">{label}{required ? <span className="text-pink-600"> *</span> : null}</span>
        {fileName && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">Selected</span>}
      </div>
      {preview && <img src={preview} alt={`${label} preview`} className="mt-3 h-28 w-full rounded-xl border border-[#eee8fb] object-cover" />}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700">
          <Camera className="h-4 w-4" /> {fileName ? "Retake Photo" : "Take Photo"}
          <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700">
          <Upload className="h-4 w-4" /> {fileName ? "Replace File" : "Upload File"}
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-bold text-[#6370a4]">{fileName ? `${fileName}${selectedSize ? ` · ${selectedSize}` : ""}` : "No file selected"}</p>
        {fileName && <button type="button" onClick={clearFile} className="shrink-0 rounded-full bg-white p-1.5 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>
    </div>
  );
}

function MultiFilePicker({ label, required, files, accept, video, cameraLabel, onChange }: { label: string; required?: boolean; files: File[]; accept?: string; video?: boolean; cameraLabel?: string; onChange: (files: File[]) => void }) {
  async function append(nextFiles: File[]) {
    const preparedFiles = video ? nextFiles : await compressImageFiles(nextFiles);
    onChange([...files, ...preparedFiles]);
  }

  return (
    <div className="block rounded-2xl border border-dashed border-[#cdbdf4] bg-[#fbf9ff] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#0f144a]">{label}{required ? <span className="text-pink-600"> *</span> : null}</span>
        {files.length > 0 && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">{files.length} selected</span>}
      </div>
      {!video && files.some((file) => file.type.startsWith("image/")) && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {files.filter((file) => file.type.startsWith("image/")).slice(0, 3).map((file, index) => (
            <ImagePreview key={`${file.name}-${index}`} file={file} />
          ))}
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700">
          {video ? <Video className="h-4 w-4" /> : <Camera className="h-4 w-4" />} {files.length ? <RotateCcw className="h-3.5 w-3.5" /> : null} {cameraLabel || (video ? "Record Video" : "Take Photo")}
          <input type="file" className="hidden" accept={video ? "video/*" : "image/*"} capture="environment" onChange={(event) => append(Array.from(event.target.files || []))} />
        </label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700">
          <Upload className="h-4 w-4" /> Upload Files
          <input type="file" multiple className="hidden" accept={accept || ".pdf,.jpg,.jpeg,.png,.mp4,.mov"} onChange={(event) => append(Array.from(event.target.files || []))} />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {files.length === 0 && <span className="text-xs font-bold text-[#6370a4]">No files selected</span>}
        {files.map((file, index) => (
          <button key={`${file.name}-${index}`} type="button" onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))} className="max-w-full truncate rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6370a4] hover:text-red-600">
            {file.name} · {Math.max(1, Math.round(file.size / 1024))} KB x
          </button>
        ))}
      </div>
    </div>
  );
}

function ImagePreview({ file }: { file: File }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const nextSrc = URL.createObjectURL(file);
    setSrc(nextSrc);
    return () => URL.revokeObjectURL(nextSrc);
  }, [file]);

  if (!src) return null;
  return <img src={src} alt={file.name} className="h-20 w-full rounded-xl border border-[#eee8fb] object-cover" />;
}
