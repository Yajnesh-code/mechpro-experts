"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type PasswordResetFormProps = { mode: "forgot" | "reset" };

export function PasswordResetForm({ mode }: PasswordResetFormProps) {
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState("mechprosecure123");

  const strength = useMemo(() => {
    if (password.length > 11) return "Strong password";
    if (password.length > 7) return "Medium password";
    return "Weak password";
  }, [password]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#e8e4f4] bg-white p-7 shadow-[0_24px_70px_rgba(124,58,237,0.14)] sm:p-9">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-14 items-center justify-center rounded-2xl bg-[#f8f7ff] text-sm font-black text-violet-600 ring-1 ring-violet-100">ME</span>
        <span><span className="block text-sm font-black text-[#0f0f1a]">MechPro Experts</span><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#94a3b8]">B2B2C Automotive Platform</span></span>
      </div>

      <h1 className="mt-8 text-3xl font-black tracking-[-.04em] text-[#0f0f1a]">{mode === "forgot" ? "Reset your password" : "Create new password"}</h1>
      <p className="mt-2 text-sm font-medium text-[#64748b]">{mode === "forgot" ? "Enter your registered email and we will send secure reset instructions." : "Choose a strong password to secure your account."}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "forgot" ? <Field label="Email Address" defaultValue="rajesh@techcorp.in" type="email" /> : <><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[#64748b]">New Password</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label><div className="grid grid-cols-3 gap-1"><span className="h-1 rounded-full bg-emerald-400" /><span className={`h-1 rounded-full ${password.length > 7 ? "bg-emerald-400" : "bg-[#e8e4f4]"}`} /><span className={`h-1 rounded-full ${password.length > 11 ? "bg-emerald-400" : "bg-[#e8e4f4]"}`} /></div><p className="text-xs font-semibold text-emerald-600">{strength}</p><Field label="Confirm New Password" defaultValue="mechprosecure123" type="password" /></>}

        {sent && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{mode === "forgot" ? "Reset link sent successfully." : "Password updated successfully. Redirecting to login..."}</div>}

        <button type="submit" className="w-full rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5">{mode === "forgot" ? "Send Reset Link" : "Reset Password"}</button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold"><Link href="/auth/login" className="text-violet-600 hover:text-fuchsia-500">Return to Login</Link></p>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[#64748b]">{label}</span><input type={type} defaultValue={defaultValue} className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 text-base font-bold text-[#0f0f1a] outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label>;
}
