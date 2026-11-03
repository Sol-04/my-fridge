"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Các liên kết trong menu; tô đậm mục ứng với trang đang xem.
export function HeaderNav() {
  return <HeaderNavItems pathname={usePathname()} />;
}

export function HeaderNavItems({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname != null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string, extra: string) =>
    `min-h-11 items-center rounded-full px-2.5 text-sm font-medium whitespace-nowrap transition sm:px-3 ${extra} ${
      isActive(href) ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-brand-50 hover:text-brand-700"
    }`;

  return (
    <nav aria-label="Menu chính" className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <Link href="/" aria-current={isActive("/") ? "page" : undefined} className={linkClass("/", "hidden sm:inline-flex")}>
        Trang chủ
      </Link>
      <Link
        href="/mon-an"
        aria-current={isActive("/mon-an") ? "page" : undefined}
        className={linkClass("/mon-an", "inline-flex")}
      >
        Món ăn
      </Link>
      <Link
        href="/tao-thuc-don"
        aria-current={isActive("/tao-thuc-don") ? "page" : undefined}
        className="ml-0.5 inline-flex min-h-11 items-center rounded-full bg-brand-600 px-3.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm hover:bg-brand-700 sm:ml-1 sm:px-4"
      >
        Tạo thực đơn
      </Link>
    </nav>
  );
}
