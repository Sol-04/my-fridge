"use client";

// Các ô nhập dùng chung cho form: nút chọn (Chip), ô số, ô chữ, ô mật khẩu có nút hiện/ẩn.
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui";

const inputBase =
  "min-h-14 w-full rounded-2xl border-2 bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-500";

// Ô chọn dạng nút (giới tính, mục tiêu, thực phẩm...)
export function Chip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-12 rounded-2xl border-2 px-4 text-sm font-semibold transition active:scale-[0.98] ${
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-brand-100 bg-white text-ink hover:border-brand-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function NumberField({
  label,
  unit,
  value,
  onChange,
  limits,
  name,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  limits: { min: number; max: number };
  name?: string;
}) {
  const n = Number(value);
  const invalid = value !== "" && !(n >= limits.min && n <= limits.max);
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          name={name}
          min={limits.min}
          max={limits.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className={`${inputBase} text-lg font-semibold ${invalid ? "border-red-300 bg-red-50" : "border-brand-100"}`}
        />
        <span className="w-8 shrink-0 text-sm text-muted">{unit}</span>
      </div>
      {invalid && (
        <span className="mt-1 block text-sm text-red-700">
          Vui lòng nhập từ {limits.min} đến {limits.max} {unit}
        </span>
      )}
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, className = "", ...props }: TextFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`mt-1 ${inputBase} ${error ? "border-red-300 bg-red-50" : "border-brand-100"} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [show, setShow] = useState(false);
  const id = useId();
  const { label, error, hint, className = "", ...rest } = props;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${inputBase} pr-20 ${error ? "border-red-300 bg-red-50" : "border-brand-100"} ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute inset-y-1 right-1 min-w-16 rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          {show ? "Ẩn" : "Hiện"}
        </button>
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Nút gửi form, tự hiện "đang xử lý" khi form đang gửi.
export function SubmitButton({ children, pendingText = "Đang xử lý…", className = "" }: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "lg", `w-full ${className}`)}>
      {pending ? (
        <>
          <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
