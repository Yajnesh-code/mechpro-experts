import Link from "next/link";
import { type ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-mechpro-gradient text-white border-transparent shadow-lg shadow-fuchsia-500/25 hover:-translate-y-0.5"
      : "bg-white/70 text-mechpro-ink border border-mechpro-purple/25 hover:border-mechpro-magenta/45";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${styles}`}
    >
      {children}
    </Link>
  );
}
