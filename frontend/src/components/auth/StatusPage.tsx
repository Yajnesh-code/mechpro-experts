import Link from "next/link";
import type { ReactNode } from "react";

type TimelineItem = { label: string; status: "done" | "current" | "pending"; note?: string };

type StatusPageProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tone?: "success" | "warning" | "danger" | "purple";
  timeline?: TimelineItem[];
  info?: string;
  reasons?: string[];
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-600",
  warning: "border-amber-200 bg-amber-50 text-amber-600",
  danger: "border-red-200 bg-red-50 text-red-600",
  purple: "border-violet-200 bg-[#f8f7ff] text-violet-600",
};

export function StatusPage({ icon, title, subtitle, tone = "purple", timeline, info, reasons, primary, secondary }: StatusPageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-white px-4 py-12 text-[#0f0f1a]">
      <div className="pointer-events-none fixed -right-28 -top-24 h-[460px] w-[460px] rounded-full bg-violet-100 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 left-0 h-[360px] w-[360px] rounded-full bg-fuchsia-100 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-[#e8e4f4] bg-white p-7 text-center shadow-[0_24px_70px_rgba(124,58,237,0.14)] sm:p-10">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl ${toneClasses[tone]}`}>{icon}</div>
          <h1 className="mt-6 text-3xl font-black tracking-[-.04em] sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-6 text-[#64748b]">{subtitle}</p>

          {info && <div className="mt-6 rounded-2xl border border-violet-200 bg-[#f8f7ff] px-5 py-4 text-left text-sm font-semibold text-violet-800">{info}</div>}

          {reasons && <div className="mt-6 rounded-2xl border border-[#e8e4f4] bg-[#f8f7ff] p-5 text-left text-sm font-semibold text-[#64748b]"><p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-[#94a3b8]">Possible reasons</p><div className="space-y-2">{reasons.map((reason) => <p key={reason}>• {reason}</p>)}</div></div>}

          {timeline && <div className="mt-7 space-y-4 text-left">{timeline.map((item) => <div key={item.label} className="flex gap-4"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${item.status === "done" ? "border-violet-500 bg-violet-500 text-white" : item.status === "current" ? "border-fuchsia-400 bg-white text-fuchsia-500" : "border-violet-200 bg-white text-violet-200"}`}>{item.status === "done" ? "✓" : ""}</span><span><span className={`block text-sm font-black ${item.status === "current" ? "text-fuchsia-500" : "text-[#0f0f1a]"}`}>{item.label}</span>{item.note && <span className="block text-xs font-semibold text-[#94a3b8]">{item.note}</span>}</span></div>)}</div>}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {primary && <Link href={primary.href} className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5">{primary.label}</Link>}
            {secondary && <Link href={secondary.href} className="rounded-xl border border-[#e8e4f4] bg-[#f8f7ff] px-4 py-3.5 text-sm font-black text-[#0f0f1a] transition hover:bg-white">{secondary.label}</Link>}
          </div>
        </div>
      </div>
    </main>
  );
}
