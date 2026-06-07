"use client";

import { motion } from "framer-motion";
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
  return (
    <main className="min-h-screen bg-[#f5f1ff]">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} active={activeItem} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar roleLabel={roleLabel} />
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 space-y-5 p-4 sm:p-6"
          >
            {children}
          </motion.section>
        </div>
      </div>
    </main>
  );
}
