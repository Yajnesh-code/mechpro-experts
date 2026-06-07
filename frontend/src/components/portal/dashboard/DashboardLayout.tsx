"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
  sidebarItems: string[];
  activeItem: string;
  roleLabel: string;
};

export function DashboardLayout({ children, sidebarItems, activeItem, roleLabel }: DashboardLayoutProps) {
  const pathname = usePathname();
  const role = (pathname || "/dashboard/admin").split("/")[2] || "admin";
  const labelFor = (item: string) => {
    const key = item.toLowerCase();
    if (key === "leads" && role === "service") return "Jobs";
    if (key === "leads" && role === "customer") return "Track";
    if (key === "leads") return "Leads";
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
    <main className="min-h-screen bg-[#f5f1ff]">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} active={activeItem} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar roleLabel={roleLabel} />
          <nav className="border-b border-[#ece5fb] bg-white px-3 py-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sidebarItems.map((item) => {
                const isActive = item === activeItem;
                return (
                  <Link
                    key={item}
                    href={hrefFor(item)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${isActive ? "bg-mechpro-gradient text-white shadow-[0_10px_24px_rgba(111,43,255,0.24)]" : "border border-[#e1d8f6] bg-[#faf8ff] text-[#435080]"}`}
                  >
                    {labelFor(item)}
                  </Link>
                );
              })}
            </div>
          </nav>
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 space-y-4 p-3 sm:space-y-5 sm:p-6"
          >
            {children}
          </motion.section>
        </div>
      </div>
    </main>
  );
}
