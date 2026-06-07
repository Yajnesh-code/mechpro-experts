"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { PortalRole } from "@/types/auth";

type ProtectedRouteProps = {
  allowedRole: PortalRole;
  children: ReactNode;
};

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { ready, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!ready) return;

    if (!session) {
      toast("error", "Please login to access your dashboard.");
      router.replace("/login");
      return;
    }

    if (session.role !== allowedRole) {
      toast("error", "You are not authorized to access this dashboard.");
      router.replace("/login");
    }
  }, [allowedRole, ready, router, session, toast]);

  if (!ready || !session || session.role !== allowedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1ff] px-4">
        <div className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 text-center shadow-[0_18px_55px_rgba(111,43,255,0.14)] backdrop-blur">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#e4d9fb] border-t-violet-600" />
          <p className="text-sm font-black text-[#11153d]">Checking secure access...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
