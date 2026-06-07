"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { roleConfigs, type UserRole } from "@/lib/auth";
import { authApi, saveAuthSession } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedRole = roleConfigs.find((item) => item.value === role) ?? roleConfigs[0];

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const remember_me = form.get("remember_me") === "on";

    try {
      const auth = await authApi.login({ email, password, remember_me });
      saveAuthSession(auth);
      const realRole = roleConfigs.find((item) => item.value === auth.user.role) ?? selectedRole;
      router.push(realRole.dashboardPath);
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message}. Demo redirect is active for UI review.` : "Demo redirect is active for UI review.");
      window.setTimeout(() => router.push(selectedRole.dashboardPath), 650);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-[1.75rem] border border-[#e8e4f4] bg-white p-5 shadow-[0_18px_55px_rgba(15,15,26,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-violet-100 bg-[#f8f7ff] px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-violet-600">Secure portal</span>
          <span className="hidden text-xs font-black uppercase tracking-[.14em] text-emerald-600 sm:inline">Protected access</span>
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-[-.04em] text-[#0f0f1a] sm:text-4xl">Login to MechPro Experts</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[#64748b]">Access your role-based workspace for claims, service operations, partner jobs, approvals, and payments.</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-[#64748b]">Email Address</label>
          <input name="email" className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none transition placeholder:text-[#94a3b8] focus:border-violet-400 focus:ring-4 focus:ring-violet-100" type="email" defaultValue="admin@mechproexperts.in" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-[#64748b]">Password</label>
          <div className="flex items-center rounded-xl border border-[#e8e4f4] bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
            <input name="password" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none" type={showPassword ? "text" : "password"} defaultValue="admin12345" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-[#94a3b8] hover:text-violet-600" aria-label="Show password">◎</button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 font-semibold text-[#64748b]">
            <input name="remember_me" type="checkbox" defaultChecked className="h-4 w-4 accent-violet-600" /> Remember me
          </label>
          <Link href="/auth/forgot-password" className="font-black text-violet-600 hover:text-fuchsia-500">Forgot password?</Link>
        </div>

        <button type="submit" className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70" disabled={loading}>
          {loading ? "Verifying access..." : "Login to Dashboard"}
        </button>

        {notice && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{notice}</div>}

        <div className="flex items-center gap-3 text-xs font-semibold text-[#94a3b8]"><span className="h-px flex-1 bg-[#e8e4f4]" />or<span className="h-px flex-1 bg-[#e8e4f4]" /></div>

        <Link href="/auth/otp-verification" className="flex w-full items-center justify-center rounded-xl border border-[#e8e4f4] bg-[#f8f7ff] px-4 py-3.5 text-sm font-black text-[#0f0f1a] transition hover:border-violet-300 hover:bg-white">Login with Mobile OTP</Link>
        </form>

        <div className="mt-7 rounded-2xl border border-[#e8e4f4] bg-[#f8f7ff] p-4">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#64748b]">Demo role preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roleConfigs.map((item) => (
              <button key={item.value} type="button" onClick={() => setRole(item.value)} className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${role === item.value ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "bg-white text-[#64748b] ring-1 ring-[#e8e4f4] hover:text-violet-600"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-7 text-center text-sm font-semibold text-[#64748b]">New to MechPro? <Link href="/auth/register" className="font-black text-violet-600 hover:text-fuchsia-500">Register your business -&gt;</Link></p>
      </div>
    </div>
  );
}
