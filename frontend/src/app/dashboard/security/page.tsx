import { StatusBadge } from "@/components/dashboard/RoleBadge";

const sessions = [
  ["MacBook Pro - Chrome", "Mumbai, MH", "103.21.88.x", "Today 09:31", "Current"],
  ["iPhone 14 - Safari", "Thane, MH", "49.36.12.x", "Today 07:14", "Success"],
  ["Windows PC - Edge", "Palghar, MH", "122.15.6.x", "Yesterday", "Suspicious"],
];

export default function SecuritySettingsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white px-4 py-10 text-[#0f0f1a]">
      <div className="pointer-events-none fixed -right-28 -top-24 h-[460px] w-[460px] rounded-full bg-violet-100 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-5 lg:grid-cols-[.9fr_1.2fr]">
        <section className="rounded-3xl border border-[#e8e4f4] bg-white p-6 shadow-[0_18px_50px_rgba(124,58,237,0.1)]">
          <div className="flex items-center justify-between"><h1 className="text-xl font-black">Change Password</h1><button className="text-sm font-black text-violet-600">Update</button></div>
          {["Current Password", "New Password", "Confirm Password"].map((label) => <label key={label} className="mt-4 block"><span className="mb-2 block text-xs font-black uppercase text-[#64748b]">{label}</span><input type="password" defaultValue="mechpro123" className="w-full rounded-xl border border-[#e8e4f4] bg-white px-4 py-3 font-bold outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label>)}
          <div className="mt-3 grid grid-cols-3 gap-1"><span className="h-1 rounded-full bg-emerald-400" /><span className="h-1 rounded-full bg-emerald-400" /><span className="h-1 rounded-full bg-emerald-400" /></div>
          <button className="mt-5 w-full rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)]">Update Password</button>
        </section>

        <section className="rounded-3xl border border-[#e8e4f4] bg-white p-6 shadow-[0_18px_50px_rgba(124,58,237,0.1)]">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Login Sessions</h2><button className="text-sm font-black text-violet-600">Sign out all</button></div>
          <div className="mt-4 space-y-4">
            {sessions.map(([device, location, ip, date, status]) => <div key={device} className="flex items-center gap-4 border-b border-[#e8e4f4] pb-4 last:border-0"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f7ff] text-violet-600">▯</span><span className="flex-1"><span className="block font-black">{device}</span><span className="block text-xs font-semibold text-[#64748b]">{location} · {ip} · {date}</span></span><StatusBadge label={status} tone={status === "Suspicious" ? "red" : "green"} /></div>)}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e8e4f4] bg-white p-6 shadow-[0_18px_50px_rgba(124,58,237,0.1)]">
          <h2 className="text-xl font-black">Two-Factor Authentication</h2>
          {["Enable 2FA via OTP", "Authenticator App", "Login Alerts via Email"].map((item, index) => <div key={item} className="mt-5 flex items-center justify-between"><span><span className="block font-black">{item}</span><span className="text-xs font-semibold text-[#64748b]">{index === 1 ? "Google/Microsoft Authenticator" : "SMS/email verification at each login"}</span></span><span className={`h-7 w-12 rounded-full p-1 ${index === 1 ? "bg-[#e8e4f4]" : "bg-violet-500"}`}><span className={`block h-5 w-5 rounded-full bg-white shadow ${index === 1 ? "" : "ml-5"}`} /></span></div>)}
        </section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-[0_18px_50px_rgba(239,68,68,0.08)] lg:col-start-2">
          <h2 className="font-black">New login detected from an unknown device</h2>
          <p className="mt-1 text-sm font-semibold">Windows PC from Palghar, MH · 15 min ago. Not you? Secure your account.</p>
        </section>
      </div>
    </main>
  );
}
