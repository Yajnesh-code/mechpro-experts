"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";

type PasswordFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder: string;
  register: UseFormRegister<T>;
  error?: FieldError;
};

export function PasswordField<T extends FieldValues>({
  name,
  label,
  placeholder,
  register,
  error,
}: PasswordFieldProps<T>) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-extrabold text-[#11153d] sm:text-[16px]">{label}</span>
      <div className={`flex h-[50px] items-center gap-2.5 rounded-[15px] border bg-white px-3.5 transition sm:h-[54px] sm:gap-3 sm:rounded-[16px] sm:px-4 ${error ? "border-red-300 ring-2 ring-red-100" : "border-[#d8cef2] hover:border-violet-300 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100/70"}`}>
        <Lock className="h-4.5 w-4.5 text-violet-500 sm:h-5 sm:w-5" strokeWidth={2} />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] font-medium text-[#1a1e4f] outline-none placeholder:text-[#8a90b5] sm:text-base"
          {...register(name)}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="text-[#6770a6] hover:text-violet-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" /> : <Eye className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-500 sm:text-sm">{error.message}</p>}
    </label>
  );
}
