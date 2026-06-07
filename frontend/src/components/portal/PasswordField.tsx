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
      <span className="mb-1.5 block text-[16px] font-extrabold text-[#11153d]">{label}</span>
      <div className={`flex h-[54px] items-center gap-3 rounded-[16px] border bg-white px-4 transition ${error ? "border-red-300 ring-2 ring-red-100" : "border-[#d8cef2] hover:border-violet-300 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100/70"}`}>
        <Lock className="h-5 w-5 text-violet-500" strokeWidth={2} />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-medium text-[#1a1e4f] outline-none placeholder:text-[#8a90b5]"
          {...register(name)}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="text-[#6770a6] hover:text-violet-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm font-semibold text-red-500">{error.message}</p>}
    </label>
  );
}
