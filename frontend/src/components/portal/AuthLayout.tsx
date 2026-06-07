"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { trustLabels, type PortalRole } from "@/lib/portal-data";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  heroRole?: PortalRole;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#f2edff_0%,#f8f6ff_45%,#fbfbff_100%)] px-2.5 py-2.5 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-20px)] w-full max-w-[1540px] overflow-hidden rounded-[26px] border border-[#ddd6f2] bg-white shadow-[0_22px_70px_rgba(18,15,35,0.11)] sm:rounded-[32px] lg:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <aside className="relative h-[310px] w-full self-stretch overflow-hidden border-b border-[#ece7fa] bg-[#f4efff] sm:h-[420px] md:h-[520px] lg:h-auto lg:min-h-[calc(100vh-48px)] lg:border-b-0 lg:border-r lg:border-[#ece7fa]">
          <Image
            src="/images/auth-left-hero-generated.png"
            alt="MechPro Experts premium automotive claim management hero"
            fill
            priority
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover object-top lg:object-fill"
          />
        </aside>

        <section className="relative flex items-start bg-white p-3 sm:p-5 lg:items-center lg:p-6">
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mx-auto w-full max-w-[620px]">
            <div className="rounded-[24px] border border-[#e3daf7] bg-white p-4 shadow-[0_16px_44px_rgba(111,43,255,0.09)] sm:rounded-[30px] sm:p-6 lg:p-7">
              <h1 className="text-[26px] font-black leading-[1.08] tracking-[-0.03em] text-[#0f144a] sm:text-[36px] lg:text-[40px]">{title}</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-[#4f5a8d] sm:text-base sm:leading-7">{subtitle}</p>
              <div className="mt-4 sm:mt-6">{children}</div>
              <div className="mt-4 border-t border-[#ebe5fa] pt-3 sm:mt-5 sm:pt-4">
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-[#4a568d] sm:gap-3 sm:text-sm">
                  {trustLabels.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-violet-600 sm:h-4 sm:w-4" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
