"use client";

import { motion } from "framer-motion";
import { ShieldCheck, User, UserCog, Wrench } from "lucide-react";
import type { PortalRole } from "@/lib/portal-data";

type RoleSelectorProps = {
  value: PortalRole;
  onChange: (role: PortalRole) => void;
};

const roleIconMap = {
  admin: UserCog,
  sales: User,
  service: Wrench,
  customer: ShieldCheck,
};

const items: { label: string; value: PortalRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "Sales Partner", value: "sales" },
  { label: "Service Partner", value: "service" },
  { label: "Customer", value: "customer" },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <p className="mb-2.5 text-[16px] font-extrabold text-[#11153d]">Select Role</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = roleIconMap[item.value];
          const active = value === item.value;

          return (
            <motion.button
              type="button"
              key={item.value}
              onClick={() => onChange(item.value)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`min-h-[66px] rounded-[16px] border px-2.5 py-2.5 text-center text-[14px] font-bold transition ${active ? "border-violet-400 bg-violet-50 text-violet-700 shadow-[0_12px_26px_rgba(111,43,255,0.18)]" : "border-[#ddd4f5] bg-white text-[#4a4f73] hover:border-violet-300 hover:shadow-[0_10px_22px_rgba(111,43,255,0.12)]"}`}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
