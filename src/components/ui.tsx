// Các khối giao diện dùng chung: nút bấm, thông báo, trạng thái rỗng, khung "đang tải".
// Phong cách "tối giản êm dịu" — xem DESIGN.md.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Icon, Icons, type LucideIcon } from "@/components/icons";

// ---------- Nút bấm ----------
type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "md" | "lg";

// Kiểu chữ & màu cho nút. Chiều cao tối thiểu 48px (md) / 56px (lg) để dễ chạm trên điện thoại.
// Bo góc 16px; di chuột: đậm hơn + bóng nhẹ; khi bấm: lún xuống 1px.
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
  const sizes: Record<Size, string> = {
    md: "min-h-12 px-5 text-base",
    lg: "min-h-14 px-7 text-lg",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lift disabled:bg-stone-300 disabled:text-stone-600 disabled:shadow-none disabled:opacity-100",
    secondary: "border-[1.5px] border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50",
    ghost: "text-brand-700 hover:bg-brand-50",
    light: "bg-white text-brand-700 hover:bg-brand-50 hover:shadow-lift", // dùng trên nền xanh
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

// ---------- 3 chấm "đang xử lý" (thay cho vòng xoay) ----------
export function PendingDots() {
  return (
    <span aria-hidden className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-dots rounded-full bg-current"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

// ---------- Thông báo ----------
type Tone = "error" | "warning" | "info" | "success";
const TONES: Record<Tone, { box: string; iconBox: string; icon: LucideIcon }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", iconBox: "bg-white text-red-700", icon: Icons.error },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", iconBox: "bg-white text-amber-800", icon: Icons.warning },
  info: { box: "border-aqua-100 bg-aqua-50 text-brand-900", iconBox: "bg-white text-aqua-800", icon: Icons.info },
  success: { box: "border-brand-200 bg-mint-50 text-brand-900", iconBox: "bg-white text-brand-700", icon: Icons.success },
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
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${t.box}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.iconBox}`}>
        <Icon icon={icon ?? t.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1 pt-1">
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
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-[1.5px] border-dashed border-line bg-white px-6 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-aqua-50 text-aqua-800">
        <Icon icon={icon} size={30} strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------- Khung "đang tải" ----------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-2xl ${className}`} />;
}

export function LoadingLabel({ children = "Đang tải…" }: { children?: ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span className="text-brand-500">
        <PendingDots />
      </span>
      {children}
    </p>
  );
}

// ---------- Tiêu đề trang ----------
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="animate-enter">
      {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand-600">{eyebrow}</p>}
      <h1 className="mt-1 text-[2.25rem] leading-tight font-bold tracking-tight text-ink">{title}</h1>
      {children && <p className="mt-2 max-w-[72ch] text-base text-muted">{children}</p>}
    </header>
  );
}

// ---------- Thẻ ----------
export const cardClass = "rounded-3xl border border-line bg-white shadow-soft";
