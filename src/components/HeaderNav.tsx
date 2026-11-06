"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Các liên kết trong menu; mục ứng với trang đang xem có gạch chỉ báo màu xanh bên dưới.
export function HeaderNav() {
  return <HeaderNavItems pathname={usePathname()} />;
}

export function HeaderNavItems({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname != null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string, extra: string) =>
    `relative min-h-11 items-center px-2.5 text-sm whitespace-nowrap transition-colors duration-200 sm:px-3 ${extra} ${
      isActive(href)
        ? "font-semibold text-brand-700 after:absolute after:inset-x-2.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand-600"
        : "font-medium text-muted hover:text-brand-700"
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
        href="/nhat-ky"
        aria-current={isActive("/nhat-ky") ? "page" : undefined}
        className={linkClass("/nhat-ky", "inline-flex")}
      >
        Nhật ký
      </Link>
      <Link
        href="/tao-thuc-don"
        aria-current={isActive("/tao-thuc-don") ? "page" : undefined}
        className="ml-0.5 inline-flex min-h-11 items-center rounded-2xl bg-brand-600 px-3 text-sm font-semibold whitespace-nowrap text-white transition duration-200 hover:bg-brand-700 hover:shadow-lift sm:ml-1 sm:px-4"
      >
        <span className="sm:hidden">Thực đơn</span>
        <span className="hidden sm:inline">Tạo thực đơn</span>
      </Link>
    </nav>
  );
}
