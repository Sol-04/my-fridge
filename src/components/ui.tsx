// Các khối giao diện dùng chung: nút bấm, thông báo, trạng thái rỗng, khung "đang tải".
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// ---------- Nút bấm ----------
type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "md" | "lg";

// Kiểu chữ & màu cho nút. Chiều cao tối thiểu 48px (md) / 56px (lg) để dễ chạm trên điện thoại.
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const sizes: Record<Size, string> = {
    md: "min-h-12 px-5 text-base",
    lg: "min-h-14 px-7 text-lg",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 disabled:bg-stone-300 disabled:text-stone-600 disabled:shadow-none disabled:opacity-100",
    secondary: "border-2 border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50",
    ghost: "text-brand-700 hover:bg-brand-50",
    light: "bg-white text-brand-700 shadow-sm hover:bg-brand-50", // dùng trên nền xanh
  };
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

export function ButtonLink({
  variant,
  size,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...props} className={buttonClass(variant, size, className)} />;
}

// ---------- Thông báo ----------
type Tone = "error" | "warning" | "info" | "success";
const TONES: Record<Tone, { box: string; icon: string }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: "⚠️" },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: "🛒" },
  info: { box: "border-brand-200 bg-brand-50 text-brand-900", icon: "💡" },
  success: { box: "border-brand-200 bg-brand-50 text-brand-900", icon: "✅" },
};

export function Notice({
  tone = "info",
  title,
  children,
  icon,
  action,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  icon?: string;
  action?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${t.box}`}
    >
      <span aria-hidden className="text-lg leading-none">
        {icon ?? t.icon}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

// ---------- Trạng thái rỗng ----------
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-brand-200 bg-white px-6 py-10 text-center">
      <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        {icon}
      </span>
      <p className="mt-4 text-lg font-semibold text-ink">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------- Khung "đang tải" ----------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-xl ${className}`} />;
}

export function LoadingLabel({ children = "Đang tải…" }: { children?: ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 motion-reduce:animate-none"
      />
      {children}
    </p>
  );
}

// ---------- Tiêu đề trang ----------
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header>
      {eyebrow && <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {children && <p className="mt-2 text-base text-muted">{children}</p>}
    </header>
  );
}
