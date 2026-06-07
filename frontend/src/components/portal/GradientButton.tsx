import type { ButtonHTMLAttributes, ReactNode } from "react";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonClassName(variant: GradientButtonProps["variant"] = "primary") {
  if (variant === "ghost") {
    return "border border-[#d8cff3] bg-white text-[#1a1e4f] shadow-[0_8px_24px_rgba(31,24,60,0.06)] hover:border-violet-300";
  }

  if (variant === "secondary") {
    return "border border-violet-200 bg-[#f8f5ff] text-[#4a2aa8] shadow-[0_8px_24px_rgba(31,24,60,0.06)] hover:bg-white";
  }

  return "border border-transparent bg-mechpro-gradient text-white shadow-[0_12px_36px_rgba(111,43,255,0.35)]";
}

export function GradientButton({
  children,
  fullWidth = true,
  className = "",
  variant = "primary",
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`relative h-[50px] overflow-hidden rounded-[15px] px-4 text-[15px] font-bold transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[54px] sm:rounded-[16px] sm:px-5 sm:text-base ${fullWidth ? "w-full" : ""} ${buttonClassName(variant)} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
