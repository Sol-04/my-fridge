import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui";

// Khung chung cho các trang đăng nhập / đăng ký: thẻ trắng bo góc ở giữa màn hình.
export function AuthShell({ icon, title, subtitle, children, footer }: {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
        <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl">
          {icon}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
    </main>
  );
}

// Khung "đang tải" của form
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-14 w-full rounded-2xl" />
        </div>
      ))}
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
