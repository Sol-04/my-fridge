import Link from "next/link";
import { Suspense } from "react";

import { HeaderNav, HeaderNavItems } from "./HeaderNav";

// Menu điều hướng: logo + liên kết + nút "Tạo thực đơn". Dính ở đầu màn hình khi cuộn.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-1 px-4 sm:gap-2">
        <Link href="/" className="mr-auto flex min-h-11 shrink-0 items-center gap-1.5 font-extrabold whitespace-nowrap text-brand-700 sm:gap-2">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-lg sm:h-9 sm:w-9 sm:text-xl">
            🥬
          </span>
          <span className="text-base tracking-tight sm:text-lg">My Fridge</span>
        </Link>
        {/* Bản chưa tô đậm mục đang xem được tạo sẵn; mục đang xem được tô đậm khi trang mở ra */}
        <Suspense fallback={<HeaderNavItems pathname={null} />}>
          <HeaderNav />
        </Suspense>
      </div>
    </header>
  );
}
