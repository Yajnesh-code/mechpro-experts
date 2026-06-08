"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { notificationsApi, formatShortDate } from "@/lib/operations";

type TopbarProps = {
  roleLabel: string;
};

const portalEyebrow = (label: string) => {
  if (label.toLowerCase().includes("admin")) return "Operations Portal";
  if (label.toLowerCase().includes("sales")) return "Partner Portal";
  if (label.toLowerCase().includes("service")) return "Service Portal";
  if (label.toLowerCase().includes("customer")) return "Customer Portal";
  return "MechPro Portal";
};

export function Topbar({ roleLabel }: TopbarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    notificationsApi.list().then(setNotifications).catch(() => undefined);
  }, []);

  function handleLogout() {
    logout();
    toast("info", "You have been logged out.");
    router.push("/login");
  }

  return (
    <header className="flex w-full min-w-0 items-center gap-3 border-b border-[#ece5fb] bg-white px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7e88b5] sm:text-xs">{portalEyebrow(roleLabel)}</p>
        <p className="truncate text-lg font-black leading-tight text-[#0f144a] sm:text-xl">{roleLabel}</p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-[#ded5f6] bg-[#faf8ff] px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-[#8993be]" />
          <input placeholder="Search..." className="w-40 bg-transparent text-xs font-semibold text-[#3d477c] outline-none placeholder:text-[#9ca5cb]" />
        </div>
        <div className="relative">
          <button type="button" onClick={() => setOpen((value) => !value)} className="relative rounded-xl border border-[#ded5f6] bg-white p-2 text-[#58639d] hover:border-violet-300">
            <Bell className="h-4 w-4" />
            {notifications.some((item) => !item.readAt) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-pink-500" />}
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[#e5def8] bg-white p-3 shadow-[0_24px_60px_rgba(15,20,74,0.18)]">
              <div className="flex items-center justify-between">
                <p className="font-black text-[#0f144a]">Notifications</p>
                <button className="text-xs font-black text-violet-700" onClick={() => notificationsApi.list().then(setNotifications)}>Refresh</button>
              </div>
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {notifications.length === 0 && <p className="rounded-xl bg-[#faf8ff] p-3 text-sm font-bold text-[#6370a4]">No notifications yet.</p>}
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-xl border p-3 text-left ${item.readAt ? "border-[#eee8fb] bg-white" : "border-violet-100 bg-[#faf8ff]"}`}
                    onClick={async () => {
                      if (!item.readAt) await notificationsApi.markRead(item.id).catch(() => undefined);
                      setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: entry.readAt || new Date().toISOString() } : entry));
                    }}
                  >
                    <p className="text-sm font-black text-[#19204f]">{item.title}</p>
                    <p className="text-xs font-semibold text-[#6370a4]">{item.message}</p>
                    <p className="mt-1 text-[11px] font-bold text-[#8a94bd]">{formatShortDate(item.createdAt)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-[#ded5f6] px-3 py-2 text-xs font-bold text-[#3f4a83] hover:border-violet-300"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
