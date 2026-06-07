import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

const proofStats = [
  { value: "500+", label: "Verified workshops" },
  { value: "98%", label: "Claim success rate" },
  { value: "2 hr", label: "Response SLA" },
];

const trustFlow = [
  "Business identity verified",
  "Admin approval before access",
  "Role-based dashboard workspace",
];

export function AuthShell({
  children,
  title = "Secure access to your automotive operations workspace",
  subtitle = "Manage business leads, claims, inspections, partners, quotations, invoices, and service operations from one enterprise platform.",
  compact = false,
}: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#0f0f1a]">
      <div className="pointer-events-none fixed -right-24 -top-28 h-[520px] w-[520px] rounded-full bg-violet-100 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 left-0 h-[420px] w-[420px] rounded-full bg-fuchsia-100 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#e8e4f4] bg-white shadow-[0_30px_90px_rgba(15,15,26,0.10)] lg:grid-cols-[500px_1fr]">
          <aside className={`relative overflow-hidden bg-[#0f0f1a] p-7 text-white sm:p-10 ${compact ? "hidden lg:block" : ""}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.42),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(236,72,153,0.32),transparent_30%),linear-gradient(135deg,#0f0f1a_0%,#22113d_48%,#3b0d3f_100%)]" />
            <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/5 blur-sm" />

            <div className="relative flex h-full min-h-[660px] flex-col">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-14 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-fuchsia-950/20">
                  <Image src="/images/mechpro-logo-clean.png" alt="MechPro Experts logo" width={1047} height={780} className="h-full w-full object-contain" priority />
                </span>
                <span>
                  <span className="block text-base font-black leading-tight">MechPro Experts</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-white/50">B2B2C Automotive Platform</span>
                </span>
              </Link>

              <div className="mt-14 max-w-md">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-white/80 backdrop-blur">Enterprise access</span>
                <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-5xl">{title}</h1>
                <p className="mt-5 text-base leading-7 text-white/68">{subtitle}</p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                    <span className="block bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-2xl font-black text-transparent">{stat.value}</span>
                    <span className="mt-1 block text-[11px] font-semibold leading-4 text-white/54">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[.18em] text-fuchsia-200">Trusted access flow</p>
                <div className="mt-4 space-y-3">
                  {trustFlow.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/72">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-violet-700">0{index + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="relative flex min-h-[680px] items-center bg-white p-5 sm:p-8 lg:p-12">
            <div className="absolute right-8 top-8 hidden opacity-[0.035] sm:block">
              <Image src="/images/mechpro-logo-clean.png" alt="MechPro watermark" width={260} height={190} />
            </div>
            <div className="relative w-full">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
