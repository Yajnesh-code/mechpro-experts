"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  items: string[];
  active: string;
};

export function Sidebar({ items, active }: SidebarProps) {
  const pathname = usePathname();
  const role = (pathname || "/dashboard/admin").split("/")[2] || "admin";
  const labelFor = (item: string) => {
    const key = item.toLowerCase();
    if (key === "leads" && role === "service") return "Assigned Jobs";
    if (key === "leads" && role === "admin") return "Leads / Cases";
    if (key === "leads" && role === "customer") return "Service Requests";
    if (key === "leads") return "Leads / Cases";
    return item;
  };
  const hrefFor = (item: string) => {
    const key = item.toLowerCase();
    if (key === "dashboard") return `/dashboard/${role}`;
    if (role === "customer" && key === "leads") return "/dashboard/customer/track";
    if (role === "service" && key === "leads") return "/dashboard/service/jobs";
    if (key === "leads") return `/dashboard/${role}/leads`;
    if (["users", "partners", "documents", "reports", "billing", "settings"].includes(key)) return `/dashboard/${role}/${key}`;
    return `/dashboard/${role}`;
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-[#e4dcf7] bg-white lg:block">
      <div className="flex items-center gap-3 border-b border-[#ece5fb] px-5 py-5">
        <Image src="/images/mechpro-logo-clean.png" alt="MechPro" width={48} height={38} className="h-9 w-auto" />
        <div>
          <p className="text-base font-black text-[#0f144a]">MechPro Experts</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b95be]">Enterprise Portal</p>
        </div>
      </div>
      <nav className="space-y-2 p-4">
        {items.map((item) => {
          const isActive = item === active;
          return (
            <motion.div
              whileHover={{ x: 2 }}
              key={item}
              className="w-full"
            >
              <Link href={hrefFor(item)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${isActive ? "bg-mechpro-gradient text-white shadow-[0_12px_26px_rgba(111,43,255,0.25)]" : "text-[#2f3a73] hover:bg-[#f7f4ff]"}`}>
                {labelFor(item)}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}

