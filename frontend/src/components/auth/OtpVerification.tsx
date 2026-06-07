"use client";

import Link from "next/link";
import { useState } from "react";

export function OtpVerification() {
  const [values, setValues] = useState(["4", "8", "2", "", "", ""]);
  const [verified, setVerified] = useState(false);

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[#e8e4f4] bg-white p-7 text-center shadow-[0_24px_70px_rgba(124,58,237,0.14)] sm:p-9">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-200 bg-[#f8f7ff] text-3xl text-violet-600">▯</div>
      <h1 className="mt-6 text-3xl font-black tracking-[-.04em] text-[#0f0f1a]">Verify Your Login</h1>
      <p className="mt-2 text-sm font-medium text-[#64748b]">Enter the 6-digit OTP sent to <span className="font-black text-violet-600">+91 98765 43210</span></p>

      <div className="mt-7 grid grid-cols-6 gap-3">
        {values.map((value, index) => (
          <input key={index} value={value} onChange={(event) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value.slice(-1) : item))} maxLength={1} className="h-12 rounded-xl border border-[#e8e4f4] bg-white text-center text-xl font-black text-[#0f0f1a] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        ))}
      </div>

      <p className="mt-5 text-sm font-semibold text-[#64748b]">OTP expires in <span className="font-black text-violet-600">02:34</span></p>

      {!verified ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700">Invalid OTP. Please check and try again.</div> : <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700">OTP verified successfully.</div>}

      <button onClick={() => setVerified(true)} className="mt-4 w-full rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5">Verify OTP</button>
      <button className="mt-3 w-full rounded-xl border border-[#e8e4f4] bg-[#f8f7ff] px-4 py-3.5 text-sm font-black text-[#0f0f1a] transition hover:bg-white">Resend OTP</button>
      <p className="mt-5 text-xs font-semibold text-[#64748b]">Didn&apos;t receive? Check spam folder or <Link href="/auth/forgot-password" className="text-violet-600">change email</Link></p>
    </div>
  );
}
