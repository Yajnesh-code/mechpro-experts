"use client";

import { motion } from "framer-motion";

type DashboardCardProps = {
  title: string;
  value: string;
  trend: string;
};

export function DashboardCard({ title, value, trend }: DashboardCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-[#e3daf7] bg-white p-4 shadow-[0_12px_34px_rgba(111,43,255,0.08)]"
    >
      <p className="text-sm font-semibold text-[#6470a2]">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#0f144a]">{value}</p>
      <p className="mt-1 text-xs font-bold text-violet-600">{trend}</p>
    </motion.article>
  );
}
